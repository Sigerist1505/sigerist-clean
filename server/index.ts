// server/index.ts
import express, { type Request, type Response, type NextFunction } from "express";
import session from "express-session";
import path from "path";
import { registerRoutes } from "./routes";

const app = express();

// Confía en el proxy de Railway para manejar secure cookies correctamente
app.set("trust proxy", 1);

// Parsers para JSON y form data
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Servir assets estáticos crudos (imágenes originales en /attached_assets/)
app.use("/attached_assets", express.static(path.join(process.cwd(), "client", "public", "assets")));

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

// Logger sencillo y eficiente (solo para rutas API, sin monkey-patching para evitar errores TS)
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    if (req.path.startsWith("/api")) {
      const duration = Date.now() - start;
      console.log(`${req.method} ${req.path} -> ${res.statusCode} ${duration}ms`);
    }
  });
  next();
});

// Ruta de healthcheck obligatoria para Railway (siempre responde 200, sin depender de DB para un despliegue impecable)
app.get("/api/health", (_req, res) => {
  res.status(200).json({ ok: true, status: "Luxury service ready" });
});

// Bootstrap asíncrono para registrar rutas y manejar errores con elegancia
(async () => {
  // Registra todas las rutas de tu API (productos de lujo, carrito personalizado, etc.)
  await registerRoutes(app);

  // Manejo de errores centralizado (después de rutas, para capturar todo con estilo)
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err?.status || err?.statusCode || 500;
    console.error("Error en el servidor de Sigerist:", err);
    res.status(status).json({ message: err?.message || "Error interno - Nuestro equipo de lujo lo resolverá pronto" });
  });

  // En producción: sirve el frontend compilado por Vite desde dist/public (para una experiencia web premium)
  if (process.env.NODE_ENV === "production") {
    const publicDir = path.join(process.cwd(), "dist", "public");
    app.use(express.static(publicDir));
    // SPA fallback: rutas no-API devuelven index.html para navegación fluida
    app.get("*", (req, res, next) => {
      if (req.path.startsWith("/api/")) return next(); // Evita interferir con APIs
      res.sendFile(path.join(publicDir, "index.html"));
    });
  }

  // Usa el PORT dinámico inyectado por Railway (no lo fijes en variables) y bind a 0.0.0.0 para accesibilidad total
  // En desarrollo, usar puerto 5000 para que coincida con proxy de Vite
  const PORT = Number(process.env.PORT) || (process.env.NODE_ENV === "production" ? 3000 : 5000);
  const HOST = "0.0.0.0";

  app.listen(PORT, HOST, () => {
    console.log(`🚀 Servidor de Sigerist Luxury Bags corriendo en http://${HOST}:${PORT} - Listo para ventas exclusivas`);
  });
})().catch((err) => {
  console.error("❌ Error fatal al iniciar el servidor de bolsos personalizados:", err);
  process.exit(1);
});
export { app };