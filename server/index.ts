// server/index.ts
import express, { type Request, type Response, type NextFunction } from "express";
import session from "express-session";
import path from "path";

const app = express();
app.set("trust proxy", 1); // importante detrás de proxy (Railway)
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// 1) Healthcheck ultra-temprano
app.get("/api/health", (_req: Request, res: Response) => {
  res.status(200).json({
    ok: true,
    status: "healthy",
    uptime: process.uptime(),
    ts: new Date().toISOString(),
  });
});

// 2) Static assets opcionales
app.use("/assets", express.static(path.join(process.cwd(), "assets")));

// 3) Session (después del health)
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

// 4) Logging ligero para /api
app.use((req, res, next) => {
  const t0 = Date.now();
  const p = req.path;
  let bodyJson: any;

  const orig = res.json.bind(res);
  (res as any).json = (b: any, ...args: any[]) => {
    bodyJson = b;
    return orig(b, ...args);
  };

  res.on("finish", () => {
    if (p.startsWith("/api")) {
      const ms = Date.now() - t0;
      let line = `${req.method} ${p} ${res.statusCode} in ${ms}ms`;
      if (bodyJson) line += ` :: ${JSON.stringify(bodyJson)}`;
      if (line.length > 200) line = line.slice(0, 199) + "…";
      console.log(line);
    }
  });

  next();
});

// 5) Bootstrap robusto
async function bootstrap() {
  // Arranca el listener YA, así /api/health responde aunque falle lo demás
  const PORT = parseInt(process.env.PORT || "8080", 10);
  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`✅ Server listening on ${PORT}`);
    console.log(`✅ Healthcheck ready at /api/health`);
    console.log("🔧 NODE_ENV:", process.env.NODE_ENV);
    console.log("🔧 DATABASE_URL present:", Boolean(process.env.DATABASE_URL));
  });

  // 5.1) Carga dinámica de rutas (evita fallos de import en frío)
  try {
    const { registerRoutes } = await import("./routes");
    await registerRoutes(app);
    console.log("✅ API routes registered");
  } catch (err) {
    console.error("⚠️ Error registering routes, API endpoints may be unavailable:", err);
    // No cerramos el proceso: el healthcheck seguirá vivo
  }

  // 6) Servir el frontend (SPA) en prod
  if (process.env.NODE_ENV === "production") {
    const publicDir = path.join(process.cwd(), "dist/public");
    app.use(express.static(publicDir));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(publicDir, "index.html"));
    });
  }

  // 7) Error handler final
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    console.error("❌ Unhandled error:", err);
    res.status(status).json({ message });
  });

  // 8) Manejadores globales para que el proceso no muera
  process.on("unhandledRejection", (reason) => {
    console.error("⚠️ UnhandledRejection:", reason);
  });
  process.on("uncaughtException", (err) => {
    console.error("⚠️ UncaughtException:", err);
  });

  return server;
}

bootstrap().catch((e) => {
  console.error("💥 Fatal bootstrap error:", e);
  // NO salgas del proceso; dejamos /api/health funcionando
});
