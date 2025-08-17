// shared/schema.ts
import {
  pgTable,
  text,
  serial,
  integer,
  boolean,
  decimal, // Puedes usar numeric si prefieres; decimal es alias
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

  name: text("name").notNull(), // Nombre del producto, requerido
  description: text("description").notNull(), // Descripción, requerida

  // IMPORTANTE: que sea number en TS para compatibilidad con el frontend
  price: decimal("price", { precision: 10, scale: 2 }).$type<number>().notNull(),

  category: text("category").notNull(), // Categoría, requerida

  imageUrl: text("image_url").notNull(), // URL de la imagen principal (con bordado)
  blankImageUrl: text("blank_image_url"), // URL de imagen sin bordado, opcional
  referenceImageUrl: text("reference_image_url"), // Foto de referencia, opcional

  animalType: text("animal_type"), // Tipo de animal, opcional

  // Opcional para evitar errores cuando el seed no lo envía
  colors: text("colors").array(), // Array de colores, opcional

  inStock: boolean("in_stock").default(true).notNull(), // Disponibilidad, por defecto true

  variants: jsonb("variants").$type<ProductVariants>(), // Variantes en formato JSON

  createdAt: timestamp("created_at").defaultNow().notNull(), // Fecha de creación, automática
});

export const cartItems = pgTable("cart_items", {
  id: serial("id").primaryKey(),

  productId: integer("product_id")
    .notNull()
    .references(() => products.id), // Referencia al producto

  name: text("name").notNull(), // Nombre del producto, requerido por el backend

  quantity: integer("quantity").default(1).notNull(), // Cantidad, por defecto 1

  personalization: text("personalization"), // Personalización, opcional
  embroideryColor: text("embroidery_color"), // Color del bordado, opcional
  embroideryFont: text("embroidery_font"), // Fuente del bordado, opcional
  customPreview: text("custom_preview"), // Vista previa personalizada, opcional

  addPompon: boolean("add_pompon").default(false).notNull(), // Añadir pompón, por defecto false
  addPersonalizedKeychain: boolean("add_personalized_keychain").default(false).notNull(), // Llaveros personalizados, por defecto false
  addDecorativeBow: boolean("add_decorative_bow").default(false).notNull(), // Lazo decorativo, por defecto false
  addPersonalization: boolean("add_personalization").default(false).notNull(), // Personalización adicional, por defecto false
  expressService: boolean("express_service").default(false).notNull(), // Servicio exprés, por defecto false

  keychainPersonalization: text("keychain_personalization"), // Personalización del llavero, opcional
  hasBordado: boolean("has_bordado").default(false).notNull(), // Tiene bordado, por defecto false

  // number en TS para compatibilidad con el frontend
  price: decimal("price", { precision: 10, scale: 2 }).$type<number>().notNull(), // Precio, requerido
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),

  customerName: text("customer_name").notNull(), // Nombre del cliente, requerido
  customerEmail: text("customer_email").notNull(), // Email del cliente, requerido
  customerPhone: text("customer_phone").notNull(), // Teléfono del cliente, requerido

  // Mantengo TEXT para no romper tu backend actual (guarda JSON serializado)
  items: text("items").notNull(), // Ítems como JSON serializado

  total: decimal("total", { precision: 10, scale: 2 }).$type<number>().notNull(), // Total, requerido

  status: text("status").default("pending").notNull(), // Estado, por defecto "pending"

  createdAt: timestamp("created_at").defaultNow().notNull(), // Fecha de creación, automática
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdateFn(() => new Date()), // Fecha de actualización, automática
});

export const contactMessages = pgTable("contact_messages", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(), // Nombre, requerido
  lastName: text("last_name").notNull(), // Apellido, requerido
  email: text("email").notNull(), // Email, requerido
  phone: text("phone"), // Teléfono, opcional
  message: text("message").notNull(), // Mensaje, requerido
  createdAt: timestamp("created_at").defaultNow().notNull(), // Fecha de creación, automática
});

export const whatsappSessions = pgTable("whatsapp_sessions", {
  id: serial("id").primaryKey(),
  phoneNumber: text("phone_number").notNull().unique(), // Número de teléfono, único
  sessionData: text("session_data").notNull(), // Datos de sesión como JSON serializado
  lastActivity: timestamp("last_activity"), // Última actividad, opcional
  createdAt: timestamp("created_at").defaultNow().notNull(), // Fecha de creación, automática
});

export const emailCampaigns = pgTable("email_campaigns", {
  id: serial("id").primaryKey(),
  campaignName: text("campaign_name").notNull(), // Nombre de la campaña, requerido
  subject: text("subject").notNull(), // Asunto, requerido
  content: text("content").notNull(), // Contenido, requerido
  email: text("email").notNull(), // Email, requerido
  firstName: text("first_name").notNull(), // Nombre, requerido
  lastName: text("last_name").notNull(), // Apellido, requerido
  discountCode: text("discount_code").notNull(), // Código de descuento, requerido
  registrationDate: text("registration_date").notNull(), // Fecha de registro, requerido
  acceptsMarketing: boolean("accepts_marketing").default(false).notNull(), // Acepta marketing, por defecto false
  status: text("status").default("draft").notNull(), // Estado, por defecto "draft"
  sentCount: integer("sent_count").default(0).notNull(), // Contador de envíos, por defecto 0
  createdAt: timestamp("created_at").defaultNow().notNull(), // Fecha de creación, automática
  sentAt: timestamp("sent_at"), // Fecha de envío, opcional
});

