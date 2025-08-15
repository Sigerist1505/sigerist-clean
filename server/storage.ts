// shared/schema.ts
import { pgTable, text, serial, integer, boolean, decimal, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// === TABLAS ===
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  category: text("category").notNull(),
  imageUrl: text("image_url").notNull(),
  blankImageUrl: text("blank_image_url"),
  referenceImageUrl: text("reference_image_url"),
  animalType: text("animal_type"),
  colors: text("colors").array().notNull(), // Array de strings
  inStock: boolean("in_stock").default(true),
  variants: jsonb("variants"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const cartItems = pgTable("cart_items", {
  id: serial("id").primaryKey(),
  productId: integer("product_id")
    .notNull()
    .references(() => products.id),
  name: text("name").notNull(),
  quantity: integer("quantity").default(1),
  personalization: text("personalization"),
  embroideryColor: text("embroidery_color"),
  embroideryFont: text("embroidery_font"),
  customPreview: text("custom_preview"),
  addPompon: boolean("add_pompon").default(false),
  addPersonalizedKeychain: boolean("add_personalized_keychain").default(false),
  addDecorativeBow: boolean("add_decorative_bow").default(false),
  addPersonalization: boolean("add_personalization").default(false),
  expressService: boolean("express_service").default(false),
  keychainPersonalization: text("keychain_personalization"),
  hasBordado: boolean("has_bordado").default(false),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  customerPhone: text("customer_phone").notNull(),
  items: text("items").notNull(), // JSON string
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  status: text("status").default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdateFn(() => new Date()),
});

export const contactMessages = pgTable("contact_messages", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const whatsappSessions = pgTable("whatsapp_sessions", {
  id: serial("id").primaryKey(),
  phoneNumber: text("phone_number").notNull().unique(),
  sessionData: text("session_data").notNull(), // JSON serializado
  lastActivity: timestamp("last_activity"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const emailCampaigns = pgTable("email_campaigns", {
  id: serial("id").primaryKey(),
  campaignName: text("campaign_name").notNull(),
  subject: text("subject").notNull(),
  content: text("content").notNull(),
  email: text("email").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  discountCode: text("discount_code").notNull(),
  registrationDate: text("registration_date").notNull(),
  acceptsMarketing: boolean("accepts_marketing").default(false),
  status: text("status").default("draft"),
  sentCount: integer("sent_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  sentAt: timestamp("sent_at"),
});

export const registeredUsers = pgTable("registered_users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull(),
  phone: text("phone"),
  shippingAddress: text("shipping_address"),
  discountCode: text("discount_code"),
  discountUsed: boolean("discount_used").default(false),
  discountExpiresAt: timestamp("discount_expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// === SCHEMAS ZOD ===
export const insertProductSchema = createInsertSchema(products, {
  name: (schema) => schema.name.min(1),
  description: (schema) => schema.description.min(1),
  price: (schema) => z.number().positive(),
  category: (schema) => schema.category.min(1),
  imageUrl: (schema) => schema.imageUrl.url(),
  colors: (schema) => schema.colors.min(1),
  inStock: (schema) => schema.inStock,
}).omit({ id: true, createdAt: true });

export const insertCartItemSchema = createInsertSchema(cartItems, {
  productId: (schema) => schema.productId.positive(),
  name: (schema) => schema.name.min(1),
  quantity: (schema) => schema.quantity.positive().max(100),
  personalization: (schema) => schema.personalization.optional(),
  embroideryColor: (schema) => schema.embroideryColor.optional(),
  embroideryFont: (schema) => schema.embroideryFont.optional(),
  customPreview: (schema) => schema.customPreview.optional(),
  addPompon: (schema) => schema.addPompon,
  addPersonalizedKeychain: (schema) => schema.addPersonalizedKeychain,
  addDecorativeBow: (schema) => schema.addDecorativeBow,
  addPersonalization: (schema) => schema.addPersonalization,
  expressService: (schema) => schema.expressService,
  keychainPersonalization: (schema) => schema.keychainPersonalization.optional(),
  hasBordado: (schema) => schema.hasBordado,
  price: (schema) => z.number().positive(),
}).omit({ id: true });

export const insertOrderSchema = createInsertSchema(orders, {
  customerName: (schema) => schema.customerName.min(1),
  customerEmail: (schema) => schema.customerEmail.email(),
  customerPhone: (schema) => schema.customerPhone.min(10),
  items: (schema) => schema.items.min(1),
  total: (schema) => z.number().positive(),
  status: (schema) => schema.status,
}).omit({ id: true, createdAt: true, updatedAt: true });

export const insertContactMessageSchema = createInsertSchema(contactMessages, {
  firstName: (schema) => schema.firstName.min(1),
  lastName: (schema) => schema.lastName.min(1),
  email: (schema) => schema.email.email(),
  phone: (schema) => schema.phone.optional(),
  message: (schema) => schema.message.min(1),
}).omit({ id: true, createdAt: true });

export const insertWhatsappSessionSchema = createInsertSchema(whatsappSessions, {
  phoneNumber: (schema) => schema.phoneNumber.min(10),
  sessionData: (schema) => schema.sessionData.min(1),
}).omit({ id: true, lastActivity: true, createdAt: true });

export const insertEmailCampaignSchema = createInsertSchema(emailCampaigns, {
  campaignName: (schema) => schema.campaignName.min(1),
  subject: (schema) => schema.subject.min(1),
  content: (schema) => schema.content.min(1),
  status: (schema) => schema.status,
  sentCount: (schema) => schema.sentCount.nonnegative(),
}).omit({ id: true, createdAt: true, sentAt: true });

export const insertRegisteredUserSchema = createInsertSchema(registeredUsers, {
  email: (schema) => schema.email.email(),
  passwordHash: (schema) => schema.passwordHash.min(8),
  name: (schema) => schema.name.min(2),
  phone: (schema) => schema.phone.optional(),
  shippingAddress: (schema) => schema.shippingAddress.optional(),
}).omit({ id: true, createdAt: true });

export const selectRegisteredUserSchema = createSelectSchema(registeredUsers);

// === TYPES ===
export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type CartItem = typeof cartItems.$inferSelect;
export type InsertCartItem = z.infer<typeof insertCartItemSchema>;
export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type ContactMessage = typeof contactMessages.$inferSelect;
export type InsertContactMessage = z.infer<typeof insertContactMessageSchema>;
export type WhatsappSession = typeof whatsappSessions.$inferSelect;
export type InsertWhatsappSession = z.infer<typeof insertWhatsappSessionSchema>;
export type EmailCampaign = typeof emailCampaigns.$inferSelect;
export type InsertEmailCampaign = z.infer<typeof insertEmailCampaignSchema>;
export type RegisteredUser = z.infer<typeof selectRegisteredUserSchema>;
export type InsertRegisteredUser = z.infer<typeof insertRegisteredUserSchema>;
``````typescript
// server/storage.ts
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
        campaignName: "Future Campaign",
        subject: "Welcome to Sigerist Luxury Bags",
        content: `Welcome ${data.firstName} ${data.lastName}!`,
        status: "draft",
        sentCount: 0,
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
        price: "445000.00",
        imageUrl: "/attached_assets/Multifuncional 3_1754160626677.jpg",
        blankImageUrl: "/attached_assets/Multifuncional 3sinB_1754160704825.jpg",
        referenceImageUrl: "/attached_assets/Multifuncional 3_1754160626677.jpg",
        category: "Pañaleras",
        animalType: "León",
        colors: ["Tierra", "Beige", "Azul"],
        inStock: true,
        variants: {
          bordado: true,
          bordadoImageUrl: "/attached_assets/Multifuncional 3_1754160626677.jpg",
          galleryImages: ["/attached_assets/Multifuncional 3sinB_1754160704825.jpg"],
          bordadoGalleryImages: [
            "/attached_assets/Multifuncional 3_1754160626677.jpg",
            "/attached_assets/Multifuncional 2 Bordada_1754093212913.jpg",
            "/attached_assets/Multifuncional 3 Bordada_1754093212913.jpg",
          ],
        },
        createdAt: new Date().toISOString(),
      },
      // SEGUNDA POSICIÓN: Organizador de Higiene (nuevo producto)
      {
        id: 2,
        name: "Organizador de Higiene",
        description: "Organizador de higiene transparente con bordado personalizado de flores - Perfecto para viajes",
        price: "145000.00",
        imageUrl: "/attached_assets/Organizador Bordado_1754160554308.jpg",
        blankImageUrl: "/attached_assets/Organizador Bordado_1754160554308.jpg",
        referenceImageUrl: "/attached_assets/Organizador Bordado_1754160554308.jpg",
        category: "Organizadores",
        animalType: "Flores",
        colors: ["Rosa", "Beige"],
        inStock: true,
        variants: {
          bordado: false,
          galleryImages: ["/attached_assets/Organizador Bordado_1754160554308.jpg"],
        },
        createdAt: new Date().toISOString(),
      },
      // TERCERA POSICIÓN: Mochila Clásica (foto #3)
      {
        id: 3,
        name: "Mochila Clásica",
        description: "Mochila clásica con bordado de leoncito adorable y acabados premium en beige y café",
        price: "425000.00",
        imageUrl: "/attached_assets/Mochila clasica_1754094509824.jpg",
        blankImageUrl: "/attached_assets/Mochila clasica_1754094509824.jpg",
        referenceImageUrl: "/attached_assets/Mochila clasica_1754094509824.jpg",
        category: "Mochilas",
        animalType: "León",
        colors: ["Beige", "Café"],
        inStock: true,
        variants: {
          bordado: false,
          galleryImages: ["/attached_assets/Mochila clasica_1754094509824.jpg"],
        },
        createdAt: new Date().toISOString(),
      },
      // ... (todos los demás productos con rutas originales)
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