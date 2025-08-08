import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { setupRoutes } from "./routes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function initializeDatabase() {
  // Initialize database if in production
  if (process.env.NODE_ENV === 'production') {
    try {
      console.log('🚀 Initializing database...');
      const neonModule = await import('@neondatabase/serverless');
      const sqlClient = neonModule.neon(process.env.DATABASE_URL || '');
      
      // Test connection
      await sqlClient`SELECT 1`;
      console.log('✅ Database connection successful');
    } catch (error) {
      console.log('⚠️ Database initialization skipped:', (error as Error).message);
    }
  }
}

async function startServer() {
  // Initialize database first
  await initializeDatabase();
  
  const app = express();

  // Basic middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // CORS for Railway
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
    } else {
      next();
    }
  });

  // Health check for Railway
  app.get('/api/health', (req, res) => {
    res.status(200).json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    });
  });

  // Setup API routes
  setupRoutes(app);

  // Serve static assets
  app.use('/assets', express.static(path.join(process.cwd(), 'assets')));

  // Serve built frontend in production
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(process.cwd(), 'dist/public')));
    
    app.get('*', (req, res) => {
      if (!req.path.startsWith('/api')) {
        res.sendFile(path.join(process.cwd(), 'dist/public', 'index.html'));
      }
    });
  }

  const PORT = parseInt(process.env.PORT || '8080', 10);
  
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

startServer().catch(console.error);