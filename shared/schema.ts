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
  blankImageUrl?: string;
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

  sessionId: text("session_id").notNull(), // Añadido: ID de sesión para carrito privado

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
  addNameEmbroidery: boolean("add_name_embroidery").default(false).notNull(), // Añadir bordado de nombre, por defecto false
  hasBordado: boolean("has_bordado").default(false).notNull(), // Tiene bordado, por defecto false

  // number en TS para compatibilidad con el frontend
  price: decimal("price", { precision: 10, scale: 2 }).$type<number>().notNull(), // Precio, requerido
  // imageUrl removed - not in seed database schema
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

  // Wompi transaction tracking fields
  transactionId: text("transaction_id"), // ID de transacción de Wompi
  paymentReference: text("payment_reference"), // Referencia de pago de Wompi
  paymentMethod: text("payment_method"), // Método de pago usado
  
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
  acceptsMarketing: boolean("accepts_marketing").default(false).notNull(), // Acepta marketing, por defecto false
  createdAt: timestamp("created_at").defaultNow().notNull(), // Fecha de creación, automática
});

export const passwordResetCodes = pgTable("password_reset_codes", {
  id: serial("id").primaryKey(),
  email: text("email").notNull(), // Email del usuario
  code: text("code").notNull(), // Código de 6 dígitos
  expiresAt: timestamp("expires_at").notNull(), // Fecha de expiración (15 minutos)
  used: boolean("used").default(false).notNull(), // Si el código ya fue usado
  createdAt: timestamp("created_at").defaultNow().notNull(), // Fecha de creación
});

// === SCHEMAS ZOD ===
export const insertProductSchema = createInsertSchema(products, {
  name: (s) => s.name.min(1),
  description: (s) => s.description.min(1),
  price: () => z.number().positive(),
  category: (s) => s.category.min(1),
  imageUrl: (s) => s.imageUrl.url(),
  colors: (/* s */) => z.array(z.string()).optional(),
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
  addNameEmbroidery: (s) => s.addNameEmbroidery,
  hasBordado: (s) => s.hasBordado,
  price: () => z.number().positive(),
}).omit({ id: true });

export const insertOrderSchema = createInsertSchema(orders, {
  customerName: (s) => s.customerName.min(1),
  customerEmail: (s) => s.customerEmail.email(),
  customerPhone: (s) => s.customerPhone.min(10),
  items: (s) => s.items.min(1),
  total: () => z.number().positive(),
  status: (s) => s.status,
  transactionId: (s) => s.transactionId.optional(),
  paymentReference: (s) => s.paymentReference.optional(),
  paymentMethod: (s) => s.paymentMethod.optional(),
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
  acceptsMarketing: (s) => s.acceptsMarketing,
}).omit({ id: true, createdAt: true });

export const insertPasswordResetCodeSchema = createInsertSchema(passwordResetCodes, {
  email: (s) => s.email.email(),
  code: (s) => s.code.length(6, "El código debe tener 6 dígitos"),
  expiresAt: (s) => s.expiresAt,
  used: (s) => s.used,
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
export type PasswordResetCode = typeof passwordResetCodes.$inferSelect;
export type InsertPasswordResetCode = z.infer<typeof insertPasswordResetCodeSchema>;