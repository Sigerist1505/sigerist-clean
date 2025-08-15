import { pgTable, text, serial, integer, decimal, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// Tabla de productos
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().default("Producto de Prueba"),
  description: text("description").notNull().default("Descripción predeterminada"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull().default("0.00"),
  category: text("category").notNull().default("Sin categoría"),
  imageUrl: text("image_url").notNull().default("/attached_assets/default.jpg"),
  blankImageUrl: text("blank_image_url"), // Para imágenes sin bordado
  referenceImageUrl: text("reference_image_url"),
  animalType: text("animal_type"),
  colors: text("colors").array().default([]),
  variants: jsonb("variants").default('{}'), // JSONB para almacenar bordado u otras variantes, ej. {"bordado": true, "bordadoImageUrl": "..."}
  inStock: boolean("in_stock").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Tabla de ítems del carrito
export const cartItems = pgTable("cart_items", {
  id: serial("id").primaryKey(),
  cartId: integer("cart_id").notNull().references(() => carts.id),
  productId: integer("product_id").notNull().references(() => products.id),
  quantity: integer("quantity").notNull().default(1),
  personalization: text("personalization"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Tabla de carritos
export const carts = pgTable("carts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => registeredUsers.id),
  sessionId: text("session_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

// Tabla de órdenes
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => registeredUsers.id),
  cartId: integer("cart_id").notNull().references(() => carts.id),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default("pending"),
  shippingAddress: text("shipping_address"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

// Tabla de mensajes de contacto
export const contactMessages = pgTable("contact_messages", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Tabla de usuarios registrados
export const registeredUsers = pgTable("registered_users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Tabla de sesiones de WhatsApp (si integras automatización)
export const whatsappSessions = pgTable("whatsapp_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => registeredUsers.id),
  sessionToken: text("session_token").notNull(),
  status: text("status").notNull().default("active"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Tabla de campañas de email (para automatizaciones)
export const emailCampaigns = pgTable("email_campaigns", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  subject: text("subject").notNull(),
  body: text("body").notNull(),
  scheduledAt: timestamp("scheduled_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Schemas Zod para validación
export const insertProductSchema = createInsertSchema(products).pick({
  name: true,
  description: true,
  price: true,
  category: true,
  imageUrl: true,
  blankImageUrl: true,
  referenceImageUrl: true,
  animalType: true,
  colors: true,
  variants: true,
  inStock: true,
}).refine((data) => {
  if (data.variants && typeof data.variants === "string") {
    try {
      JSON.parse(data.variants);
      return true;
    } catch {
      return false;
    }
  }
  return true;
}, {
  message: "variants debe ser un JSON válido",
  path: ["variants"],
});

export const insertCartItemSchema = createInsertSchema(cartItems).pick({
  cartId: true,
  productId: true,
  quantity: true,
  personalization: true,
  price: true,
});

export const insertOrderSchema = createInsertSchema(orders).pick({
  userId: true,
  cartId: true,
  total: true,
  status: true,
  shippingAddress: true,
});

export const insertContactMessageSchema = createInsertSchema(contactMessages).pick({
  name: true,
  email: true,
  message: true,
});

export const insertRegisteredUserSchema = createInsertSchema(registeredUsers).pick({
  name: true,
  email: true,
  password: true,
});

export const insertWhatsappSessionSchema = createInsertSchema(whatsappSessions).pick({
  userId: true,
  sessionToken: true,
  status: true,
});

export const insertEmailCampaignSchema = createInsertSchema(emailCampaigns).pick({
  name: true,
  subject: true,
  body: true,
  scheduledAt: true,
});

// Tipos de datos
export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type CartItem = typeof cartItems.$inferSelect;
export type InsertCartItem = z.infer<typeof insertCartItemSchema>;
export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type ContactMessage = typeof contactMessages.$inferSelect;
export type InsertContactMessage = z.infer<typeof insertContactMessageSchema>;
export type RegisteredUser = typeof registeredUsers.$inferSelect;
export type InsertRegisteredUser = z.infer<typeof insertRegisteredUserSchema>;
export type WhatsappSession = typeof whatsappSessions.$inferSelect;
export type InsertWhatsappSession = z.infer<typeof insertWhatsappSessionSchema>;