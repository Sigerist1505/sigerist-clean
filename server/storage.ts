import { db } from "./db";
import { eq } from "drizzle-orm";
import * as bcrypt from "bcryptjs";
import {
  products,
  cartItems,
  orders,
  contactMessages,
  registeredUsers,
  whatsappSessions,
  emailCampaigns,
  type Product,
  type ProductVariants,
  type InsertProduct,
  type CartItem,
  type InsertCartItem,
  type Order,
  type InsertOrder,
  type ContactMessage,
  type InsertContactMessage,
  type RegisteredUser,
  type InsertRegisteredUser,
  type WhatsappSession,
  type InsertWhatsappSession,
} from "@shared/schema";

export interface IStorage {
  // Products
  getProducts(): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, data: Partial<Product>): Promise<Product | null>;
  deleteProduct(id: number): Promise<boolean>;
  seedProducts(): Promise<void>;

  // Cart Items
  getCartItems(): Promise<CartItem[]>;
  addCartItem(item: InsertCartItem): Promise<CartItem>;
  updateCartItem(id: number, quantity: number): Promise<CartItem | undefined>;
  removeCartItem(id: number): Promise<boolean>;
  clearCart(): Promise<void>;

  // Orders
  createOrder(order: InsertOrder): Promise<Order>;
  getOrders(): Promise<Order[]>;

  // Contact Messages
  createContactMessage(message: InsertContactMessage): Promise<ContactMessage>;

  // User Registration
  createRegisteredUser(user: InsertRegisteredUser): Promise<RegisteredUser>;
  createRegisteredUserWithDiscount(
    user: InsertRegisteredUser,
    discount: { discountCode: string; expirationDate: string }
  ): Promise<RegisteredUser>;
  getRegisteredUserByEmail(email: string): Promise<RegisteredUser | undefined>;
  getRegisteredUsers(): Promise<RegisteredUser[]>;

  // Discount Codes
  validateDiscountCode(code: string): Promise<{ valid: boolean; discount?: number; message?: string }>;
  useDiscountCode(code: string, userId: number): Promise<boolean>;

  // Email Campaigns
  addEmailForFutureCampaigns(data: {
    email: string;
    firstName: string;
    lastName: string;
    discountCode: string;
    registrationDate: string;
    acceptsMarketing: boolean;
  }): Promise<void>;

  // Authentication
  authenticateUser(email: string, password: string): Promise<RegisteredUser | null>;

  // WhatsApp Sessions
  getWhatsappSession(phoneNumber: string): Promise<WhatsappSession | undefined>;
  createWhatsappSession(session: InsertWhatsappSession): Promise<WhatsappSession>;
  updateWhatsappSession(
    phoneNumber: string,
    updates: Partial<InsertWhatsappSession>
  ): Promise<WhatsappSession | undefined>;

  // Bag Templates
  createBagTemplate(template: any): Promise<any>;
  getBagTemplates(): Promise<any[]>;
}

export class DatabaseStorage implements IStorage {
  // Products
  async getProducts(): Promise<Product[]> {
    try {
      // Add test product if it doesn't exist
      const existingTestProduct = await db
        .select()
        .from(products)
        .where(eq(products.name, "Producto de Prueba"));
      if (existingTestProduct.length === 0) {
        await db.insert(products).values({
          name: "Producto de Prueba",
          description: "Producto para probar la pasarela de pagos",
          price: 1000.00,
          imageUrl: "/assets/IMG-20250531-WA0015.jpg",
          blankImageUrl: "/assets/IMG-20250531-WA0015.jpg",
          referenceImageUrl: "/assets/IMG-20250531-WA0015.jpg",
          colors: ["Negro"],
          category: "test",
          inStock: true,
          animalType: null,
          variants: null,
        });
      }

      const dbProducts = await db.select().from(products);
      if (dbProducts.length === 0) {
        await this.initializeSampleProducts();
        const freshProducts = await db.select().from(products);
        return freshProducts.map((p) => ({ ...p, variants: p.variants as ProductVariants }));
      }
      return dbProducts.map((p) => ({ ...p, variants: p.variants as ProductVariants }));
    } catch (error) {
      console.error("Database error, using sample products:", error);
      return this.getSampleProducts();
    }
  }

