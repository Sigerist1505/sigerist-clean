// server/index.ts
import express, { type Request, type Response, type NextFunction } from "express";
import session from "express-session";
import path from "path";
import { registerRoutes } from "./routes";

const app = express();
app.set("trust proxy", 1);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Healthcheck para Railway
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
    if (req.path.startsWith("/api"))
      console.log(`${req.method} ${req.path} -> ${res.statusCode} ${Date.now() - t0}ms`);
  });
  next();
});

(async () => {
  // Registra rutas y usa el server HTTP que retorna
  let server;
  try {
    server = await registerRoutes(app);
  } catch (e) {
    console.error("❌ Error en registerRoutes:", e);
    // Si fallara, crea igualmente un server para no tumbar el proceso
    const { createServer } = await import("http");
    server = createServer(app);
  }

  // 404 para endpoints /api no encontrados
  app.use("/api", (_req, res) => res.status(404).json({ message: "Not Found" }));

  // Servir el frontend compilado por Vite (dist/public)
  if (process.env.NODE_ENV === "production") {
    const publicDir = path.join(process.cwd(), "dist", "public");
    app.use(express.static(publicDir));
    // SPA fallback (no interceptar /api/*)
    app.get("*", (req, res, next) => {
      if (req.path.startsWith("/api/")) return next();
      res.sendFile(path.join(publicDir, "index.html"));
    });
  }

  // Manejador de errores (al final)
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err?.status || err?.statusCode || 500;
    console.error("API Error:", err);
    res.status(status).json({ message: err?.message || "Internal Server Error" });
  });

  // 👉 Usa el PORT que inyecta Railway (no lo definas en Railway)
  const PORT = Number(process.env.PORT) || 3000;
  server.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server listening on http://0.0.0.0:${PORT}`);
    console.log(`NODE_ENV=${process.env.NODE_ENV}`);
  });
})().catch((err) => {
  console.error("❌ Startup error:", err);
  process.exit(1);
});

export { app };
