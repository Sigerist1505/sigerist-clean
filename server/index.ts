// server/index.ts
import express, { type Request, type Response, type NextFunction } from "express";
import session from "express-session";
import path from "path";
import { registerRoutes } from "./routes";

const app = express();
app.set("trust proxy", 1); // cookies secure detrás de proxy (Railway)

// Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Archivos estáticos crudos (fuera del build de Vite)
app.use("/assets", express.static(path.join(process.cwd(), "assets")));

// Sesión (usa SESSION_SECRET en Railway)
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

// Health SIEMPRE 200 (no dependas de DB aquí)
app.get("/api/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

// Ready opcional (si quieres testear DB, hazlo aquí sin romper health)
app.get("/api/ready", (_req, res) => {
  res.json({ ready: true });
});

// Logger simple para /api
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

(async () => {
  // Registra rutas; si devuelve un http.Server (p.ej. websockets), lo usamos para listen
  let serverLike: any = null;
  try {
    const maybeServer = await registerRoutes(app);
    if (maybeServer && typeof (maybeServer as any).listen === "function") {
      serverLike = maybeServer;
    }
  } catch (e) {
    console.error("❌ Error registrando rutas:", e);
    process.exit(1);
  }

  // 404 para /api después de registrar rutas
  app.use("/api", (_req, res) => res.status(404).json({ message: "Not Found" }));

  // Servir frontend de Vite en producción
  if (process.env.NODE_ENV === "production") {
    // Compilas a CJS y ejecutas dist/index.cjs → __dirname apunta a /app/dist
    const publicDir = path.join(__dirname, "public");
    app.use(express.static(publicDir, { index: "index.html", maxAge: "1h" }));

    // SPA fallback: todo lo que no sea /api/* devuelve index.html
    app.get("*", (req, res, next) => {
      if (req.path.startsWith("/api/")) return next();
      res.sendFile(path.join(publicDir, "index.html"));
    });
  }

  // Manejador de errores global
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err?.status || err?.statusCode || 500;
    const message = err?.message || "Internal Server Error";
    console.error("API Error:", err);
    res.status(status).json({ message });
  });

  // Arranque
  const PORT = Number(process.env.PORT) || 3000; // Railway inyecta PORT
  const HOST = "0.0.0.0";
  const listener = serverLike ?? app;

  listener.listen(PORT, HOST, () => {
    console.log(`🚀 Server listening on http://${HOST}:${PORT}`);
  });
})().catch((err) => {
  console.error("❌ Fatal startup error:", err);
  process.exit(1);
});

export { app };
