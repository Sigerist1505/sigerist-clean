import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import path from "path";
import { registerRoutes } from "./routes";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Servir assets estáticos crudos (imágenes, etc.)
app.use("/assets", express.static(path.join(process.cwd(), "assets")));

// Session (asegúrate de tener SESSION_SECRET en Railway)
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

// Middleware de logging seguro (sin el error TS2556)
app.use((req, res, next) => {
  const start = Date.now();
  const reqPath = req.path; // evita conflicto con import de 'path'
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  // conserva 'this' y la firma de res.json
  const originalJson = res.json.bind(res) as typeof res.json;

  // reasignación sin rest args (previene TS2556)
  res.json = ((body: any) => {
    capturedJsonResponse = body;
    return originalJson(body);
  }) as typeof res.json;

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (reqPath.startsWith("/api")) {
      let logLine = `${req.method} ${reqPath} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        try {
          logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
        } catch {
          // por si body no es serializable
        }
      }
      if (logLine.length > 80) logLine = logLine.slice(0, 79) + "…";
      console.log(logLine);
    }
  });

  next();
});

// Ruta de healthcheck explícita (Railway apunta a /api/health)
app.get("/api/health", (_req, res) => {
  res.status(200).json({ ok: true });
});

(async () => {
  // Registra todas las rutas de tu API (productos, carrito, etc.)
  const server = await registerRoutes(app);

  // Manejo de errores centralizado
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    console.error(err);
  });

  // Producción: servir el frontend compilado por Vite
  if (process.env.NODE_ENV === "production") {
    const publicDir = path.join(process.cwd(), "dist/public");
    app.use(express.static(publicDir));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(publicDir, "index.html"));
    });
  }

  // Respeta PORT de Railway (ella lo inyecta). Por defecto 8080.
  const PORT = Number(process.env.PORT || 8080);
  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
})();
