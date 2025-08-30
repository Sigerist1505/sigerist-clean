import type { Express, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { mockStorage } from "./mock-storage";
import { WompiService } from "./wompi-service";
import { emailService } from "./email-service";
import { z } from "zod";
import {
  insertCartItemSchema,
  insertOrderSchema,
  insertContactMessageSchema,
  insertRegisteredUserSchema,
} from "@shared/schema";
import "./types"; // Import session types

// Use mock storage if database is not available (for testing)
const activeStorage = process.env.USE_MOCK_STORAGE === 'true' ? mockStorage : storage;

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
      
      // Send purchase confirmation email
      try {
        const items = JSON.parse(validated.items);
        const firstName = validated.customerName.split(' ')[0] || validated.customerName;
        const emailSent = await emailService.sendPurchaseConfirmation(
          validated.customerEmail, 
          firstName, 
          order, 
          items
        );
        
        if (!emailSent) {
          console.warn(`Failed to send purchase confirmation email to ${validated.customerEmail}`);
        }
      } catch (emailError) {
        console.error("Error sending purchase confirmation email:", emailError);
        // Don't fail the order if email fails
      }
      
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

  // User Registration
  app.post("/api/register", async (req, res) => {
    try {
      // Validate request data
      const validated = insertRegisteredUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await activeStorage.getRegisteredUserByEmail(validated.email);
      if (existingUser) {
        return res.status(400).json({ 
          message: "El correo electrónico ya está registrado" 
        });
      }

      // Create the user
      const newUser = await activeStorage.createRegisteredUser({
        email: validated.email,
        passwordHash: validated.passwordHash, // Will be hashed in storage
        name: validated.name,
        phone: validated.phone,
        shippingAddress: validated.shippingAddress,
      });

      // Send welcome email
      const firstName = newUser.name.split(' ')[0] || '';
      const emailSent = await emailService.sendRegistrationConfirmation(newUser.email, firstName);
      
      if (!emailSent) {
        console.warn(`Failed to send welcome email to ${newUser.email}`);
        // Don't fail the registration if email fails
      }

      // Return user data (excluding password hash)
      const userResponse = {
        id: newUser.id,
        firstName: newUser.name.split(' ')[0] || '',
        lastName: newUser.name.split(' ').slice(1).join(' ') || '',
        email: newUser.email,
      };

      // Store user data in session after successful registration
      req.session.user = userResponse;

      res.json({ 
        user: userResponse,
        message: "Usuario registrado exitosamente. ¡Revisa tu email para la confirmación!" 
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Datos inválidos", 
          errors: error.errors 
        });
      }
      const errorMessage = error instanceof Error ? error.message : "Error desconocido";
      console.error("Error en registro:", error);
      res.status(500).json({ 
        message: "Error en el registro", 
        error: errorMessage 
      });
    }
  });

  // User Login
  app.post("/api/login", async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ 
          message: "Email y contraseña son requeridos" 
        });
      }

      // Authenticate user
      const user = await activeStorage.authenticateUser(email, password);
      if (!user) {
        return res.status(401).json({ 
          message: "Credenciales incorrectas" 
        });
      }

      // Store user data in session
      const userResponse = {
        id: user.id,
        firstName: user.name.split(' ')[0] || '',
        lastName: user.name.split(' ').slice(1).join(' ') || '',
        email: user.email,
      };

      req.session.user = userResponse;

      // Ensure session is saved before responding
      req.session.save((err) => {
        if (err) {
          console.error("Error saving session:", err);
          return res.status(500).json({ 
            message: "Error al guardar la sesión" 
          });
        }
        res.json(userResponse);
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error desconocido";
      console.error("Error en login:", error);
      res.status(500).json({ 
        message: "Error al iniciar sesión", 
        error: errorMessage 
      });
    }
  });

  // User Logout
  app.post("/api/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error("Error destroying session:", err);
        return res.status(500).json({ 
          message: "Error al cerrar sesión" 
        });
      }
      
      res.clearCookie('connect.sid'); // Clear the session cookie
      res.json({ 
        message: "Sesión cerrada exitosamente" 
      });
    });
  });

  // Forgot Password - Request Reset Code
  app.post("/api/forgot-password", async (req, res) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ 
          message: "El email es requerido" 
        });
      }

      // Check if user exists
      const user = await activeStorage.getRegisteredUserByEmail(email);
      if (!user) {
        // Don't reveal if email exists or not for security
        return res.json({ 
          message: "Si el email existe, recibirás un código de recuperación en unos minutos." 
        });
      }

      // Generate 6-digit reset code
      const resetCode = Math.floor(100000 + Math.random() * 900000).toString();

      // Save reset code to database
      const codeCreated = await activeStorage.createPasswordResetCode(email, resetCode);
      if (!codeCreated) {
        return res.status(500).json({ 
          message: "Error al generar el código de recuperación" 
        });
      }

      // Send email with reset code
      const firstName = user.name.split(' ')[0] || '';
      const emailSent = await emailService.sendPasswordResetCode(email, firstName, resetCode);
      
      if (!emailSent) {
        console.warn(`Failed to send password reset email to ${email}`);
        // Don't fail the request if email fails - the code was still created
      }

      res.json({ 
        message: "Si el email existe, recibirás un código de recuperación en unos minutos." 
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error desconocido";
      console.error("Error en forgot password:", error);
      res.status(500).json({ 
        message: "Error al procesar la solicitud", 
        error: errorMessage 
      });
    }
  });

  // Reset Password with Code
  app.post("/api/reset-password", async (req, res) => {
    try {
      const { email, code, newPassword } = req.body;

      if (!email || !code || !newPassword) {
        return res.status(400).json({ 
          message: "Email, código y nueva contraseña son requeridos" 
        });
      }

      // Validate password strength
      if (newPassword.length < 8) {
        return res.status(400).json({ 
          message: "La contraseña debe tener al menos 8 caracteres" 
        });
      }

      // Validate reset code
      const isValidCode = await activeStorage.validatePasswordResetCode(email, code);
      if (!isValidCode) {
        return res.status(400).json({ 
          message: "Código inválido o expirado" 
        });
      }

      // Update password
      const passwordUpdated = await activeStorage.updateUserPassword(email, newPassword);
      if (!passwordUpdated) {
        return res.status(500).json({ 
          message: "Error al actualizar la contraseña" 
        });
      }

      res.json({ 
        message: "Contraseña actualizada exitosamente" 
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error desconocido";
      console.error("Error en reset password:", error);
      res.status(500).json({ 
        message: "Error al restablecer la contraseña", 
        error: errorMessage 
      });
    }
  });

  // Verify Reset Code (optional endpoint for frontend validation)
  app.post("/api/verify-reset-code", async (req, res) => {
    try {
      const { email, code } = req.body;

      if (!email || !code) {
        return res.status(400).json({ 
          message: "Email y código son requeridos" 
        });
      }

      const isValidCode = await activeStorage.validatePasswordResetCode(email, code);
      
      res.json({ 
        valid: isValidCode,
        message: isValidCode ? "Código válido" : "Código inválido o expirado"
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error desconocido";
      console.error("Error en verify reset code:", error);
      res.status(500).json({ 
        message: "Error al verificar el código", 
        error: errorMessage 
      });
    }
  });

  // Auth check - return actual session data
  app.get("/api/auth/check", (req, res) => {
    if (req.session.user) {
      res.json({ 
        isAuthenticated: true, 
        user: req.session.user 
      });
    } else {
      res.json({ 
        isAuthenticated: false, 
        user: null 
      });
    }
  });

  // Email testing and diagnostic endpoints
  app.get("/api/email/status", (req, res) => {
    const emailConfig = {
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      user: process.env.EMAIL_USER,
      from: process.env.EMAIL_FROM,
      hasPassword: !!process.env.EMAIL_PASSWORD,
      secure: process.env.EMAIL_SECURE
    };

    const requiredVars = ['EMAIL_HOST', 'EMAIL_PORT', 'EMAIL_USER', 'EMAIL_PASSWORD'];
    const missingVars = requiredVars.filter(varName => !process.env[varName]);
    
    res.json({
      configured: missingVars.length === 0,
      missingVariables: missingVars,
      config: emailConfig,
      message: missingVars.length === 0 
        ? "Email service is configured" 
        : `Missing required variables: ${missingVars.join(', ')}`
    });
  });

  app.post("/api/test-email", async (req, res) => {
    try {
      const { to } = req.body;
      
      if (!to) {
        return res.status(400).json({ 
          success: false, 
          message: "Email address is required in 'to' field" 
        });
      }

      // Test email connection first
      const connectionTest = await emailService.testConnection();
      if (!connectionTest) {
        return res.status(503).json({
          success: false,
          message: "Email service is not properly configured",
          details: "Check EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASSWORD environment variables"
        });
      }

      // Send test email
      const testEmailSent = await emailService.sendEmail({
        to,
        subject: "🧪 Test Email - SigeristLuxuryBags",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; background: #000; color: #ebc005; padding: 20px; margin-bottom: 20px;">
              <h1>SigeristLuxuryBags</h1>
              <p>Test Email Successful ✅</p>
            </div>
            <div style="background: #f9f9f9; padding: 20px; border-radius: 5px;">
              <h2>Email Configuration Test</h2>
              <p>If you're receiving this email, your email configuration is working correctly!</p>
              <p><strong>Sent at:</strong> ${new Date().toLocaleString('es-CO')}</p>
              <p><strong>Test ID:</strong> ${Date.now()}</p>
            </div>
            <div style="text-align: center; padding: 20px; color: #666; font-size: 12px;">
              <p>© 2024 SigeristLuxuryBags - Medellín, Colombia</p>
            </div>
          </div>
        `
      });

      if (testEmailSent) {
        res.json({
          success: true,
          message: `Test email sent successfully to ${to}`,
          timestamp: new Date().toISOString()
        });
      } else {
        res.status(500).json({
          success: false,
          message: "Failed to send test email",
          details: "Check server logs for detailed error information"
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      console.error("Error in test email endpoint:", error);
      res.status(500).json({
        success: false,
        message: "Error sending test email",
        error: errorMessage
      });
    }
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