export const registeredUsers = pgTable("registered_users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(), // Email, único
  passwordHash: text("password_hash").notNull(), // Hash de contraseña, requerido
  name: text("name").notNull(), // Nombre, requerido
  phone: text("phone"), // Teléfono, opcional
  shippingAddress: text("shipping_address"), // Dirección de envío, opcional
  discountCode: text("discount_code"), // Código de descuento, opcional
  discountUsed: boolean("discount_used").default(false).notNull(), // Descuento usado, por defecto false
  discountExpiresAt: timestamp("discount_expires_at"), // Fecha de expiración del descuento, opcional
  createdAt: timestamp("created_at").defaultNow().notNull(), // Fecha de creación, automática
});

// === SCHEMAS ZOD ===
export const insertProductSchema = createInsertSchema(products, {
  name: (s) => s.name.min(1), // Nombre mínimo 1 carácter
  description: (s) => s.description.min(1), // Descripción mínima 1 carácter
  price: () => z.number().positive(), // Precio positivo
  category: (s) => s.category.min(1), // Categoría mínima 1 carácter
  imageUrl: (s) => s.imageUrl.url(), // URL válida
  // colors ahora es opcional
  colors: (/* s */) => z.array(z.string()).optional(),
  inStock: (s) => s.inStock, // Booleano
}).omit({ id: true, createdAt: true, variants: true }); // Omitir id y createdAt

export const insertCartItemSchema = createInsertSchema(cartItems, {
  productId: (s) => s.productId.positive(), // ID positivo
  name: (s) => s.name.min(1), // Nombre mínimo 1 carácter
  quantity: (s) => s.quantity.positive().max(100), // Cantidad entre 1 y 100
  personalization: (s) => s.personalization.optional(), // Opcional
  embroideryColor: (s) => s.embroideryColor.optional(), // Opcional
  embroideryFont: (s) => s.embroideryFont.optional(), // Opcional
  customPreview: (s) => s.customPreview.optional(), // Opcional
  addPompon: (s) => s.addPompon, // Booleano
  addPersonalizedKeychain: (s) => s.addPersonalizedKeychain, // Booleano
  addDecorativeBow: (s) => s.addDecorativeBow, // Booleano
  addPersonalization: (s) => s.addPersonalization, // Booleano
  expressService: (s) => s.expressService, // Booleano
  keychainPersonalization: (s) => s.keychainPersonalization.optional(), // Opcional
  hasBordado: (s) => s.hasBordado, // Booleano
  price: () => z.number().positive(), // Precio positivo
}).omit({ id: true }); // Omitir id

export const insertOrderSchema = createInsertSchema(orders, {
  customerName: (s) => s.customerName.min(1), // Nombre mínimo 1 carácter
  customerEmail: (s) => s.customerEmail.email(), // Email válido
  customerPhone: (s) => s.customerPhone.min(10), // Teléfono mínimo 10 caracteres
  items: (s) => s.items.min(1), // Ítems mínimo 1 carácter
  total: () => z.number().positive(), // Total positivo
  status: (s) => s.status, // Estado
}).omit({ id: true, createdAt: true, updatedAt: true }); // Omitir id y fechas

export const insertContactMessageSchema = createInsertSchema(contactMessages, {
  firstName: (s) => s.firstName.min(1), // Nombre mínimo 1 carácter
  lastName: (s) => s.lastName.min(1), // Apellido mínimo 1 carácter
  email: (s) => s.email.email(), // Email válido
  phone: (s) => s.phone.optional(), // Opcional
  message: (s) => s.message.min(1), // Mensaje mínimo 1 carácter
}).omit({ id: true, createdAt: true }); // Omitir id y createdAt

export const insertWhatsappSessionSchema = createInsertSchema(whatsappSessions, {
  phoneNumber: (s) => s.phoneNumber.min(10), // Teléfono mínimo 10 caracteres
  sessionData: (s) => s.sessionData.min(1), // Datos mínimo 1 carácter
}).omit({ id: true, lastActivity: true, createdAt: true }); // Omitir id y fechas

export const insertEmailCampaignSchema = createInsertSchema(emailCampaigns, {
  campaignName: (s) => s.campaignName.min(1), // Nombre mínimo 1 carácter
  subject: (s) => s.subject.min(1), // Asunto mínimo 1 carácter
  content: (s) => s.content.min(1), // Contenido mínimo 1 carácter
  email: (s) => s.email.min(1), // Email mínimo 1 carácter
  firstName: (s) => s.firstName.min(1), // Nombre mínimo 1 carácter
  lastName: (s) => s.lastName.min(1), // Apellido mínimo 1 carácter
  discountCode: (s) => s.discountCode.min(1), // Código mínimo 1 carácter
  registrationDate: (s) => s.registrationDate.min(1), // Fecha mínima 1 carácter
  acceptsMarketing: (s) => s.acceptsMarketing, // Booleano
  status: (s) => s.status, // Estado
  sentCount: (s) => s.sentCount.nonnegative(), // Contador no negativo
}).omit({ id: true, createdAt: true, sentAt: true }); // Omitir id y fechas

export const insertRegisteredUserSchema = createInsertSchema(registeredUsers, {
  email: (s) => s.email.email(), // Email válido
  passwordHash: (s) => s.passwordHash.min(8), // Hash mínimo 8 caracteres
  name: (s) => s.name.min(2), // Nombre mínimo 2 caracteres
  phone: (s) => s.phone.optional(), // Opcional
  shippingAddress: (s) => s.shippingAddress.optional(), // Opcional
}).omit({ id: true, createdAt: true }); // Omitir id y createdAt

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