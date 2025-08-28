// Mock API for testing UI without backend
export const mockProducts = [
  {
    id: 1,
    name: "Bolso Mariposa Bordado",
    description: "Elegante bolso con diseño de mariposa y bordado personalizado. Perfecto para el día a día con un toque de distinción.",
    price: 285000,
    category: "Bolsos",
    imageUrl: "/assets/Bolsito Mariposa.jpg",
    inStock: true,
    variants: {
      bordado: true,
      bordadoImageUrl: "/assets/Bolsito Mariposa.jpg",
      blankImageUrl: "/assets/Bolso Mariposa sin Bordar.jpg",
      galleryImages: ["/assets/Bolsito Mariposa.jpg"],
      bordadoGalleryImages: ["/assets/Bolsito Mariposa.jpg"]
    }
  },
  {
    id: 2,
    name: "Pañalera Multifuncional",
    description: "Pañalera espaciosa y elegante con múltiples compartimentos. Ideal para madres modernas que buscan estilo y funcionalidad.",
    price: 445000,
    category: "Pañaleras",
    imageUrl: "/assets/Multifuncional 3 Bordada.jpg",
    inStock: true,
    variants: {
      bordado: true,
      bordadoImageUrl: "/assets/Multifuncional 3 Bordada.jpg",
      blankImageUrl: "/assets/Multifuncional 3 sin Bordado.jpg",
      galleryImages: ["/assets/Multifuncional 3 sin Bordado.jpg"],
      bordadoGalleryImages: ["/assets/Multifuncional 3 Bordada.jpg"]
    }
  },
  {
    id: 3,
    name: "Mochila Milano",
    description: "Mochila urbana de lujo con diseño Milano. Combina elegancia y practicidad para el día a día.",
    price: 435000,
    category: "Mochilas",
    imageUrl: "/assets/maleta-milan-bordada.jpg",
    inStock: true,
    variants: {
      bordado: true,
      bordadoImageUrl: "/assets/maleta-milan-bordada.jpg",
      blankImageUrl: "/assets/MaletaMilan_ConBordado.jpg",
      galleryImages: ["/assets/MaletaMilan_ConBordado.jpg"],
      bordadoGalleryImages: ["/assets/maleta-milan-bordada.jpg"]
    }
  }
];

export const getMockProduct = (id: number) => {
  return mockProducts.find(p => p.id === id);
};

export const getAllMockProducts = () => {
  return mockProducts;
};