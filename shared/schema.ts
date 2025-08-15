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
  animalType: text("animal_type"),
  colors: text("colors").array().notNull(), // Array de strings
  inStock: boolean("in_stock").default(true),
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
  createdAt: timestamp("created_at").defaultNow(),
});

// === SCHEMAS ZOD ===
export const insertProductSchema = createInsertSchema(products, {
  name: (schema) => schema.name.min(1),
  description: (schema) => schema.description.min(1),
  price: (schema) => z.number().positive(), // Ajuste para validar números positivos
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
  price: (schema) => z.number().positive(), // Ajuste para validar números positivos
}).omit({ id: true });

export const insertOrderSchema = createInsertSchema(orders, {
  customerName: (schema) => schema.customerName.min(1),
  customerEmail: (schema) => schema.customerEmail.email(),
  customerPhone: (schema) => schema.customerPhone.min(10),
  items: (schema) => schema.items.min(1),
  total: (schema) => z.number().positive(), // Ajuste para validar números positivos
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