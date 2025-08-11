// server/index.ts
import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import path from "path";
import { registerRoutes } from "./routes";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// --- Healthcheck MUY TEMPRANO (antes de nada) ---
app.get("/api/health", (_req: Request, res: Response) => {
  res.status(200).json({
    ok: true,
    status: "healthy",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Static assets (si usas /assets locales)
app.use("/assets", express.static(path.join(process.cwd(), "assets")));

// Session
app.use(
  session({
    secret: process.env.SESSION_SECRET || "sigerist-session-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

// Request logging para /api
app.use((req, res, next) => {
  const start = Date.now();
  const reqPath = req.path;
  let capturedJsonResponse: Record<string, any> | undefined;

  const originalResJson = res.json.bind(res);
  (res as any).json = (bodyJson: any, ...args: any[]) => {
    capturedJsonResponse = bodyJson;
    return originalResJson(bodyJson, ...args);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (reqPath.startsWith("/api")) {
      let logLine = `${req.method} ${reqPath} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      if (logLine.length > 200) logLine = logLine.slice(0, 199) + "…";
      console.log(logLine);
    }
  });

  next();
});

async function bootstrap() {
  try {
    console.log("🔧 NODE_ENV:", process.env.NODE_ENV);
    console.log("🔧 PORT (from env):", process.env.PORT);
    console.log("🔧 DATABASE_URL present:", Boolean(process.env.DATABASE_URL));

    // Registra tus rutas de API (puede abrir DB, etc.)
    const server = await registerRoutes(app);

    // Static frontend en producción
    if (process.env.NODE_ENV === "production") {
      const publicDir = path.join(process.cwd(), "dist/public");
      app.use(express.static(publicDir));
      // Soporte SPA
      app.get("*", (_req, res) => {
        res.sendFile(path.join(publicDir, "index.html"));
      });
    }

    // Error handler
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      console.error("❌ Unhandled error:", err);
      res.status(status).json({ message });
    });

    const PORT = parseInt(process.env.PORT || "8080", 10);
    server.listen(PORT, "0.0.0.0", () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`✅ Healthcheck ready at /api/health`);
    });
  } catch (err) {
    console.error("💥 Fatal error during bootstrap:", err);
    // OJO: aún así dejamos vivo el proceso para que /api/health siga respondiendo 200;
    // Si prefieres terminar el proceso para reintento, descomenta:
    // process.exit(1);
  }
}

bootstrap();
