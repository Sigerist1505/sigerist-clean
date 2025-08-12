// server/index.ts
import express, { type Request, type Response, type NextFunction } from "express";
import session from "express-session";
import path from "path";
import { fileURLToPath } from "url";
import { registerRoutes } from "./routes";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.set("trust proxy", 1);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// 🔴 NO montes /assets aquí: tus imágenes viven en dist/public/assets

// Healthcheck SIEMPRE 200 (Railway apunta aquí)
app.get("/api/health", (_req, res) => res.status(200).json({ ok: true }));

// (opcional) Readiness
app.get("/api/ready", (_req, res) => res.json({ ready: true }));

// Sesiones
app.use(
  session({
    secret: process.env.SESSION_SECRET || "sigerist-session-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

// Log simple
app.use((req, res, next) => {
  const t0 = Date.now();
  res.on("finish", () => {
    if (req.path.startsWith("/api")) {
      console.log(`${req.method} ${req.path} -> ${res.statusCode} ${Date.now() - t0}ms`);
    }
  });
  next();
});

(async () => {
  // Registra tus rutas de API, pero si fallan no tumbes el server
  try {
    await registerRoutes(app);
  } catch (e) {
    console.error("❌ Error en registerRoutes:", e);
  }

  // 404 para /api cuando no matchee nada
  app.use("/api", (_req, res) => res.status(404).json({ message: "Not Found" }));

  // Sirve el frontend compilado por Vite
  if (process.env.NODE_ENV === "production") {
    // Nota: __dirname apunta a dist/ → public está en dist/public
    const publicDir = path.join(__dirname, "public");
    app.use(express.static(publicDir));

    // SPA fallback (no interceptar /api)
    app.get("*", (req, res, next) => {
      if (req.path.startsWith("/api/")) return next();
      res.sendFile(path.join(publicDir, "index.html"));
    });
  }

  // Manejador de errores
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err?.status || err?.statusCode || 500;
    console.error("API Error:", err);
    res.status(status).json({ message: err?.message || "Internal Server Error" });
  });

  // 👉 Escucha en el puerto que Railway inyecta
  const PORT = Number(process.env.PORT) || 3000;
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server listening on http://0.0.0.0:${PORT}`);
    console.log(`NODE_ENV=${process.env.NODE_ENV}`);
  });
})().catch((err) => {
  console.error("❌ Startup error:", err);
  process.exit(1);
});

export { app };
