import express, { type Request, type Response, type NextFunction } from "express";
import session from "express-session";
import path from "path";
import { registerRoutes } from "./routes";

const app = express();

/* -------------------------------------------
 * 1) Confiar en el proxy en producción (Railway)
 *    Necesario para que cookie.secure funcione bien
 * ------------------------------------------- */
if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

/* -------------------------------------------
 * 2) Healthcheck para Railway
 *    Debe responder 200 rápido
 * ------------------------------------------- */
app.get("/api/health", (_req: Request, res: Response) => {
  res.status(200).json({ ok: true, env: process.env.NODE_ENV || "development" });
});

/* -------------------------------------------
 * 3) Parsers
 * ------------------------------------------- */
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

/* -------------------------------------------
 * 4) Assets estáticos “crudos” (opcional)
 *    Para servir /assets/* si subes archivos sueltos
 * ------------------------------------------- */
app.use("/assets", express.static(path.join(process.cwd(), "assets")));

/* -------------------------------------------
 * 5) Sesiones
 * ------------------------------------------- */
app.use(
  session({
    secret: process.env.SESSION_SECRET || "sigerist-session-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production", // requiere HTTPS detrás del proxy
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24h
    },
  })
);

/* -------------------------------------------
 * 6) Logger de requests para /api/*
 * ------------------------------------------- */
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  const reqPath = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json.bind(res);
  // @ts-expect-error - sobrescribimos tipo para capturar body
  res.json = (bodyJson: any, ...args: any[]) => {
    capturedJsonResponse = bodyJson;
    return originalResJson(bodyJson, ...args);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (reqPath.startsWith("/api")) {
      let line = `${req.method} ${reqPath} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        try {
          line += ` :: ${JSON.stringify(capturedJsonResponse)}`;
        } catch {
          // ignore stringify errors
        }
      }
      if (line.length > 300) line = line.slice(0, 299) + "…";
      console.log(line);
    }
  });

  next();
});

/* -------------------------------------------
 * 7) Registro de rutas API
 *    (tu función debe montar /api/* en app)
 * ------------------------------------------- */
(async () => {
  const server = await registerRoutes(app);

  /* -------------------------------------------
   * 8) Static del frontend (build de Vite)
   *    Sirve dist/public y fallback al index.html
   * ------------------------------------------- */
  if (process.env.NODE_ENV === "production") {
    const publicDir = path.join(process.cwd(), "dist/public");
    app.use(express.static(publicDir));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(publicDir, "index.html"));
    });
  }

  /* -------------------------------------------
   * 9) Manejo de errores
   * ------------------------------------------- */
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    console.error(err);
    res.status(status).json({ message });
  });

  /* -------------------------------------------
   * 10) Arranque del servidor
   * ------------------------------------------- */
  const PORT = parseInt(process.env.PORT || "8080", 10);
  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
  });
})();
