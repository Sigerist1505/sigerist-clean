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
  type InsertWhatsappSession
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
  createRegisteredUserWithDiscount(user: InsertRegisteredUser, discount: { discountCode: string; expirationDate: string }): Promise<RegisteredUser>;
  getRegisteredUserByEmail(email: string): Promise<RegisteredUser | undefined>;
  getRegisteredUsers(): Promise<RegisteredUser[]>;
  
  // Discount Codes
  validateDiscountCode(code: string): Promise<{ valid: boolean; discount?: number; message?: string }>;
  useDiscountCode(code: string, userId: number): Promise<boolean>;
  
  // Email Campaigns
  addEmailForFutureCampaigns(data: { email: string; firstName: string; lastName: string; discountCode: string; registrationDate: string; acceptsMarketing: boolean }): Promise<void>;
  
  // Authentication
  authenticateUser(email: string, password: string): Promise<RegisteredUser | null>;
  
  // WhatsApp Sessions
  getWhatsappSession(phoneNumber: string): Promise<WhatsappSession | undefined>;
  createWhatsappSession(session: InsertWhatsappSession): Promise<WhatsappSession>;
  updateWhatsappSession(phoneNumber: string, updates: Partial<InsertWhatsappSession>): Promise<WhatsappSession | undefined>;
  
  // Bag Templates
  createBagTemplate(template: any): Promise<any>;
  getBagTemplates(): Promise<any[]>;
}

export class DatabaseStorage implements IStorage {
  // Products
  async getProducts(): Promise<Product[]> {
    try {
      // Add test product if it doesn't exist
      const existingTestProduct = await db.select().from(products).where(eq(products.name, "Producto de Prueba"));
      if (existingTestProduct.length === 0) {
        await db.insert(products).values({
          name: "Producto de Prueba",
          description: "Producto para probar la pasarela de pagos",
          price: "1000",
          imageUrl: "/attached_assets/IMG-20250531-WA0015.jpg",
          blankImageUrl: "/attached_assets/IMG-20250531-WA0015.jpg",
          referenceImageUrl: "/attached_assets/IMG-20250531-WA0015.jpg",
          colors: ["Negro"],
          category: "test",
          inStock: true,
          animalType: null,
          variants: null
        });
      }
      
      const dbProducts = await db.select().from(products);
      // If database is empty, populate with sample products
      if (dbProducts.length === 0) {
        await this.initializeSampleProducts();
        const freshProducts = await db.select().from(products);
        return freshProducts.map(p => ({ ...p, variants: p.variants as ProductVariants }));
      }
      return dbProducts.map(p => ({ ...p, variants: p.variants as ProductVariants }));
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
          price: product.price,
          imageUrl: product.imageUrl,
          blankImageUrl: product.blankImageUrl,
          referenceImageUrl: product.referenceImageUrl,
          category: product.category,
          inStock: product.inStock,
          animalType: product.animalType,
          colors: product.colors,
          variants: product.variants
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
      // Fallback to sample data
      const sampleProducts = this.getSampleProducts();
      return sampleProducts.find(p => p.id === id);
    }
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const [product] = await db.insert(products).values(insertProduct).returning();
    return product ? { ...product, variants: product.variants as ProductVariants } : product;
  }

  async updateProduct(id: number, data: Partial<Product>): Promise<Product | null> {
    try {
      const [product] = await db.update(products)
        .set(data)
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
      const result = await db.delete(products).where(eq(products.id, id));
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
      return [];
    }
  }

  async addCartItem(insertItem: InsertCartItem): Promise<CartItem> {
    const [item] = await db.insert(cartItems).values(insertItem).returning();
    return item;
  }

