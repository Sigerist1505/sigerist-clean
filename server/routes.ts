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
      // Preprocess the price to ensure it's a number
      const processedBody = {
        ...req.body,
        price: convertToNumber(req.body.price)
      };
      
      function convertToNumber(value: any): number {
        if (typeof value === 'number') return value;
        if (typeof value === 'string') return Number(value);
        if (typeof value === 'object' && value !== null) {
          // Handle decimal objects that might have toString, valueOf, or direct numeric properties
          if (typeof value.valueOf === 'function') return Number(value.valueOf());
          if (typeof value.toString === 'function') return Number(value.toString());
          if (typeof value.value === 'number') return value.value;
        }
        return Number(value);
      }
      const validated = insertCartItemSchema.parse(processedBody);
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

  // Session-based cart routes
  app.get("/api/cart/:sessionId", async (req, res) => {
    try {
      const sessionId = req.params.sessionId;
      const items = await storage.getCartItemsBySession(sessionId);
      res.json(items);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      console.error("Error fetching cart items by session:", error);
      res.status(500).json({ message: "Error fetching cart items", error: errorMessage });
    }
  });

  app.delete("/api/cart/session/:sessionId", async (req, res) => {
    try {
      const sessionId = req.params.sessionId;
      await storage.clearCartBySession(sessionId);
      res.json({ message: "Cart cleared" });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      console.error("Error clearing cart by session:", error);
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

  // 🟣 Wompi API endpoints
  
  // Configuration status endpoint (for debugging)
  app.get("/api/wompi/config", (req, res) => {
    const configStatus = WompiService.getConfigurationStatus();
    res.json({
      status: configStatus.isFullyConfigured ? "ready" : "incomplete",
      ...configStatus
    });
  });

  // Widget configuration endpoint
  app.post("/api/wompi/widget-config", async (req, res) => {
    try {
      // Check Wompi configuration status first
      const configStatus = WompiService.getConfigurationStatus();
      
      if (!configStatus.isFullyConfigured) {
        console.error("Wompi configuration incomplete:", configStatus);
        
        let errorMessage = "El servicio de pagos no está configurado correctamente. Por favor contacta al soporte técnico.";
        
        if (configStatus.needsConfiguration) {
          errorMessage = "El servicio de pagos necesita configuración. Por favor actualiza las claves de Wompi en el archivo .env";
        }
        
        return res.status(503).json({ 
          success: false,
          error: errorMessage,
          message: "Error de configuración",
          details: process.env.NODE_ENV === "development" ? configStatus : undefined,
          help: process.env.NODE_ENV === "development" ? "Ver WOMPI_SETUP.md para instrucciones detalladas" : undefined
        });
      }

      const { 
        amount_in_cents, 
        currency = "COP", 
        reference, 
        customer_data,
        shipping_address,
        redirect_url,
        expiration_time,
        tax_in_cents
      } = req.body;

      if (!amount_in_cents || !reference) {
        return res.status(400).json({
          success: false,
          error: "amount_in_cents and reference are required"
        });
      }

      const widgetConfig = WompiService.getWidgetConfig(
        amount_in_cents,
        currency,
        reference,
        customer_data,
        shipping_address,
        {
          redirect_url,
          expiration_time,
          tax_in_cents
        }
      );

      res.json({
        success: true,
        data: widgetConfig
      });

    } catch (error: any) {
      console.error("Error generating widget config:", error);
      
      // Return user-friendly error message
      let statusCode = 500;
      let userMessage = error.message || "Internal server error";
      
      if (error.message?.includes("Wompi configuration incomplete") || 
          error.message?.includes("configuración de Wompi no está completa")) {
        statusCode = 503;
        userMessage = "El servicio de pagos no está disponible temporalmente. Por favor intenta más tarde o contacta al soporte.";
      }
      
      res.status(statusCode).json({
        success: false,
        error: userMessage
      });
    }
  });
  
  // Create card token endpoint
  app.post("/api/wompi/create-token", async (req, res) => {
    try {
      // Check Wompi configuration status
      const configStatus = WompiService.getConfigurationStatus();
      
      if (!configStatus.isFullyConfigured) {
        console.error("Wompi configuration incomplete:", configStatus);
        
        let errorMessage = "El servicio de pagos no está configurado correctamente. Por favor contacta al soporte técnico.";
        
        if (configStatus.needsConfiguration) {
          errorMessage = "El servicio de pagos necesita configuración. Por favor actualiza las claves de Wompi en el archivo .env";
        }
        
        return res.status(503).json({ 
          message: "Error de configuración", 
          error: errorMessage,
          details: process.env.NODE_ENV === "development" ? configStatus : undefined,
          help: process.env.NODE_ENV === "development" ? "Ver WOMPI_SETUP.md para instrucciones detalladas" : undefined
        });
      }

      const { cardNumber, expMonth, expYear, cvv, cardHolderName } = req.body;
      
      // Validate required fields
      if (!cardNumber || !expMonth || !expYear || !cvv || !cardHolderName) {
        return res.status(400).json({ 
          message: "Missing required fields", 
          required: ["cardNumber", "expMonth", "expYear", "cvv", "cardHolderName"] 
        });
      }

      const cardData = {
        number: cardNumber,
        exp_month: expMonth,
        exp_year: expYear,
        cvc: cvv,
        card_holder: cardHolderName
      };

      const tokenData = await WompiService.createToken(cardData);
      res.json(tokenData);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      console.error("Error creating Wompi token:", error);
      
      // Return user-friendly error message
      let statusCode = 500;
      let userMessage = errorMessage;
      
      if (errorMessage.includes("configuración de Wompi no está completa") || 
          errorMessage.includes("configuración de pagos no está completa")) {
        statusCode = 503;
        userMessage = "El servicio de pagos no está disponible temporalmente. Por favor intenta más tarde o contacta al soporte.";
      }
      
      res.status(statusCode).json({ message: "Error creating token", error: userMessage });
    }
  });

  // Create transaction endpoint
  app.post("/api/wompi/create-transaction", async (req, res) => {
    try {
      const { 
        amount_in_cents, 
        currency, 
        customer_email, 
        payment_method, 
        reference, 
        customer_data 
      } = req.body;

      // Validate required fields
      if (!amount_in_cents || !currency || !customer_email || !payment_method || !reference) {
        return res.status(400).json({ 
          message: "Missing required fields", 
          required: ["amount_in_cents", "currency", "customer_email", "payment_method", "reference"] 
        });
      }

      // Get acceptance tokens
      const acceptanceTokens = await WompiService.getAcceptanceTokens();

      const transactionData = {
        amount_in_cents,
        currency,
        customer_email,
        reference,
        acceptance_token: acceptanceTokens.acceptance_token,
        accept_personal_auth: acceptanceTokens.accept_personal_auth,
        payment_method,
        customer_data: customer_data || {}
      };

      const transactionResult = await WompiService.createTransaction(transactionData);
      res.json({ success: true, data: transactionResult.data });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      console.error("Error creating Wompi transaction:", error);
      res.status(500).json({ message: "Error creating transaction", error: errorMessage });
    }
  });

  // Legacy endpoint (keeping for backwards compatibility)
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