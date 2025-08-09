import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { WompiService } from "./wompi-service";
import { z } from "zod";
import { insertCartItemSchema, insertOrderSchema, insertContactMessageSchema } from "@shared/schema";
// import { advancedAiChatbot } from "./advanced-ai-chatbot"; // Disabled for clean version
import Stripe from "stripe";

// Initialize Stripe
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY environment variable is required');
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Get all products
  app.get("/api/products", async (req, res) => {
    try {
      const products = await storage.getProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Error fetching products" });
    }
  });

  // Get single product
  app.get("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const product = await storage.getProduct(id);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "Error fetching product" });
    }
  });

  // Cart operations
  app.get("/api/cart", async (req, res) => {
    try {
      const items = await storage.getCartItems();
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Error fetching cart items" });
    }
  });

  app.post("/api/cart", async (req, res) => {
    try {
      const validatedData = insertCartItemSchema.parse(req.body);
      const item = await storage.addCartItem(validatedData);
      res.json(item);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Error adding item to cart" });
    }
  });

  app.put("/api/cart/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { quantity } = req.body;
      
      const item = await storage.updateCartItem(id, quantity);
      if (!item) {
        return res.status(404).json({ message: "Cart item not found" });
      }
      
      res.json(item);
    } catch (error) {
      res.status(500).json({ message: "Error updating cart item" });
    }
  });

  app.delete("/api/cart/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.removeCartItem(id);
      
      if (!success) {
        return res.status(404).json({ message: "Cart item not found" });
      }
      
      res.json({ message: "Item removed from cart" });
    } catch (error) {
      res.status(500).json({ message: "Error removing cart item" });
    }
  });

  app.delete("/api/cart", async (req, res) => {
    try {
      await storage.clearCart();
      res.json({ message: "Cart cleared" });
    } catch (error) {
      res.status(500).json({ message: "Error clearing cart" });
    }
  });

  // Orders
  app.post("/api/orders", async (req, res) => {
    try {
      const validatedData = insertOrderSchema.parse(req.body);
      const order = await storage.createOrder(validatedData);
      res.json(order);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating order" });
    }
  });

  // Contact messages
  app.post("/api/contact", async (req, res) => {
    try {
      const validatedData = insertContactMessageSchema.parse(req.body);
      const message = await storage.createContactMessage(validatedData);
      res.json(message);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Error sending message" });
    }
  });

  // Payment integration
  app.post("/api/payment/stripe/create-payment-intent", async (req, res) => {
    try {
      const { amount, currency = 'usd' } = req.body;

      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency,
        automatic_payment_methods: {
          enabled: true,
        },
      });

      res.json({
        clientSecret: paymentIntent.client_secret,
      });
    } catch (error) {
      console.error('Error creating payment intent:', error);
      res.status(500).json({ message: 'Error creating payment intent' });
    }
  });

  // Wompi payment integration
  const wompiService = new WompiService();
  
  app.post("/api/payment/wompi/create-payment", async (req, res) => {
    try {
      const { amount, currency, customerEmail, orderReference } = req.body;
      
      // Wompi integration would go here
      const paymentData = {
        payment_url: 'https://checkout.wompi.co/p/test',
        reference: orderReference
      };
      
      res.json(paymentData);
    } catch (error) {
      console.error('Error creating Wompi payment:', error);
      res.status(500).json({ message: 'Error creating payment' });
    }
  });

  app.post("/api/payment/wompi/webhook", async (req, res) => {
    try {
      const event = req.body;
      console.log('Wompi webhook received:', event);
      
      // Process the webhook event (would implement here)
      console.log('Wompi webhook processed:', event);
      
      res.status(200).json({ received: true });
    } catch (error) {
      console.error('Error processing Wompi webhook:', error);
      res.status(500).json({ message: 'Error processing webhook' });
    }
  });

  // WhatsApp chatbot (simplified for clean version)
  app.post("/webhook/whatsapp", async (req, res) => {
    try {
      console.log('WhatsApp message received:', req.body);
      res.status(200).json({ message: 'Message received' });
    } catch (error) {
      console.error('WhatsApp webhook error:', error);
      res.status(500).json({ message: 'Error processing WhatsApp message' });
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
        res.status(200).send(challenge);
      } else {
        res.status(403).send("Forbidden");
      }
    } else {
      res.status(400).send("Bad Request");
    }
  });

  // Authentication (basic implementation)
  app.get("/api/auth/check", (req, res) => {
    res.json({ 
      isAuthenticated: false, 
      user: null 
    });
  });

  const server = createServer(app);
  return server;
}