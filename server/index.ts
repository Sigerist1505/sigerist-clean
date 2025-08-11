// server/index.ts
import express, { type Request, type Response, type NextFunction } from "express";
import session from "express-session";
import path from "path";
import { registerRoutes } from "./routes";

const app = express();

// Necesario para cookies "secure" detrás de proxy (Railway)
app.set("trust proxy", 1);

// Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Servir assets estáticos crudos (imágenes, etc.)
app.use("/assets", express.static(path.join(process.cwd(), "assets")));

// Session (requiere SESSION_SECRET en Railway)
app.use(
  session({
    secret: process.env.SESSION_SECRET || "sigerist-session-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000, // 24h
    },
  })
);

// Logger sencillo (sin tocar res.json)
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    if (req.path.startsWith("/api")) {
      const ms = Date.now() - start;
      console.log(`${req.method} ${req.path} -> ${res.statusCode} ${ms}ms`);
    }
  });
  next();
});

// Ruta de healthcheck (Railway apunta a /api/health)
app.get("/api/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

// Bootstrap
(async () => {
  // Registra todas las rutas de tu API (productos, carrito, etc.)
  // Asumimos que registerRoutes NO necesita devolver un server.
  await registerRoutes(app);

  // Manejo de errores centralizado (después de registrar rutas)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err?.status || err?.statusCode || 500;
    const message = err?.message || "Internal Server Error";
    console.error("API Error:", err);
    res.status(status).json({ message });
  });

  // Producción: servir el frontend compilado por Vite
  if (process.env.NODE_ENV === "production") {
    const publicDir = path.join(process.cwd(), "dist/public");
    app.use(express.static(publicDir, { index: "index.html", maxAge: "1h" }));

    // SPA fallback: cualquier ruta no-API devuelve index.html
    app.get("*", (req, res, next) => {
      if (req.path.startsWith("/api/")) return next();
      res.sendFile(path.join(publicDir, "index.html"));
    });
  }

  // Respeta PORT de Railway (ella lo inyecta). Fallback local 3000.
  const PORT = Number(process.env.PORT) || 3000;
  const HOST = "0.0.0.0";

  app.listen(PORT, HOST, () => {
    console.log(`🚀 Server running on http://${HOST}:${PORT}`);
  });
})().catch((err) => {
  console.error("❌ Fatal startup error:", err);
  process.exit(1);
});
