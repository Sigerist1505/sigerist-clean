import {
  pgTable,
  text,
  serial,
  integer,
  boolean,
  decimal,
  timestamp,
  jsonb,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// === TIPOS ===
export type ProductVariants = {
  bordado?: boolean;
  bordadoImageUrl?: string;
  galleryImages?: string[];
  bordadoGalleryImages?: string[];
};

// === TABLAS ===
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).$type<number>().notNull(),
  category: text("category").notNull(),
  imageUrl: text("image_url").notNull(),
  blankImageUrl: text("blank_image_url"),
  referenceImageUrl: text("reference_image_url"),
  animalType: text("animal_type"),
  colors: text("colors").array(),
  inStock: boolean("in_stock").default(true).notNull(),
  variants: jsonb("variants").$type<ProductVariants>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const cartItems = pgTable("cart_items", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull(),
  productId: integer("product_id")
    .notNull()
    .references(() => products.id),
  name: text("name").notNull(),
  quantity: integer("quantity").default(1).notNull(),
  personalization: text("personalization"),
  embroideryColor: text("embroidery_color"),
  embroideryFont: text("embroidery_font"),
  customPreview: text("custom_preview"),
  addPompon: boolean("add_pompon").default(false).notNull(),
  addPersonalizedKeychain: boolean("add_personalized_keychain").default(false).notNull(),
  addDecorativeBow: boolean("add_decorative_bow").default(false).notNull(),
  addPersonalization: boolean("add_personalization").default(false).notNull(),
  expressService: boolean("express_service").default(false).notNull(),
  keychainPersonalization: text("keychain_personalization"),
  namePersonalization: text("name_personalization"),
  hasBordado: boolean("has_bordado").default(false).notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).$type<number>().notNull(),
  imageUrl: text("image_url"),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  customerPhone: text("customer_phone").notNull(),
  items: text("items").notNull(),
  total: decimal("total", { precision: 10, scale: 2 }).$type<number>().notNull(),
  status: text("status").default("pending").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
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
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const whatsappSessions = pgTable("whatsapp_sessions", {
  id: serial("id").primaryKey(),
  phoneNumber: text("phone_number").notNull().unique(),
  sessionData: text("session_data").notNull(),
  lastActivity: timestamp("last_activity"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
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
  acceptsMarketing: boolean("accepts_marketing").default(false).notNull(),
  status: text("status").default("draft").notNull(),
  sentCount: integer("sent_count").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
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
  discountUsed: boolean("discount_used").default(false).notNull(),
  discountExpiresAt: timestamp("discount_expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// === SCHEMAS ZOD ===
export const insertProductSchema = createInsertSchema(products, {
  name: (s) => s.name.min(1),
  description: (s) => s.description.min(1),
  price: () => z.number().positive(),
  category: (s) => s.category.min(1),
  imageUrl: (s) => s.imageUrl.url(),
  colors: (s) => z.array(z.string()).optional(),
  inStock: (s) => s.inStock,
}).omit({ id: true, createdAt: true, variants: true });

export const insertCartItemSchema = createInsertSchema(cartItems, {
  productId: (s) => s.productId.positive(),
  name: (s) => s.name.min(1),
  quantity: (s) => s.quantity.positive().max(100),
  personalization: (s) => s.personalization.optional(),
  embroideryColor: (s) => s.embroideryColor.optional(),
  embroideryFont: (s) => s.embroideryFont.optional(),
  customPreview: (s) => s.customPreview.optional(),
  addPompon: (s) => s.addPompon,
  addPersonalizedKeychain: (s) => s.addPersonalizedKeychain,
  addDecorativeBow: (s) => s.addDecorativeBow,
  addPersonalization: (s) => s.addPersonalization,
  expressService: (s) => s.expressService,
  keychainPersonalization: (s) => s.keychainPersonalization.optional(),
  namePersonalization: (s) => s.namePersonalization.optional(),
  hasBordado: (s) => s.hasBordado,
  price: () => z.number().positive(),
  imageUrl: (s) => s.imageUrl.optional(),
}).omit({ id: true });

export const insertOrderSchema = createInsertSchema(orders, {
  customerName: (s) => s.customerName.min(1),
  customerEmail: (s) => s.customerEmail.email(),
  customerPhone: (s) => s.customerPhone.min(10),
  items: (s) => s.items.min(1),
  total: () => z.number().positive(),
  status: (s) => s.status,
}).omit({ id: true, createdAt: true, updatedAt: true });

export const insertContactMessageSchema = createInsertSchema(contactMessages, {
  firstName: (s) => s.firstName.min(1),
  lastName: (s) => s.lastName.min(1),
  email: (s) => s.email.email(),
  phone: (s) => s.phone.optional(),
  message: (s) => s.message.min(1),
}).omit({ id: true, createdAt: true });

export const insertWhatsappSessionSchema = createInsertSchema(whatsappSessions, {
  phoneNumber: (s) => s.phoneNumber.min(10),
  sessionData: (s) => s.sessionData.min(1),
}).omit({ id: true, lastActivity: true, createdAt: true });

export const insertEmailCampaignSchema = createInsertSchema(emailCampaigns, {
  campaignName: (s) => s.campaignName.min(1),
  subject: (s) => s.subject.min(1),
  content: (s) => s.content.min(1),
  email: (s) => s.email.min(1),
  firstName: (s) => s.firstName.min(1),
  lastName: (s) => s.lastName.min(1),
  discountCode: (s) => s.discountCode.min(1),
  registrationDate: (s) => s.registrationDate.min(1),
  acceptsMarketing: (s) => s.acceptsMarketing,
  status: (s) => s.status,
  sentCount: (s) => s.sentCount.nonnegative(),
}).omit({ id: true, createdAt: true, sentAt: true });

export const insertRegisteredUserSchema = createInsertSchema(registeredUsers, {
  email: (s) => s.email.email(),
  passwordHash: (s) => s.passwordHash.min(8),
  name: (s) => s.name.min(2),
  phone: (s) => s.phone.optional(),
  shippingAddress: (s) => s.shippingAddress.optional(),
}).omit({ id: true, createdAt: true });

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
export type RegisteredUser = typeof registeredUsers.$inferSelect;
export type InsertRegisteredUser = z.infer<typeof insertRegisteredUserSchema>;