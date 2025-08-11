import { pgTable, text, serial, integer, boolean, decimal, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod"; // <-- AÑADIDO
import { z } from "zod";

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  category: text("category").notNull(),
  imageUrl: text("image_url").notNull(),
  animalType: text("animal_type"),
  colors: text("colors").array(),
  inStock: boolean("in_stock").default(true),
});

export const cartItems = pgTable("cart_items", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull(),
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
  createdAt: text("created_at").notNull(),
});

export const contactMessages = pgTable("contact_messages", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  message: text("message").notNull(),
  createdAt: text("created_at").notNull(),
});

// === NUEVAS TABLAS QUE NECESITA server/storage.ts ===
export const whatsappSessions = pgTable("whatsapp_sessions", {
  id: serial("id").primaryKey(),
  phoneNumber: text("phone_number").notNull().unique(),
  sessionData: text("session_data").notNull(), // JSON serializado
  lastActivity: text("last_activity"),
  createdAt: text("created_at"),
});

export const emailCampaigns = pgTable("email_campaigns", {
  id: serial("id").primaryKey(),
  campaignName: text("campaign_name").notNull(),
  subject: text("subject").notNull(),
  content: text("content").notNull(),
  status: text("status").default("draft"),
  sentCount: integer("sent_count").default(0),
  createdAt: text("created_at"),
  sentAt: text("sent_at"),
});

// === REGISTERED USERS (para register.tsx) ===
export const registeredUsers = pgTable("registered_users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull(),
  phone: text("phone"),
  shippingAddress: text("shipping_address"),
  createdAt: timestamp("created_at").defaultNow(), // <-- requiere el import de timestamp
});

// Schemas Zod
export const insertProductSchema = createInsertSchema(products).pick({
  name: true,
  description: true,
  price: true,
  category: true,
  imageUrl: true,
  animalType: true,
  colors: true,
  inStock: true,
});

export const insertCartItemSchema = createInsertSchema(cartItems).pick({
  productId: true,
  name: true,
  quantity: true,
  personalization: true,
  embroideryColor: true,
  embroideryFont: true,
  customPreview: true,
  addPompon: true,
  addPersonalizedKeychain: true,
  addDecorativeBow: true,
  addPersonalization: true,
  expressService: true,
  keychainPersonalization: true,
  hasBordado: true,
  price: true,
});

export const insertOrderSchema = createInsertSchema(orders).pick({
  customerName: true,
  customerEmail: true,
  customerPhone: true,
  items: true,
  total: true,
  status: true,
  createdAt: true,
});

export const insertContactMessageSchema = createInsertSchema(contactMessages).pick({
  firstName: true,
  lastName: true,
  email: true,
  phone: true,
  message: true,
  createdAt: true,
});

export const insertRegisteredUserSchema = createInsertSchema(registeredUsers, {
  email: (schema) => schema.email.email(),
  passwordHash: (schema) => schema.passwordHash.min(8),
  name: (schema) => schema.name.min(2),
});
export const selectRegisteredUserSchema = createSelectSchema(registeredUsers);

// Types
export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type CartItem = typeof cartItems.$inferSelect;
export type InsertCartItem = z.infer<typeof insertCartItemSchema>;
export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type ContactMessage = typeof contactMessages.$inferSelect;
export type InsertContactMessage = z.infer<typeof insertContactMessageSchema>;
export type InsertRegisteredUser = z.infer<typeof insertRegisteredUserSchema>;
export type RegisteredUser = z.infer<typeof selectRegisteredUserSchema>;
