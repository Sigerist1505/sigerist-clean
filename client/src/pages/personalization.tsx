import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Palette, Scissors, Layers } from "lucide-react";

// List of embroidery design images in the bordados folder
const embroideryImages = [
  {
    src: "/bordados/Leoncito.jpg",
    title: "Leoncito",
    description: "Diseño de leoncito bordado artesanal"
  },
  {
    src: "/bordados/animaciones.jpg",
    title: "Animaciones",
    description: "Bordados de personajes animados"
  },
  {
    src: "/bordados/animalitos.jpg",
    title: "Animalitos",
    description: "Colección de animalitos bordados"
  },
  {
    src: "/bordados/blancanieves.jpg",
    title: "Blancanieves",
    description: "Bordado del personaje de Blancanieves"
  },
  {
    src: "/bordados/caballo.jpg",
    title: "Caballo",
    description: "Diseño de caballo bordado"
  },
  {
    src: "/bordados/carrito.jpg",
    title: "Carrito",
    description: "Bordado de carrito infantil"
  },
  {
    src: "/bordados/chico.jpg",
    title: "Chico",
    description: "Diseño de niño bordado"
  },
  {
    src: "/bordados/hada.jpg",
    title: "Hada",
    description: "Bordado de hada mágica"
  },
  {
    src: "/bordados/hada 2.jpg",
    title: "Hada 2",
    description: "Segundo diseño de hada bordada"
  },
  {
    src: "/bordados/leona.jpg",
    title: "Leona",
    description: "Bordado de leona elegante"
  },
  {
    src: "/bordados/mini mouse.jpg",
    title: "Mini Mouse",
    description: "Bordado de Mini Mouse"
  },
  {
    src: "/bordados/mouse.jpg",
    title: "Mouse",
    description: "Diseño de ratoncito bordado"
  },
  {
    src: "/bordados/muñeca.jpg",
    title: "Muñeca",
    description: "Bordado de muñeca clásica"
  },
  {
    src: "/bordados/muñeca 2.jpg",
    title: "Muñeca 2",
    description: "Segundo diseño de muñeca bordada"
  },
  {
    src: "/bordados/osito.jpg",
    title: "Osito",
    description: "Bordado de osito tierno"
  },
  {
    src: "/bordados/oveja.jpg",
    title: "Oveja",
    description: "Diseño de oveja bordada"
  },
  {
    src: "/bordados/princesa.jpg",
    title: "Princesa",
    description: "Bordado de princesa elegante"
  },
  {
    src: "/bordados/safari.jpg",
    title: "Safari",
    description: "Diseño de animales del safari"
  },
  {
    src: "/bordados/safari 2.jpg",
    title: "Safari 2",
    description: "Segundo diseño de safari bordado"
  },
  {
    src: "/bordados/wini pu.jpg",
    title: "Winnie Pooh",
    description: "Bordado de Winnie Pooh"
  },
  {
    src: "/bordados/zoo.jpg",
    title: "Zoo",
    description: "Colección de animales del zoológico"
  }
];

export default function PersonalizationPage() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % embroideryImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + embroideryImages.length) % embroideryImages.length);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black pt-20 pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 
            className="text-5xl font-bold mb-6 text-accent"
            style={{ fontFamily: "Playfair Display, serif" }}
          >
            Personalización
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            En Sigerist Luxury Bags puedes personalizar tus bolsos eligiendo lo siguiente:
          </p>
        </div>

        {/* Customization Options */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {/* Option 1: Bordado */}
          <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-accent/20 hover:border-accent/40 transition-all duration-300">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Palette className="w-8 h-8 text-accent" />
              </div>
              <CardTitle className="text-2xl text-accent">1. Bordado</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 text-center mb-4">
                Agrega bordados personalizados con nombres, diseños únicos y colores de tu elección
              </p>
              <div className="text-center">
                <Badge variant="secondary" className="bg-accent/10 text-accent">
                  Artesanal
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Option 2: Riata */}
          <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-accent/20 hover:border-accent/40 transition-all duration-300">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Scissors className="w-8 h-8 text-accent" />
              </div>
              <CardTitle className="text-2xl text-accent">2. Riata</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 text-center mb-4">
                Elige entre diferentes tipos de riatas y cierres para mayor funcionalidad y estilo
              </p>
              <div className="text-center">
                <Badge variant="secondary" className="bg-accent/10 text-accent">
                  Funcional
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Option 3: Sintético */}
          <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-accent/20 hover:border-accent/40 transition-all duration-300">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Layers className="w-8 h-8 text-accent" />
              </div>
              <CardTitle className="text-2xl text-accent">3. Sintético</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 text-center mb-4">
                Materiales sintéticos de alta calidad, resistentes y con acabados premium
              </p>
              <div className="text-center">
                <Badge variant="secondary" className="bg-accent/10 text-accent">
                  Duradero
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Embroidery Gallery */}
        <div className="mb-16">
          <h2 
            className="text-3xl font-bold text-center mb-8 text-accent"
            style={{ fontFamily: "Playfair Display, serif" }}
          >
            Galería de Bordados
          </h2>
          
          <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-accent/20">
            <CardContent className="p-6">
              {/* Main Image Display */}
              <div className="relative mb-6">
                <div className="aspect-video rounded-lg overflow-hidden bg-gray-700">
                  <img
                    src={embroideryImages[currentImageIndex].src}
                    alt={embroideryImages[currentImageIndex].title}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Navigation Arrows */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
                >
                  <ChevronLeft className="w-6 h-6" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
                >
                  <ChevronRight className="w-6 h-6" />
                </Button>

                {/* Image Counter */}
                <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                  {currentImageIndex + 1} / {embroideryImages.length}
                </div>
              </div>

              {/* Image Info */}
              <div className="text-center">
                <h3 className="text-xl font-semibold text-accent mb-2">
                  {embroideryImages[currentImageIndex].title}
                </h3>
                <p className="text-gray-300">
                  {embroideryImages[currentImageIndex].description}
                </p>
              </div>

              {/* Thumbnail Navigation */}
              <div className="grid grid-cols-4 md:grid-cols-8 gap-2 mt-6">
                {embroideryImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      index === currentImageIndex 
                        ? 'border-accent' 
                        : 'border-transparent hover:border-gray-500'
                    }`}
                  >
                    <img
                      src={image.src}
                      alt={image.title}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <h3 className="text-2xl font-bold text-accent mb-4">
            ¿Listo para personalizar tu bolso?
          </h3>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            Contacta con nuestro equipo para crear el bolso perfecto según tus gustos y necesidades
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              className="bg-accent hover:bg-accent/90 text-black font-semibold px-8 py-3"
              onClick={() => window.open('https://wa.me/573003820406', '_blank')}
            >
              Contactar por WhatsApp
            </Button>
            <Button 
              variant="outline" 
              className="border-accent text-accent hover:bg-accent/10 px-8 py-3"
              onClick={() => window.open('https://instagram.com/sigerist_luxury_bags', '_blank')}
            >
              Ver más en Instagram
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}