  private async initializeSampleProducts(): Promise<void> {
    const sampleProducts = this.getSampleProducts();
    for (const product of sampleProducts) {
      try {
        await db.insert(products).values({
          name: product.name,
          description: product.description,
          price: Number(product.price),
          imageUrl: product.imageUrl,
          blankImageUrl: product.blankImageUrl,
          referenceImageUrl: product.referenceImageUrl,
          category: product.category,
          inStock: product.inStock,
          animalType: product.animalType,
          colors: Array.isArray(product.colors)
            ? product.colors.filter((c): c is string => c !== null && c !== undefined)
            : product.colors
            ? [product.colors]
            : undefined,
          variants: product.variants as ProductVariants | null,
        });
      } catch (error) {
        console.error("Error inserting product:", error);
      }
    }
  }

  async getProduct(id: number): Promise<Product | undefined> {
    try {
      const [product] = await db.select().from(products).where(eq(products.id, id));
      return product ? { ...product, variants: product.variants as ProductVariants } : undefined;
    } catch (error) {
      const sampleProducts = this.getSampleProducts();
      return sampleProducts.find((p) => p.id === id);
    }
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const [product] = await db
      .insert(products)
      .values({
        ...insertProduct,
        price: Number(insertProduct.price),
        colors: Array.isArray(insertProduct.colors)
          ? insertProduct.colors.filter((c): c is string => c !== null && c !== undefined)
          : insertProduct.colors
          ? [insertProduct.colors]
          : undefined,
      })
      .returning();
    return product ? { ...product, variants: product.variants as ProductVariants } : product;
  }

  async updateProduct(id: number, data: Partial<Product>): Promise<Product | null> {
    try {
      const [product] = await db
        .update(products)
        .set({
          ...data,
          price: data.price !== undefined ? Number(data.price) : undefined,
          colors: Array.isArray(data.colors)
            ? data.colors.filter((c): c is string => c !== null && c !== undefined)
            : data.colors
            ? [data.colors]
            : undefined,
        })
        .where(eq(products.id, id))
        .returning();
      return product ? { ...product, variants: product.variants as ProductVariants } : null;
    } catch (error) {
      console.error("Error updating product:", error);
      return null;
    }
  }

  async deleteProduct(id: number): Promise<boolean> {
    try {
      await db.delete(products).where(eq(products.id, id));
      return true;
    } catch (error) {
      console.error("Error deleting product:", error);
      return false;
    }
  }

  // Cart Items
  async getCartItems(): Promise<CartItem[]> {
    try {
      return await db.select().from(cartItems);
    } catch (error) {
      console.error("Error fetching cart items:", error);
      return [];
    }
  }

  async addCartItem(insertItem: InsertCartItem): Promise<CartItem> {
    try {
      console.log("Insertando en cartItems:", insertItem);
      const [item] = await db
        .insert(cartItems)
        .values({ ...insertItem, price: Number(insertItem.price) })
        .returning();
      return item;
    } catch (error) {
      console.error("Error adding cart item:", error);
      throw error;
    }
  }

  async updateCartItem(id: number, quantity: number): Promise<CartItem | undefined> {
    const [item] = await db
      .update(cartItems)
      .set({ quantity })
      .where(eq(cartItems.id, id))
      .returning();
    return item;
  }

  async removeCartItem(id: number): Promise<boolean> {
    try {
      await db.delete(cartItems).where(eq(cartItems.id, id));
      return true;
    } catch (error) {
      console.error("Error removing cart item:", error);
      return false;
    }
  }

  async clearCart(): Promise<void> {
    await db.delete(cartItems);
  }