  async updateCartItem(id: number, quantity: number): Promise<CartItem | undefined> {
    const [item] = await db.update(cartItems)
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
      return false;
    }
  }

  async clearCart(): Promise<void> {
    await db.delete(cartItems);
  }

  // Orders
  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const [order] = await db.insert(orders).values({
      ...insertOrder,
      createdAt: new Date().toISOString(),
    }).returning();
    return order;
  }

  async getOrders(): Promise<Order[]> {
    return await db.select().from(orders);
  }

  // Contact Messages
  async createContactMessage(insertMessage: InsertContactMessage): Promise<ContactMessage> {
    const [message] = await db.insert(contactMessages).values({
      ...insertMessage,
      createdAt: new Date().toISOString(),
    }).returning();
    return message;
  }

  // User Registration
  async createRegisteredUser(user: InsertRegisteredUser): Promise<RegisteredUser> {
    // Hash the password before storing
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(user.password, saltRounds);
    
    const [registeredUser] = await db.insert(registeredUsers).values({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email.toLowerCase(),
      passwordHash: passwordHash,
      address: user.address,
      phoneNumber: user.phoneNumber,
      acceptsMarketing: user.acceptsMarketing || "false",
      createdAt: new Date().toISOString(),
    }).returning();
    return registeredUser;
  }

  async createRegisteredUserWithDiscount(user: InsertRegisteredUser, discount: { discountCode: string; expirationDate: string }): Promise<RegisteredUser> {
    // Hash the password before storing
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(user.password, saltRounds);
    
    const [registeredUser] = await db.insert(registeredUsers).values({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email.toLowerCase(),
      passwordHash: passwordHash,
      address: user.address,
      phoneNumber: user.phoneNumber,
      acceptsMarketing: user.acceptsMarketing || "false",
      discountCode: discount.discountCode,
      discountUsed: false,
      discountExpiresAt: discount.expirationDate,
      createdAt: new Date().toISOString(),
    }).returning();
    return registeredUser;
  }

  async getRegisteredUserByEmail(email: string): Promise<RegisteredUser | undefined> {
    const [user] = await db.select().from(registeredUsers).where(eq(registeredUsers.email, email.toLowerCase()));
    return user;
  }

  async getRegisteredUsers(): Promise<RegisteredUser[]> {
    return await db.select().from(registeredUsers);
  }

  // Authentication
  async authenticateUser(email: string, password: string): Promise<RegisteredUser | null> {
    const [user] = await db.select().from(registeredUsers).where(eq(registeredUsers.email, email.toLowerCase()));
    
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
    const [session] = await db.select().from(whatsappSessions).where(eq(whatsappSessions.phoneNumber, phoneNumber));
    return session || undefined;
  }

  async createWhatsappSession(sessionData: InsertWhatsappSession): Promise<WhatsappSession> {
    const now = new Date().toISOString();
    const [session] = await db
      .insert(whatsappSessions)
      .values({
        ...sessionData,
        firstContact: now,
        lastActivity: now,
      })
      .returning();
    return session;
  }

  async updateWhatsappSession(phoneNumber: string, updates: Partial<InsertWhatsappSession>): Promise<WhatsappSession | undefined> {
    const now = new Date().toISOString();
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

  // Discount Code methods
  async validateDiscountCode(code: string): Promise<{ valid: boolean; discount?: number; message?: string }> {
    try {
      // Check if it's a user-specific welcome discount
      const [userWithDiscount] = await db.select().from(registeredUsers).where(eq(registeredUsers.discountCode, code));
      
      if (userWithDiscount) {
        // Check if already used
        if (userWithDiscount.discountUsed) {
          return { valid: false, message: "Este código de descuento ya ha sido utilizado" };
        }
        
        // Check if expired
        if (userWithDiscount.discountExpiresAt && new Date(userWithDiscount.discountExpiresAt) < new Date()) {
          return { valid: false, message: "Este código de descuento ha expirado" };
        }
        
        return { valid: true, discount: 10, message: "Código válido - 10% de descuento" };
      }
      
      return { valid: false, message: "Código de descuento no válido" };
    } catch (error) {
      console.error('Error validating discount code:', error);
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
      console.error('Error using discount code:', error);
      return false;
    }
  }

  // Email Campaigns
  async addEmailForFutureCampaigns(data: { email: string; firstName: string; lastName: string; discountCode: string; registrationDate: string; acceptsMarketing: boolean }): Promise<void> {
    try {
      await db.insert(emailCampaigns).values({
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        discountCode: data.discountCode,
        registrationDate: data.registrationDate,
        acceptsMarketing: data.acceptsMarketing,
        emailSent: false,
        createdAt: new Date().toISOString(),
      });
      console.log(`Email stored for future campaigns: ${data.email}`);
    } catch (error) {
      console.error('Error storing email for campaigns:', error);
      throw error;
    }
  }

  private getSampleProducts(): Product[] {
    return [
      // PRIMERA POSICIÓN: Pañalera Multifuncional unificada con galería completa
      {
        id: 1,
        name: "Pañalera Multifuncional",
        description: "Pañalera multifuncional con bordado personalizado y múltiples compartimentos - ¡Nuestro producto estrella!",
        price: "445000", // Precio base SIN bordado
        imageUrl: "/attached_assets/Multifuncional 3.jpg", // Samuel de primera
        blankImageUrl: "/attached_assets/Multifuncional 3sinB.jpg", // Sin bordado
        referenceImageUrl: "/attached_assets/Multifuncional 3.jpg", // Con bordado Samuel
        category: "Pañaleras",
        animalType: "León",
        colors: ["Tierra", "Beige", "Azul"],
        inStock: true,
        variants: { 
          bordado: true, 
          bordadoImageUrl: "/attached_assets/Multifuncional 3.jpg",
          galleryImages: ["/attached_assets/Multifuncional 3sinB.jpg"],
          bordadoGalleryImages: [
            "/attached_assets/Multifuncional 3.jpg", // 1. Samuel
            "/attached_assets/Multifuncional 2 Bordada.jpg", // 2. Azul Zamir
            "/attached_assets/Multifuncional 3 Bordada.jpg"  // 3. Abierta
          ]
        },
      },
      // SEGUNDA POSICIÓN: Organizador de Higiene (nuevo producto)
      {
        id: 2,
        name: "Organizador de Higiene",
        description: "Organizador de higiene transparente con bordado personalizado de flores - Perfecto para viajes",
        price: "145000",
        imageUrl: "/attached_assets/Organizador Bordado.jpg",
        blankImageUrl: "/attached_assets/Organizador Bordado.jpg", // Solo tiene versión con bordado
        referenceImageUrl: "/attached_assets/Organizador Bordado.jpg",
        category: "Organizadores",
        animalType: "Flores",
        colors: ["Rosa", "Beige"],
        inStock: true,
        variants: { 
          bordado: false, // No tiene opción sin bordado según tus instrucciones
          galleryImages: ["/attached_assets/Organizador Bordado.jpg"]
        },
      },
      {
        id: 3,
        name: "Mochila Clásica",
        description: "Mochila clásica con bordado de leoncito adorable y acabados premium en beige y café",
        price: "425000", // Precio base SIN bordado
        imageUrl: "/attached_assets/Mochila clasica.jpg",
        blankImageUrl: "/attached_assets/Mochila clasica.jpg",
        referenceImageUrl: "/attached_assets/Mochila clasica.jpg",
        category: "Mochilas",
        animalType: "León",
        colors: ["Beige", "Café"],
        inStock: true,
        variants: { 
          bordado: false,
          galleryImages: ["/attached_assets/Mochila clasica.jpg"]
        },
      },
      {
        id: 4,
        name: "Pañalera Grande",
        description: "Pañalera grande con opción de bordado personalizado en tonos rosados",
        price: "445000", // Precio base SIN bordado
        imageUrl: "/attached_assets/Pañalera Grande (2).jpg",  
        blankImageUrl: "/attached_assets/Pañalera Grande (2).jpg",
        referenceImageUrl: "/attached_assets/Pañalera Grande con nombre.jpg",
        category: "Pañaleras",
        animalType: "Conejita",
        colors: ["Blanco", "Rosa"],
        inStock: true,
        variants: { 
          bordado: true, 
          bordadoImageUrl: "/attached_assets/Pañalera Grande con nombre.jpg" 
        },
      },
      {
        id: 5,
        name: "Pañalera Mediana",
        description: "Pañalera mediana con bordado de osito personalizado en tonos azules",
        price: "405000", // Precio base SIN bordado
        imageUrl: "/attached_assets/Pañalera Mediana.jpg",
        blankImageUrl: "/attached_assets/Pañalera Mediana.jpg",
        referenceImageUrl: "/attached_assets/Pañalera Mediana con nombre.jpg",
        category: "Pañaleras",
        animalType: "Osito",
        colors: ["Beige", "Azul"],
        inStock: true,
        variants: { 
          bordado: true, 
          bordadoImageUrl: "/attached_assets/Pañalera Mediana con nombre.jpg" 
        },
      },
      {
        id: 6,
        name: "Porta Documentos",
        description: "Porta documentos elegante con bordado personalizado y acabados premium",
        price: "190000",
        imageUrl: "/attached_assets/Portadocumentos.jpg",
        blankImageUrl: "/attached_assets/Portadocumentos.jpg",
        referenceImageUrl: "/attached_assets/Portadocumentos.jpg",
        category: "Accesorios",
        animalType: null,
        colors: ["Beige", "Café"],
        inStock: true,
        variants: { bordado: false },
      },
      {
        id: 7,
        name: "Mochila Milano",
        description: "Mochila Milano con diseño elegante y bordado de leoncito premium",
        price: "435000",
        imageUrl: "/attached_assets/Maleta_Milan_SinBordar.jpg",
        blankImageUrl: "/attached_assets/Maleta_Milan_SinBordar.jpg",
        referenceImageUrl: "/attached_assets/MaletaMilan_ConBordado.jpg",
        category: "Mochilas",
        animalType: "León",
        colors: ["Beige", "Verde"],
        inStock: true,
        variants: { 
          bordado: true, 
          bordadoImageUrl: "/attached_assets/MaletaMilan_ConBordado.jpg" 
        },
      },
      {
        id: 8,
        name: "Cambiador",
        description: "Cambiador portátil con diseño funcional y elegante - Solo disponible sin bordado",
        price: "105000", // Precio fijo sin bordado
        imageUrl: "/attached_assets/Cambiador.jpg",
        blankImageUrl: "/attached_assets/Cambiador.jpg",
        referenceImageUrl: "/attached_assets/Cambiador.jpg",
        category: "Accesorios",
        animalType: null,
        colors: ["Beige", "Café"],
        inStock: true,
        variants: { 
          bordado: false // No tiene opción de bordado
        },
      },
      {
        id: 9,
        name: "Lonchera Porta Biberones",
        description: "Lonchera porta biberones con bordado de osita personalizado",
        price: "335000",
        imageUrl: "/attached_assets/PortaBiberones_SinBordar.jpg",
        blankImageUrl: "/attached_assets/PortaBiberones_SinBordar.jpg",
        referenceImageUrl: "/attached_assets/Porta Biberones_Bordado.jpg",
        category: "Loncheras",
        animalType: "Osita",
        colors: ["Beige", "Rosa"],
        inStock: true,
        variants: { 
          bordado: true, 
          bordadoImageUrl: "/attached_assets/Porta Biberones_Bordado.jpg" 
        },
      },
      {
        id: 10,
        name: "Lonchera Baul",
        description: "Lonchera baúl con bordado de osito y acabados premium con moño azul",
        price: "335000",
        imageUrl: "/attached_assets/Lonchera baul sin bordar.jpg",
        blankImageUrl: "/attached_assets/Lonchera baul sin bordar.jpg",
        referenceImageUrl: "/attached_assets/Lonchera baul.jpg",
        category: "Loncheras",
        animalType: "Osito",
        colors: ["Beige", "Azul"],
        inStock: true,
        variants: { 
          bordado: true, 
          bordadoImageUrl: "/attached_assets/Lonchera baul.jpg" 
        },
      },
      {
        id: 11,
        name: "Maleta Viajera",
        description: "Maleta viajera con diseño floral bordado y detalles en rosa",
        price: "550000", // Precio base SIN bordado
        imageUrl: "/attached_assets/Maleta Viajera_Sin bordar.jpg",
        blankImageUrl: "/attached_assets/Maleta Viajera_Sin bordar.jpg",
        referenceImageUrl: "/attached_assets/Maleta viajera_Bordada.jpg",
        category: "Maletas",
        animalType: null,
        colors: ["Beige", "Rosa"],
        inStock: true,
        variants: { 
          bordado: true, 
          bordadoImageUrl: "/attached_assets/Maleta viajera_Bordada.jpg" 
        },
      },
      {
        id: 12,
        name: "Portachupeta",
        description: "Portachupeta elegante con bordado personalizado y acabados premium",
        price: "80000",
        imageUrl: "/attached_assets/Portachupeta.jpg",
        blankImageUrl: "/attached_assets/Portachupeta.jpg",
        referenceImageUrl: "/attached_assets/Portachupeta.jpg",
        category: "Accesorios",
        animalType: null,
        colors: ["Beige", "Dorado"],
        inStock: true,
        variants: { bordado: false },
      },
      {
        id: 13,
        name: "Colección Mini Fantasy",
        description: "Colección completa Mini Fantasy con 5 diseños adorables: gato, perrito, mariposa, Stitch y niña rosada",
        price: "265000", // Precio base SIN bordado
        imageUrl: "/attached_assets/Bolso Rosadito Bordado Minifantasy.jpg",
        blankImageUrl: "/attached_assets/Minifantasy rosado sin bordar.jpg",
        referenceImageUrl: "/attached_assets/Bolso Rosadito Bordado Minifantasy.jpg",
        category: "Colección",
        animalType: "Varios",
        colors: ["Rosa", "Gris", "Beige", "Azul"],
        inStock: true,
        variants: { 
          bordado: true, 
          bordadoImageUrl: "/attached_assets/Bolso Rosadito Bordado Minifantasy.jpg",
          galleryImages: [
            "/attached_assets/Minifantasy rosado sin bordar.jpg",
            "/attached_assets/Bolsito Gato.jpg",
            "/attached_assets/Bolsito perrito.jpg",
            "/attached_assets/Bolso Mariposa sin Bordar.jpg",
            "/attached_assets/Stitch Sin Bordar.jpg"
          ],
          bordadoGalleryImages: [
            "/attached_assets/Bolso Rosadito Bordado Minifantasy.jpg",
            "/attached_assets/Bolsito Gato.jpg",
            "/attached_assets/Bolsito perrito bordado.jpg",
            "/attached_assets/Bolsito Mariposa.jpg",
            "/attached_assets/Stitch Blanco.jpg"
          ]
        },
      },
      {
        id: 14,
        name: "Organizador de Muda",
        description: "Organizador de muda con bordado personalizado - Solo disponible con bordado",
        price: "60000", // Precio final con bordado (no se puede desactivar)
        imageUrl: "/attached_assets/Organizador_Bordado.jpg",
        blankImageUrl: "/attached_assets/Organizador_Bordado.jpg", // Solo tiene versión con bordado
        referenceImageUrl: "/attached_assets/Organizador_Bordado.jpg",
        category: "Organizadores", 
        animalType: null,
        colors: ["Beige", "Multicolor"],
        inStock: true,
        variants: { 
          bordado: false, // No tiene opción de cambio - solo existe con bordado
          galleryImages: ["/attached_assets/Organizador_Bordado.jpg"]
        },
      },
      {
        id: 15,
        name: "Organizador de Higiene",
        description: "Organizador de higiene con diseño floral bordado - Perfecto para guardar productos de cuidado personal",
        price: "130000", // Precio base SIN bordado
        imageUrl: "/attached_assets/Organizador.jpg", // Sin bordado
        blankImageUrl: "/attached_assets/Organizador.jpg", // Sin bordado
        referenceImageUrl: "/attached_assets/Organizador Bordado.jpg", // Con bordado María
        category: "Organizadores",
        animalType: null,
        colors: ["Rosa", "Beige"],
        inStock: true,
        variants: { 
          bordado: true, 
          bordadoImageUrl: "/attached_assets/Organizador Bordado.jpg" 
        },
      }
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
    // Placeholder implementation - could be extended with proper bag template table
    return template;
  }

  async getBagTemplates(): Promise<any[]> {
    // Placeholder implementation - could be extended with proper bag template table
    return [];
  }
}

export const storage = new DatabaseStorage();