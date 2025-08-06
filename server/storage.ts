import { db } from "./db.js";
import {
  products,
  cartItems,
  orders,
  contactMessages,
  type Product,
  type CartItem,
  type Order,
  type ContactMessage,
  type InsertProduct,
  type InsertCartItem,
  type InsertOrder,
  type InsertContactMessage,
} from "@shared/schema.js";
import { eq } from "drizzle-orm";

export interface IStorage {
  // Products
  getProducts(): Promise<Product[]>;
  getProduct(id: number): Promise<Product | null>;
  createProduct(product: InsertProduct): Promise<Product>;

  // Cart
  getCartItems(): Promise<CartItem[]>;
  addCartItem(item: InsertCartItem): Promise<CartItem>;
  updateCartItem(id: number, quantity: number): Promise<CartItem | null>;
  removeCartItem(id: number): Promise<boolean>;
  clearCart(): Promise<boolean>;

  // Orders
  createOrder(order: InsertOrder): Promise<Order>;
  getOrders(): Promise<Order[]>;

  // Contact
  createContactMessage(message: InsertContactMessage): Promise<ContactMessage>;
}

class PostgresStorage implements IStorage {
  async getProducts(): Promise<Product[]> {
    return await db.select().from(products);
  }

  async getProduct(id: number): Promise<Product | null> {
    const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
    return result[0] || null;
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const result = await db.insert(products).values(product).returning();
    return result[0];
  }

  async getCartItems(): Promise<CartItem[]> {
    return await db.select().from(cartItems);
  }

  async addCartItem(item: InsertCartItem): Promise<CartItem> {
    const result = await db.insert(cartItems).values(item).returning();
    return result[0];
  }

  async updateCartItem(id: number, quantity: number): Promise<CartItem | null> {
    const result = await db
      .update(cartItems)
      .set({ quantity })
      .where(eq(cartItems.id, id))
      .returning();
    return result[0] || null;
  }

  async removeCartItem(id: number): Promise<boolean> {
    const result = await db.delete(cartItems).where(eq(cartItems.id, id)).returning();
    return result.length > 0;
  }

  async clearCart(): Promise<boolean> {
    await db.delete(cartItems);
    return true;
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const result = await db.insert(orders).values(order).returning();
    return result[0];
  }

  async getOrders(): Promise<Order[]> {
    return await db.select().from(orders);
  }

  async createContactMessage(message: InsertContactMessage): Promise<ContactMessage> {
    const result = await db.insert(contactMessages).values(message).returning();
    return result[0];
  }

  // Initialize with sample data
  async initializeData(): Promise<void> {
    try {
      const existingProducts = await this.getProducts();
      if (existingProducts.length > 0) {
        console.log("📦 Products already exist, skipping initialization");
        return;
      }

      console.log("🌱 Initializing sample products...");
      
      const sampleProducts: InsertProduct[] = [
        {
          name: "Mochila Clásica",
          description: "Mochila elegante perfecta para el día a día con compartimientos organizadores",
          price: "75000",
          category: "Mochilas",
          imageUrl: "/assets/IMG-20250531-WA0003.jpg",
          animalType: null,
          colors: ["Negro", "Rosa", "Azul"],
          inStock: true,
        },
        {
          name: "Maleta Milano",
          description: "Maleta de viaje con diseño sofisticado y múltiples compartimientos",
          price: "120000",
          category: "Maletas",
          imageUrl: "/assets/IMG-20250531-WA0004.jpg",
          animalType: null,
          colors: ["Negro", "Marrón"],
          inStock: true,
        },
        {
          name: "Pañalera Multifuncional",
          description: "Pañalera espaciosa con organizadores internos y cambiador incluido",
          price: "95000",
          category: "Pañaleras",
          imageUrl: "/assets/IMG-20250531-WA0005.jpg",
          animalType: null,
          colors: ["Rosa", "Celeste", "Gris"],
          inStock: true,
        }
      ];

      for (const product of sampleProducts) {
        await this.createProduct(product);
      }

      console.log("✅ Sample products initialized successfully");
    } catch (error) {
      console.error("❌ Error initializing data:", error);
    }
  }
}

export const storage = new PostgresStorage();