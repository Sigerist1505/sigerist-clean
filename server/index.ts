// server/index.ts
import express, { type Request, type Response, type NextFunction } from "express";
import session from "express-session";
import path from "path";
import { registerRoutes } from "./routes";

const app = express();

// 1) Proxy en prod (cookies secure detrás de Railway)
if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

// 2) Healthcheck: debe responder rápido y siempre
app.get("/api/health", (_req: Request, res: Response) => {
  res.status(200).json({
    ok: true,
    env: process.env.NODE_ENV || "development",
    time: new Date().toISOString(),
  });
});

// 3) Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// 4) Assets “crudos” opcionales (si los usas)
app.use("/assets", express.static(path.join(process.cwd(), "assets")));

// 5) Sesiones
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

// 6) Logger simple
app.use((req, res, next) => {
  const start = Date.now();
  let body: any;
  const orig = res.json.bind(res);
  // @ts-expect-error: intercept
  res.json = (b: any, ...args: any[]) => {
    body = b;
    return orig(b, ...args);
  };
  res.on("finish", () => {
    if (req.path.startsWith("/api")) {
      const ms = Date.now() - start;
      let line = `${req.method} ${req.path} ${res.statusCode} in ${ms}ms`;
      if (body) {
        try {
          const txt = JSON.stringify(body);
          line += ` :: ${txt.length > 300 ? txt.slice(0, 299) + "…" : txt}`;
        } catch {}
      }
      console.log(line);
    }
  });
  next();
});

// 7) Arranque principal
async function main() {
  // Monta rutas de API, pero NO tumbes el server si falla
  try {
    await registerRoutes(app);
    console.log("✅ API routes registered");
  } catch (e) {
    console.error("⚠️ registerRoutes failed:", e);
  }

  // Static del frontend + fallback SPA
  if (process.env.NODE_ENV === "production") {
    const publicDir = path.join(process.cwd(), "dist/public");
    app.use(express.static(publicDir));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(publicDir, "index.html"));
    });
  }

  // Errores
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error("Unhandled route error:", err);
    res.status(err.status || err.statusCode || 500).json({
      message: err.message || "Internal Server Error",
    });
  });

  const PORT = parseInt(process.env.PORT || "8080", 10);
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`🌱 NODE_ENV: ${process.env.NODE_ENV || "development"}`);
    console.log(`🩺 Healthcheck ready at /api/health`);
  });
}

// 8) Handlers globales para ver cualquier crash en logs
process.on("unhandledRejection", (reason) => {
  console.error("UNHANDLED_REJECTION:", reason);
});
process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT_EXCEPTION:", err);
});

main().catch((e) => {
  console.error("Fatal startup error:", e);
  // NO hagas process.exit(1); mantén vivo el proceso para que el healthcheck responda
});
