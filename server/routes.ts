import type { Express, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { WompiService } from "./wompi-service";
import { z } from "zod";
import {
  insertCartItemSchema,
  insertOrderSchema,
  insertContactMessageSchema,
} from "@shared/schema";

// ⚠️ Stripe deshabilitado: NO importamos "stripe" ni exigimos STRIPE_SECRET_KEY.
function stripeGuard(res: Response) {
  return res
    .status(501)
    .json({ message: "Stripe deshabilitado; el backend usa Wompi." });
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Products
  app.get("/api/products", async (_req, res) => {
    try {
      const products = await storage.getProducts();
      res.json(products);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      console.error("Error fetching products:", error);
      res.status(500).json({ message: "Error fetching products", error: errorMessage });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      const product = await storage.getProduct(id);
      if (!product) return res.status(404).json({ message: "Product not found" });
      res.json(product);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      console.error("Error fetching product:", error);
      res.status(500).json({ message: "Error fetching product", error: errorMessage });
    }
  });

  // Cart
  app.get("/api/cart", async (_req, res) => {
    try {
      const items = await storage.getCartItems();
      res.json(items);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      console.error("Error fetching cart items:", error);
      res.status(500).json({ message: "Error fetching cart items", error: errorMessage });
    }
  });

  app.post("/api/cart", async (req, res) => {
    try {
      console.log("Datos recibidos en /api/cart:", req.body);
      const validated = insertCartItemSchema.parse({
        ...req.body,
        price: z.preprocess((val) => (val ? Number(val) : 0), z.number()),
      });
      const item = await storage.addCartItem(validated);
      res.status(201).json(item);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error("Zod validation error in /api/cart:", error.errors);
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      console.error("Error adding item to cart:", error);
      res.status(500).json({ message: "Error adding item to cart", error: errorMessage });
    }
  });

  app.put("/api/cart/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      const { quantity } = req.body;
      const item = await storage.updateCartItem(id, quantity);
      if (!item) return res.status(404).json({ message: "Cart item not found" });
      res.json(item);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      console.error("Error updating cart item:", error);
      res.status(500).json({ message: "Error updating cart item", error: errorMessage });
    }
  });

  app.delete("/api/cart/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      const ok = await storage.removeCartItem(id);
      if (!ok) return res.status(404).json({ message: "Cart item not found" });
      res.json({ message: "Item removed from cart" });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      console.error("Error removing cart item:", error);
      res.status(500).json({ message: "Error removing cart item", error: errorMessage });
    }
  });

  app.delete("/api/cart", async (_req, res) => {
    try {
      await storage.clearCart();
      res.json({ message: "Cart cleared" });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      console.error("Error clearing cart:", error);
      res.status(500).json({ message: "Error clearing cart", error: errorMessage });
    }
  });

  // Orders
  app.post("/api/orders", async (req, res) => {
    try {
      const validated = insertOrderSchema.parse(req.body);
      const order = await storage.createOrder(validated);
      res.json(order);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      console.error("Error creating order:", error);
      res.status(500).json({ message: "Error creating order", error: errorMessage });
    }
  });

  // Contact
  app.post("/api/contact", async (req, res) => {
    try {
      const validated = insertContactMessageSchema.parse(req.body);
      const message = await storage.createContactMessage(validated);
      res.json(message);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      console.error("Error sending message:", error);
      res.status(500).json({ message: "Error sending message", error: errorMessage });
    }
  });

  // 🔵 Endpoint legacy de Stripe → ahora responde 501 (no implementado)
  app.post("/api/payment/stripe/create-payment-intent", (_req, res) => {
    return stripeGuard(res);
  });

  // 🟣 Wompi (placeholder simple; ajusta con tu lógica del servicio)
  const wompiService = new WompiService();

  app.post("/api/payment/wompi/create-payment", async (req, res) => {
    try {
      const { amount, currency = "COP", customerEmail, orderReference } = req.body;
      res.json({
        payment_url: "https://checkout.wompi.co/p/test",
        reference: orderReference,
        amount,
        currency,
        customerEmail,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      console.error("Error creating Wompi payment:", error);
      res.status(500).json({ message: "Error creating payment", error: errorMessage });
    }
  });

  app.post("/api/payment/wompi/webhook", async (req, res) => {
    try {
      console.log("Wompi webhook received:", req.body);
      res.status(200).json({ received: true });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      console.error("Error processing Wompi webhook:", error);
      res.status(500).json({ message: "Error processing webhook", error: errorMessage });
    }
  });

  // WhatsApp (simplificado)
  app.post("/webhook/whatsapp", async (req, res) => {
    try {
      console.log("WhatsApp message received:", req.body);
      res.status(200).json({ message: "Message received" });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      console.error("WhatsApp webhook error:", error);
      res.status(500).json({ message: "Error processing WhatsApp message", error: errorMessage });
    }
  });

  app.get("/webhook/whatsapp", (req, res) => {
    const verifyToken = process.env.META_WEBHOOK_VERIFY_TOKEN;
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];
    if (mode && token) {
      if (mode === "subscribe" && token === verifyToken) {
        console.log("Webhook verified successfully!");
        res.status(200).send(challenge as any);
      } else {
        res.status(403).send("Forbidden");
      }
    } else {
      res.status(400).send("Bad Request");
    }
  });

  // Auth (dummy)
  app.get("/api/auth/check", (_req, res) => {
    res.json({ isAuthenticated: false, user: null });
  });

  const server = createServer(app);

  // Manejo global de excepciones
  process.on("uncaughtException", (error) => {
    console.error("Uncaught Exception:", error);
  });

  process.on("SIGTERM", () => {
    console.log("SIGTERM received, shutting down gracefully...");
    server.close(() => {
      console.log("Server closed");
      process.exit(0);
    });
  });

  return server;
}