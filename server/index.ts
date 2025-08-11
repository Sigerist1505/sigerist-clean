import express, { type Request, type Response, type NextFunction } from "express";
import session from "express-session";
import path from "path";

const app = express();

// ---------- Middleware básicos
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Assets estáticos opcionales (si usas /assets locales)
app.use("/assets", express.static(path.join(process.cwd(), "assets")));

// ---------- Healthcheck PRIMERO (no depende de DB ni rutas)
app.get("/api/health", (_req: Request, res: Response) => {
  res.status(200).json({
    ok: true,
    status: "healthy",
    env: process.env.NODE_ENV || "development",
    time: new Date().toISOString(),
  });
});

// ---------- Sesión
app.use(
  session({
    secret: process.env.SESSION_SECRET || "sigerist-session-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24h
    },
  })
);

// ---------- Logging de peticiones /api
app.use((req, res, next) => {
  const start = Date.now();
  const p = req.path;
  let captured: any;

  const orig = res.json.bind(res);
  (res as any).json = (body: any, ...args: any[]) => {
    captured = body;
    return orig(body, ...args);
  };

  res.on("finish", () => {
    if (p.startsWith("/api")) {
      const ms = Date.now() - start;
      let line = `${req.method} ${p} ${res.statusCode} in ${ms}ms`;
      if (captured) {
        const txt = JSON.stringify(captured);
        if (txt.length < 200) line += ` :: ${txt}`;
      }
      console.log(line);
    }
  });

  next();
});

// ---------- Errores (handler global)
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err?.status || err?.statusCode || 500;
  const message = err?.message || "Internal Server Error";
  console.error("Unhandled error:", err);
  res.status(status).json({ message });
});

// ---------- Servir frontend (SPA) en producción
if (process.env.NODE_ENV === "production") {
  const publicDir = path.join(process.cwd(), "dist/public");
  app.use(express.static(publicDir));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(publicDir, "index.html"));
  });
}

// ---------- Arrancar servidor primero (para que /api/health esté vivo)
const PORT = parseInt(process.env.PORT || "8080", 10);
const HOST = "0.0.0.0";

const server = app.listen(PORT, HOST, () => {
  console.log(`✅ Server listening on http://${HOST}:${PORT}`);
});

// ---------- Cargar rutas API sin bloquear el arranque
(async () => {
  try {
    const { registerRoutes } = await import("./routes");
    await registerRoutes(app);
    console.log("✅ API routes registered");
  } catch (err) {
    console.error("⚠️ Failed to register API routes:", err);
  }
})();

// ---------- Seguridad extra: logs de crashes
process.on("unhandledRejection", (reason) => {
  console.error("UNHANDLED REJECTION:", reason);
});
process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION:", err);
});