  // Orders
  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const [order] = await db
      .insert(orders)
      .values({ ...insertOrder, total: Number(insertOrder.total) })
      .returning();
    return order;
  }

  async getOrders(): Promise<Order[]> {
    return await db.select().from(orders);
  }

  // Contact Messages
  async createContactMessage(insertMessage: InsertContactMessage): Promise<ContactMessage> {
    const [message] = await db
      .insert(contactMessages)
      .values({
        ...insertMessage,
        createdAt: new Date(),
      })
      .returning();
    return message;
  }

  // User Registration
  async createRegisteredUser(user: InsertRegisteredUser): Promise<RegisteredUser> {
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(user.passwordHash, saltRounds);

    const [registeredUser] = await db
      .insert(registeredUsers)
      .values({
        email: user.email.toLowerCase(),
        passwordHash,
        name: user.name,
        phone: user.phone,
        shippingAddress: user.shippingAddress,
        createdAt: new Date(),
      })
      .returning();
    return registeredUser;
  }

  async createRegisteredUserWithDiscount(
    user: InsertRegisteredUser,
    discount: { discountCode: string; expirationDate: string }
  ): Promise<RegisteredUser> {
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(user.passwordHash, saltRounds);

    const [registeredUser] = await db
      .insert(registeredUsers)
      .values({
        email: user.email.toLowerCase(),
        passwordHash,
        name: user.name,
        phone: user.phone,
        shippingAddress: user.shippingAddress,
        discountCode: discount.discountCode,
        discountUsed: false,
        discountExpiresAt: new Date(discount.expirationDate),
        createdAt: new Date(),
      })
      .returning();
    return registeredUser;
  }

  async getRegisteredUserByEmail(email: string): Promise<RegisteredUser | undefined> {
    const [user] = await db
      .select()
      .from(registeredUsers)
      .where(eq(registeredUsers.email, email.toLowerCase()));
    return user;
  }

  async getRegisteredUsers(): Promise<RegisteredUser[]> {
    return await db.select().from(registeredUsers);
  }

  // Authentication
  async authenticateUser(email: string, password: string): Promise<RegisteredUser | null> {
    const [user] = await db
      .select()
      .from(registeredUsers)
      .where(eq(registeredUsers.email, email.toLowerCase()));

    if (!user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      return null;
    }

    return user;
  }

  // WhatsApp Sessions
  async getWhatsappSession(phoneNumber: string): Promise<WhatsappSession | undefined> {
    const [session] = await db
      .select()
      .from(whatsappSessions)
      .where(eq(whatsappSessions.phoneNumber, phoneNumber));
    return session || undefined;
  }

  async createWhatsappSession(sessionData: InsertWhatsappSession): Promise<WhatsappSession> {
    const now = new Date();
    const [session] = await db
      .insert(whatsappSessions)
      .values({
        ...sessionData,
        lastActivity: now,
      })
      .returning();
    return session;
  }

  async updateWhatsappSession(
    phoneNumber: string,
    updates: Partial<InsertWhatsappSession>
  ): Promise<WhatsappSession | undefined> {
    const now = new Date();
    const [session] = await db
      .update(whatsappSessions)
      .set({
        ...updates,
        lastActivity: now,
      })
      .where(eq(whatsappSessions.phoneNumber, phoneNumber))
      .returning();
    return session || undefined;
  }

  // Discount Codes
  async validateDiscountCode(code: string): Promise<{ valid: boolean; discount?: number; message?: string }> {
    try {
      const [userWithDiscount] = await db
        .select()
        .from(registeredUsers)
        .where(eq(registeredUsers.discountCode, code));

      if (userWithDiscount) {
        if (userWithDiscount.discountUsed) {
          return { valid: false, message: "Este código de descuento ya ha sido utilizado" };
        }

        if (
          userWithDiscount.discountExpiresAt &&
          userWithDiscount.discountExpiresAt < new Date()
        ) {
          return { valid: false, message: "Este código de descuento ha expirado" };
        }

        return { valid: true, discount: 10, message: "Código válido - 10% de descuento" };
      }

      return { valid: false, message: "Código de descuento no válido" };
    } catch (error) {
      console.error("Error validating discount code:", error);
      return { valid: false, message: "Error validando el código" };
    }
  }

  async useDiscountCode(code: string, userId: number): Promise<boolean> {
    try {
      const [result] = await db
        .update(registeredUsers)
        .set({ discountUsed: true })
        .where(eq(registeredUsers.discountCode, code))
        .returning();
      return !!result;
    } catch (error) {
      console.error("Error using discount code:", error);
      return false;
    }
  }

  // Email Campaigns
  async addEmailForFutureCampaigns(data: {
    email: string;
    firstName: string;
    lastName: string;
    discountCode: string;
    registrationDate: string;
    acceptsMarketing: boolean;
  }): Promise<void> {
    try {
      await db.insert(emailCampaigns).values({
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        discountCode: data.discountCode,
        registrationDate: data.registrationDate,
        acceptsMarketing: data.acceptsMarketing,
        campaignName: "Future Campaign",
        subject: `Welcome ${data.firstName} ${data.lastName}!`,
        content: `Thank you for subscribing to Sigerist Luxury Bags with email: ${data.email}`,
        status: "draft",
        sentCount: 0,
        createdAt: new Date(),
      });
      console.log(`Email stored for future campaigns: ${data.email}`);
    } catch (error) {
      console.error("Error storing email for campaigns:", error);
      throw error;
    }
  }

  private getSampleProducts(): Product[] {
    return [
      {
        id: 1,
        name: "Pañalera Multifuncional",
        description: "Pañalera multifuncional con bordado personalizado y múltiples compartimentos - ¡Nuestro producto estrella!",
        price: 445000.00,
        imageUrl: "/assets/Multifuncional 3.jpg",
        blankImageUrl: "/assets/Multifuncional 3sinB.jpg",
        referenceImageUrl: "/assets/Multifuncional 3_1754160626677.jpg",
        category: "Pañaleras",
        animalType: "León",
        colors: ["Tierra", "Beige", "Azul"],
        inStock: true,
        variants: {
          bordado: true,
          bordadoImageUrl: "/assets/Multifuncional 3_1754160626677.jpg",
          galleryImages: ["/assets/Multifuncional 3sinB_1754160704825.jpg"],
          bordadoGalleryImages: [
            "/assets/Multifuncional 3_1754160626677.jpg",
            "/assets/Multifuncional 2 Bordada_1754093212913.jpg",
            "/assets/Multifuncional 3 Bordada_1754093212913.jpg",
          ],
        },
        createdAt: new Date(),
      },
      {
        id: 2,
        name: "Organizador de Higiene",
        description: "Organizador de higiene transparente con bordado personalizado de flores - Perfecto para viajes",
        price: 145000.00,
        imageUrl: "/assets/Organizador Bordado.jpg",
        blankImageUrl: "/assets/Organizador.jpg",
        referenceImageUrl: "/assets/Organizador.jpg",
        category: "Organizadores",
        animalType: "Flores",
        colors: ["Rosa", "Beige"],
        inStock: true,
        variants: {
          bordado: true,
          galleryImages: ["/assets/Organizador Bordado.jpg"],
        },
        createdAt: new Date(),
      },
      {
        id: 3,
        name: "Mochila Clásica",
        description: "Mochila clásica con bordado de leoncito adorable y acabados premium en beige y café",
        price: 425000.00,
        imageUrl: "/assets/Mochila clasica.jpg",
        blankImageUrl: "/assets/Mochila clasica.jpg",
        referenceImageUrl: "/assets/Mochila clasica.jpg",
        category: "Mochilas",
        animalType: "León",
        colors: ["Beige", "Café"],
        inStock: true,
        variants: {
          bordado: false,
          galleryImages: ["/assets/Mochila clasica.jpg"],
        },
        createdAt: new Date(),
      },
      {
        id: 4,
        name: "Pañalera Grande",
        description: "Pañalera grande con opción de bordado personalizado en tonos rosados",
        price: 445000.00,
        imageUrl: "/assets/Pañalera Grande con nombre.jpg",
        blankImageUrl: "/assets/Pañalera Grande.jpg",
        referenceImageUrl: "/assets/Pañalera Grande con nombre.jpg",
        category: "Pañaleras",
        animalType: "Conejita",
        colors: ["Blanco", "Rosa"],
        inStock: true,
        variants: {
          bordado: true,
          bordadoImageUrl: "/assets/Pañalera Grande con nombre.jpg",
        },
        createdAt: new Date(),
      },
      {
        id: 5,
        name: "Pañalera Mediana",
        description: "Pañalera mediana con bordado de osito personalizado en tonos azules",
        price: 405000.00,
        imageUrl: "/assets/Pañalera Mediana con nombre.jpg",
        blankImageUrl: "/assets/Pañalera Mediana.jpg",
        referenceImageUrl: "/assets/Pañalera Mediana con nombre.jpg",
        category: "Pañaleras",
        animalType: "Osito",
        colors: ["Beige", "Azul"],
        inStock: true,
        variants: {
          bordado: true,
          bordadoImageUrl: "/assets/Pañalera Mediana con nombre.jpg",
        },
        createdAt: new Date(),
      },
      {
        id: 6,
        name: "Porta Documentos",
        description: "Porta documentos elegante con bordado personalizado y acabados premium",
        price: 190000.00,
        imageUrl: "/assets/Portadocumentos_1754094149309.jpg",
        blankImageUrl: "/assets/Portadocumentos_1754094149309.jpg",
        referenceImageUrl: "/assets/Portadocumentos_1754094149309.jpg",
        category: "Accesorios",
        animalType: null,
        colors: ["Beige", "Café"],
        inStock: true,
        variants: { bordado: false },
        createdAt: new Date(),
      },
      {
        id: 7,
        name: "Mochila Milano",
        description: "Mochila Milano con diseño elegante y bordado de leoncito premium",
        price: 435000.00,
        imageUrl: "/assets/Maleta_Milan_SinBordar_1754094149304.jpg",
        blankImageUrl: "/assets/Maleta_Milan_SinBordar_1754094149304.jpg",
        referenceImageUrl: "/assets/MaletaMilan_ConBordado_1754093212912.jpg",
        category: "Mochilas",
        animalType: "León",
        colors: ["Beige", "Verde"],
        inStock: true,
        variants: {
          bordado: true,
          bordadoImageUrl: "/assets/MaletaMilan_ConBordado_1754093212912.jpg",
        },
        createdAt: new Date(),
      },
      {
        id: 8,
        name: "Cambiador",
        description: "Cambiador portátil con diseño funcional y elegante - Solo disponible sin bordado",
        price: 105000.00,
        imageUrl: "/assets/Cambiador_1754094149302.jpg",
        blankImageUrl: "/assets/Cambiador_1754094149302.jpg",
        referenceImageUrl: "/assets/Cambiador_1754094149302.jpg",
        category: "Accesorios",
        animalType: null,
        colors: ["Beige", "Café"],
        inStock: true,
        variants: { bordado: false },
        createdAt: new Date(),
      },
      {
        id: 9,
        name: "Lonchera Porta Biberones",
        description: "Lonchera porta biberones con bordado de osita personalizado",
        price: 335000.00,
        imageUrl: "/assets/PortaBiberones_SinBordar_1754094149308.jpg",
        blankImageUrl: "/assets/PortaBiberones_SinBordar_1754094149308.jpg",
        referenceImageUrl: "/assets/Porta Biberones_Bordado_1754093212916.jpg",
        category: "Loncheras",
        animalType: "Osita",
        colors: ["Beige", "Rosa"],
        inStock: true,
        variants: {
          bordado: true,
          bordadoImageUrl: "/assets/Porta Biberones_Bordado_1754093212916.jpg",
        },
        createdAt: new Date(),
      },
      {
        id: 10,
        name: "Lonchera Baul",
        description: "Lonchera baúl con bordado de osito y acabados premium con moño azul",
        price: 335000.00,
        imageUrl: "/assets/Lonchera baul sin bordar_1754094149302.jpg",
        blankImageUrl: "/assets/Lonchera baul sin bordar_1754094149302.jpg",
        referenceImageUrl: "/assets/Lonchera baul_1754093212911.jpg",
        category: "Loncheras",
        animalType: "Osito",
        colors: ["Beige", "Azul"],
        inStock: true,
        variants: {
          bordado: true,
          bordadoImageUrl: "/assets/Lonchera baul_1754093212911.jpg",
        },
        createdAt: new Date(),
      },
      {
        id: 11,
        name: "Maleta Viajera",
        description: "Maleta viajera con diseño floral bordado y detalles en rosa",
        price: 550000.00,
        imageUrl: "/assets/Maleta Viajera_Sin bordar_1754094149303.jpg",
        blankImageUrl: "/assets/Maleta Viajera_Sin bordar_1754094149303.jpg",
        referenceImageUrl: "/assets/Maleta viajera_Bordada_1754093212912.jpg",
        category: "Maletas",
        animalType: null,
        colors: ["Beige", "Rosa"],
        inStock: true,
        variants: {
          bordado: true,
          bordadoImageUrl: "/assets/Maleta viajera_Bordada_1754093212912.jpg",
        },
        createdAt: new Date(),
      },
      {
        id: 12,
        name: "Portachupeta",
        description: "Portachupeta elegante con bordado personalizado y acabados premium",
        price: 80000.00,
        imageUrl: "/assets/Portachupeta_1754094149309.jpg",
        blankImageUrl: "/assets/Portachupeta_1754094149309.jpg",
        referenceImageUrl: "/assets/Portachupeta_1754094149309.jpg",
        category: "Accesorios",
        animalType: null,
        colors: ["Beige", "Dorado"],
        inStock: true,
        variants: { bordado: false },
        createdAt: new Date(),
      },
      {
        id: 13,
        name: "Colección Mini Fantasy",
        description: "Colección completa Mini Fantasy con 5 diseños adorables: gato, perrito, mariposa, Stitch y niña rosada",
        price: 265000.00,
        imageUrl: "/assets/Bolso Rosadito Bordado Minifantasy_1754093212911.jpg",
        blankImageUrl: "/assets/Minifantasy rosado sin bordar_1754094149304.jpg",
        referenceImageUrl: "/assets/Bolso Rosadito Bordado Minifantasy_1754093212911.jpg",
        category: "Colección",
        animalType: "Varios",
        colors: ["Rosa", "Gris", "Beige", "Azul"],
        inStock: true,
        variants: {
          bordado: true,
          bordadoImageUrl: "/assets/Bolso Rosadito Bordado Minifantasy_1754093212911.jpg",
          galleryImages: [
            "/assets/Minifantasy rosado sin bordar_1754094149304.jpg",
            "/assets/Bolsito Gato_1754094149297.jpg",
            "/assets/Bolsito perrito_1754094149299.jpg",
            "/assets/Bolso Mariposa sin Bordar_1754094149300.jpg",
            "/assets/Stitch Sin Bordar_1754094149310.jpg",
          ],
          bordadoGalleryImages: [
            "/assets/Bolso Rosadito Bordado Minifantasy_1754093212911.jpg",
            "/assets/Bolsito Gato_1754094149297.jpg",
            "/assets/Bolsito perrito bordado_1754093212910.jpg",
            "/assets/Bolsito Mariposa_1754093212910.jpg",
            "/assets/Stitch Blanco_1754093212916.jpg",
          ],
        },
        createdAt: new Date(),
      },
      {
        id: 14,
        name: "Organizador de Muda",
        description: "Organizador de muda con bordado personalizado - Solo disponible con bordado",
        price: 60000.00,
        imageUrl: "/assets/Organizador_Bordado_1754119979271.jpg",
        blankImageUrl: "/assets/Organizador_Bordado_1754119979271.jpg",
        referenceImageUrl: "/assets/Organizador_Bordado_1754119979271.jpg",
        category: "Organizadores",
        animalType: null,
        colors: ["Beige", "Multicolor"],
        inStock: true,
        variants: {
          bordado: false,
          galleryImages: ["/assets/Organizador_Bordado_1754119979271.jpg"],
        },
        createdAt: new Date(),
      },
      {
        id: 15,
        name: "Organizador de Higiene",
        description: "Organizador de higiene con diseño floral bordado - Perfecto para guardar productos de cuidado personal",
        price: 130000.00,
        imageUrl: "/assets/Organizador_1754162008500.jpg",
        blankImageUrl: "/assets/Organizador_1754162008500.jpg",
        referenceImageUrl: "/assets/Organizador Bordado_1754160554308.jpg",
        category: "Organizadores",
        animalType: null,
        colors: ["Rosa", "Beige"],
        inStock: true,
        variants: {
          bordado: true,
          bordadoImageUrl: "/assets/Organizador Bordado_1754160554308.jpg",
        },
        createdAt: new Date(),
      },
    ];
  }

  // Seed products method
  async seedProducts(): Promise<void> {
    try {
      const existingProducts = await db.select().from(products);
      if (existingProducts.length === 0) {
        await this.initializeSampleProducts();
      }
    } catch (error) {
      console.error("Error seeding products:", error);
      throw error;
    }
  }

  // Bag template methods (placeholder implementations)
  async createBagTemplate(template: any): Promise<any> {
    return template;
  }

  async getBagTemplates(): Promise<any[]> {
    return [];
  }
}

export const storage = new DatabaseStorage();