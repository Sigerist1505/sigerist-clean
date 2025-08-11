// server/index.ts
import express, { type Request, type Response, type NextFunction } from "express";
import session from "express-session";
import path from "path";
import { registerRoutes } from "./routes";

const app = express();

// 1) Proxy en prod (cookies secure detrás del proxy de Railway)
if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

// 2) Healthcheck (debe responder 200 rápido)
app.get("/api/health", (_req: Request, res: Response) => {
  res.status(200).json({ ok: true, env: process.env.NODE_ENV || "development" });
});

// 3) Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// 4) Assets “crudos” opcionales
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

// 6) Logger simple para /api/*
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  let captured: any;
  const orig = res.json.bind(res);
  // @ts-expect-error: capturamos cuerpo
  res.json = (body: any, ...args: any[]) => {
    captured = body;
    return orig(body, ...args);
  };
  res.on("finish", () => {
    if (req.path.startsWith("/api")) {
      const ms = Date.now() - start;
      let line = `${req.method} ${req.path} ${res.statusCode} in ${ms}ms`;
      if (captured) {
        try {
          const txt = JSON.stringify(captured);
          line += ` :: ${txt.length > 300 ? txt.slice(0, 299) + "…" : txt}`;
        } catch {}
      }
      console.log(line);
    }
  });
  next();
});

async function main() {
  // 7) Monta rutas de API
  await registerRoutes(app);

  // 8) Static del frontend y fallback SPA
  if (process.env.NODE_ENV === "production") {
    const publicDir = path.join(process.cwd(), "dist/public");
    app.use(express.static(publicDir));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(publicDir, "index.html"));
    });
  }

  // 9) Errores
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error(err);
    res.status(err.status || err.statusCode || 500).json({
      message: err.message || "Internal Server Error",
    });
  });

  // 10) Escuchar
  const PORT = parseInt(process.env.PORT || "8080", 10);
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`🌱 NODE_ENV: ${process.env.NODE_ENV || "development"}`);
    console.log(`🩺 Healthcheck ready at /api/health`);
  });
}

main().catch((e) => {
  console.error("Fatal server error:", e);
  process.exit(1);
});
