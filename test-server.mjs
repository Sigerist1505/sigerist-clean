import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Parse JSON bodies
app.use(express.json());

// Serve static files from the client/public directory
app.use(express.static(path.join(__dirname, 'client/public')));

// Mock products data for testing
const mockProducts = [
  {
    id: 1,
    name: "Pañalera Multifuncional",
    description: "Pañalera multifuncional con bordado personalizado y múltiples compartimientos - ¡Nuestro producto estrella!",
    price: 445000.00,
    imageUrl: "/assets/Multifuncional 3 Bordada.jpg",
    blankImageUrl: "/assets/Multifuncional 3 sin Bordado.jpg",
    referenceImageUrl: "/assets/Multifuncional.jpg",
    category: "Pañaleras",
    animalType: "León",
    colors: ["Tierra", "Beige", "Azul"],
    inStock: true,
    variants: {
      bordado: true,
      bordadoImageUrl: "/assets/Multifuncional 3 Bordada.jpg",
      galleryImages: ["/assets/Multifuncional 3sinB.jpg"],
      bordadoGalleryImages: [
        "/assets/Multifuncional 3 Bordada.jpg",
        "/assets/Multifuncional 2 Bordada.jpg",
      ],
    },
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    name: "Organizador de Higiene",
    description: "Organizador de higiene transparente con bordado personalizado de flores - Perfecto para viajes",
    price: 145000.00,
    imageUrl: "/assets/Organizador Bordado.jpg",
    blankImageUrl: "/assets/Organizador_Sin bordar.jpg",
    referenceImageUrl: "/assets/Organizador.jpg",
    category: "Organizadores",
    animalType: "Flores",
    colors: ["Rosa", "Beige"],
    inStock: true,
    variants: {
      bordado: true,
      bordadoImageUrl: "/assets/Organizador Bordado.jpg",
      galleryImages: ["/assets/Organizador_Sin bordar.jpg"],
      bordadoGalleryImages: ["/assets/Organizador Bordado.jpg"],
    },
    createdAt: new Date().toISOString(),
  },
];

// API Routes
app.get("/api/products", (req, res) => {
  res.json(mockProducts);
});

app.get("/api/products/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const product = mockProducts.find(p => p.id === id);
  if (product) {
    res.json(product);
  } else {
    res.status(404).json({ message: "Product not found" });
  }
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Serve the built React app for all other routes
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/public/index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Test server running on http://localhost:${PORT}`);
  console.log("📋 Available products for testing embroidery toggle:");
  mockProducts.forEach(p => {
    console.log(`  - ${p.name} (ID: ${p.id}) - Has embroidery: ${p.variants.bordado}`);
  });
});