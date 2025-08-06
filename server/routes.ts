import express from "express";
import { z } from "zod";
import { storage } from "./storage.js";
import { insertCartItemSchema, insertOrderSchema, insertContactMessageSchema } from "@shared/schema.js";
import Stripe from "stripe";

// Initialize Stripe
const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

export function setupRoutes(app: express.Express) {
  // Initialize data on first run
  storage.initializeData();

  // Products routes
  app.get("/api/products", async (req, res) => {
    try {
      const products = await storage.getProducts();
      res.json(products);
    } catch (error) {
      console.error('Error fetching products:', error);
      res.status(500).json({ message: 'Error fetching products' });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const product = await storage.getProduct(id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      console.error('Error fetching product:', error);
      res.status(500).json({ message: 'Error fetching product' });
    }
  });

  // Cart routes
  app.get("/api/cart", async (req, res) => {
    try {
      const cartItems = await storage.getCartItems();
      res.json(cartItems);
    } catch (error) {
      console.error('Error fetching cart:', error);
      res.status(500).json({ message: 'Error fetching cart' });
    }
  });

  app.post("/api/cart", async (req, res) => {
    try {
      const validatedData = insertCartItemSchema.parse(req.body);
      const item = await storage.addCartItem(validatedData);
      res.json(item);
    } catch (error) {
      console.error('Error adding to cart:', error);
      res.status(400).json({ message: 'Error adding item to cart' });
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
      console.error('Error updating cart item:', error);
      res.status(500).json({ message: 'Error updating cart item' });
    }
  });

  app.delete("/api/cart/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.removeCartItem(id);
      if (!success) {
        return res.status(404).json({ message: "Cart item not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error('Error removing cart item:', error);
      res.status(500).json({ message: 'Error removing cart item' });
    }
  });

  app.delete("/api/cart", async (req, res) => {
    try {
      await storage.clearCart();
      res.json({ success: true });
    } catch (error) {
      console.error('Error clearing cart:', error);
      res.status(500).json({ message: 'Error clearing cart' });
    }
  });

  // Orders route
  app.post("/api/orders", async (req, res) => {
    try {
      const validatedData = insertOrderSchema.parse(req.body);
      const order = await storage.createOrder(validatedData);
      res.json(order);
    } catch (error) {
      console.error('Error creating order:', error);
      res.status(400).json({ message: 'Error creating order' });
    }
  });

  // Contact messages route
  app.post("/api/contact", async (req, res) => {
    try {
      const validatedData = insertContactMessageSchema.parse(req.body);
      const message = await storage.createContactMessage(validatedData);
      res.json(message);
    } catch (error) {
      console.error('Error creating contact message:', error);
      res.status(400).json({ message: 'Error creating contact message' });
    }
  });

  // Stripe payment intent
  app.post("/api/payment/create-intent", async (req, res) => {
    try {
      if (!stripe) {
        return res.status(500).json({ error: 'Stripe not configured' });
      }

      const { amount, currency = 'cop' } = req.body;
      
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency,
        metadata: {
          integration_check: 'accept_a_payment',
        },
      });

      res.json({
        client_secret: paymentIntent.client_secret,
      });
    } catch (error) {
      console.error('Error creating payment intent:', error);
      res.status(500).json({ error: 'Error creating payment intent' });
    }
  });

  // Wompi payment (simplified)
  app.post("/api/payment/wompi/create-payment", async (req, res) => {
    try {
      const { amount, currency, customerEmail, orderReference } = req.body;
      
      // In a real implementation, you would integrate with Wompi API here
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

  // WhatsApp webhook (simplified)
  app.get("/webhook/whatsapp", (req, res) => {
    const verifyToken = process.env.META_WEBHOOK_VERIFY_TOKEN;
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    if (mode && token) {
      if (mode === "subscribe" && token === verifyToken) {
        console.log("✅ WhatsApp webhook verified");
        res.status(200).send(challenge);
      } else {
        res.sendStatus(403);
      }
    } else {
      res.sendStatus(400);
    }
  });

  app.post("/webhook/whatsapp", async (req, res) => {
    try {
      console.log('📱 WhatsApp message received:', JSON.stringify(req.body, null, 2));
      res.status(200).json({ message: 'Message received' });
    } catch (error) {
      console.error('WhatsApp webhook error:', error);
      res.status(500).json({ message: 'Error processing WhatsApp message' });
    }
  });

  console.log("🔗 API routes initialized");
}