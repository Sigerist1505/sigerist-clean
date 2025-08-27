import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, RotateCcw, Palette } from 'lucide-react';

interface BagCustomizerProps {
  product: {
    id: number;
    name: string;
    image: string;
    price: number;
  };
  onCustomizationChange: (customization: {
    personalization: string;
    embroideryColor: string;
    font: string;
    preview: string;
  }) => void;
}

const BagCustomizer: React.FC<BagCustomizerProps> = ({ product, onCustomizationChange }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [personalization, setPersonalization] = useState('');
  const [embroideryColor, setEmbroideryColor] = useState('#8B4513');
  const [selectedFont, setSelectedFont] = useState('Georgia');
  const [bagImage, setBagImage] = useState<HTMLImageElement | null>(null);
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  const embroideryColors = [
    { name: 'Marrón Clásico', value: '#8B4513' },
    { name: 'Dorado', value: '#FFD700' },
    { name: 'Plateado', value: '#C0C0C0' },
    { name: 'Rosa', value: '#FF69B4' },
    { name: 'Azul Marino', value: '#000080' },
    { name: 'Negro', value: '#000000' },
    { name: 'Blanco', value: '#FFFFFF' },
  ];

  const embroideryFonts = [
    'Georgia',
    'Times New Roman',
    'Brush Script MT',
    'Lucida Handwriting',
    'Monotype Corsiva',
    'Palace Script MT'
  ];

  // Load bag image with loading state
  useEffect(() => {
    setIsImageLoaded(false);
    const img = new Image();
    img.onload = () => {
      setBagImage(img);
      setIsImageLoaded(true);
      drawCanvas();
    };
    img.onerror = () => {
      setIsImageLoaded(true);
      setBagImage(null);
      drawCanvas();
    };
    // Load from attached assets
    img.src = product.image;
  }, [product.image]);

  // Redraw canvas when customization changes with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      drawCanvas();
    }, 100); // Debounce for 100ms

    return () => clearTimeout(timeoutId);
  }, [personalization, embroideryColor, selectedFont, bagImage]);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = 400;
    canvas.height = 400;

    // Clear canvas with elegant background
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw elegant gradient background
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#f8fafc');
    gradient.addColorStop(1, '#e2e8f0');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add subtle border
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 3;
    ctx.strokeRect(2, 2, canvas.width - 4, canvas.height - 4);

    // Draw bag image if available - improved to show full product
    if (bagImage) {
      // Calculate dimensions to fit the full image properly
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      const aspectRatio = bagImage.width / bagImage.height;
      
      let drawWidth, drawHeight;
      
      // Fill more of the canvas while maintaining aspect ratio
      if (aspectRatio > 1) {
        // Wider image
        drawWidth = canvasWidth * 0.9;
        drawHeight = drawWidth / aspectRatio;
        if (drawHeight > canvasHeight * 0.8) {
          drawHeight = canvasHeight * 0.8;
          drawWidth = drawHeight * aspectRatio;
        }
      } else {
        // Taller image
        drawHeight = canvasHeight * 0.9;
        drawWidth = drawHeight * aspectRatio;
        if (drawWidth > canvasWidth * 0.8) {
          drawWidth = canvasWidth * 0.8;
          drawHeight = drawWidth / aspectRatio;
        }
      }

      const x = (canvasWidth - drawWidth) / 2;
      const y = (canvasHeight - drawHeight) / 2;

      // Draw with improved scaling to show complete product
      ctx.drawImage(bagImage, x, y, drawWidth, drawHeight);

      // Draw embroidered text directly on the bag
      if (personalization.trim()) {
        drawEmbroideredTextOnBag(ctx, personalization, drawWidth, drawHeight, x, y);
      }
    } else {
      // Product name placeholder with elegant styling
      ctx.fillStyle = '#64748b';
      ctx.font = 'bold 18px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(product.name, canvas.width/2, canvas.height/2 - 30);
      
      // Instructions
      ctx.font = '16px Arial';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('Cargando producto...', canvas.width/2, canvas.height/2);
      
      // Show preview text even without image
      if (personalization.trim()) {
        const fontSize = 24;
        ctx.font = `bold ${fontSize}px ${selectedFont}`;
        ctx.fillStyle = embroideryColor;
        ctx.fillText(personalization, canvas.width/2, canvas.height/2 + 40);
      }
    }

    // Generate preview URL
    const previewUrl = canvas.toDataURL('image/png');
    onCustomizationChange({
      personalization,
      embroideryColor,
      font: selectedFont,
      preview: previewUrl
    });
  };

  const drawEmbroideredTextOnBag = (
    ctx: CanvasRenderingContext2D,
    text: string,
    bagWidth: number,
    bagHeight: number,
    offsetX: number,
    offsetY: number
  ) => {
    // Position text on the bag where embroidery would typically go
    const textX = offsetX + bagWidth / 2;
    const textY = offsetY + bagHeight * 0.65; // Positioned on the bag surface

    // Calculate appropriate font size based on bag size
    const fontSize = Math.max(14, Math.min(24, bagWidth / 12));
    ctx.font = `bold ${fontSize}px ${selectedFont}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Create realistic embroidery effect with multiple layers
    // Shadow layer for depth
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.fillText(text, textX + 1.5, textY + 1.5);

    // Highlight layer for raised effect
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.fillText(text, textX - 0.5, textY - 0.5);

    // Main embroidery color
    ctx.fillStyle = embroideryColor;
    ctx.fillText(text, textX, textY);

    // Outline for definition
    ctx.strokeStyle = getDarkerColor(embroideryColor);
    ctx.lineWidth = 0.8;
    ctx.strokeText(text, textX, textY);

    // Add decorative stitching pattern
    const textWidth = ctx.measureText(text).width;
    ctx.fillStyle = getDarkerColor(embroideryColor);
    
    // Stitching dots above and below text
    for (let i = 0; i < textWidth; i += 8) {
      const dotX = textX - textWidth/2 + i;
      
      // Top stitching line
      ctx.beginPath();
      ctx.arc(dotX, textY - fontSize/2 - 3, 0.8, 0, Math.PI * 2);
      ctx.fill();
      
      // Bottom stitching line
      ctx.beginPath();
      ctx.arc(dotX, textY + fontSize/2 + 3, 0.8, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  const getDarkerColor = (color: string): string => {
    // Simple function to get a darker version of the color
    const colorMap: { [key: string]: string } = {
      '#FFD700': '#DAA520', // Gold to DarkGoldenRod
      '#C0C0C0': '#808080', // Silver to Gray
      '#FF69B4': '#DC143C', // HotPink to Crimson
      '#8B4513': '#654321', // SaddleBrown to darker brown
    };
    return colorMap[color] || '#333333';
  };



  const resetCustomization = () => {
    setPersonalization('');
    setEmbroideryColor('#8B4513');
    setSelectedFont('Georgia');
  };

  const downloadPreview = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `${product.name}-${personalization || 'preview'}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Preview Canvas */}
      <Card className="border-2 border-blue-500 shadow-lg bg-gradient-to-br from-slate-50 to-slate-100">
        <CardHeader className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-t-xl border-b-2 border-blue-500">
          <CardTitle className="flex items-center gap-2 text-blue-100">
            <Palette className="w-5 h-5 text-blue-400" />
            Vista Elegante del Producto
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 bg-gradient-to-br from-slate-50 to-slate-100">
          <div className="flex justify-center relative">
            {!isImageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl">
                <div className="animate-spin w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full"></div>
              </div>
            )}
            <canvas
              ref={canvasRef}
              className="border-2 border-blue-400 rounded-xl shadow-lg max-w-full h-auto"
              style={{ maxHeight: '400px', opacity: isImageLoaded ? 1 : 0.3 }}
            />
          </div>
          <div className="flex justify-center gap-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={downloadPreview}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Descargar
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={resetCustomization}
              className="flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Resetear
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Customization Controls */}
      <Card className="border-2 border-blue-500 shadow-lg bg-gradient-to-br from-slate-50 to-slate-100">
        <CardHeader className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-t-xl border-b-2 border-blue-500">
          <CardTitle className="text-blue-100">Opciones de Bordado</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 p-6">
          {/* Name Input */}
          <div>
            <Label htmlFor="personalization">Nombre a Bordar</Label>
            <Input
              id="personalization"
              value={personalization}
              onChange={(e) => setPersonalization(e.target.value)}
              placeholder="Ej: Amanda, Pedro, Valentina..."
              maxLength={15}
              className="mt-1"
            />
            <p className="text-sm text-gray-500 mt-1">
              Máximo 15 caracteres
            </p>
          </div>

          {/* Color Selection */}
          <div>
            <Label>Color del Bordado</Label>
            <div className="grid grid-cols-4 gap-2 mt-2">
              {embroideryColors.map((color) => (
                <button
                  key={color.value}
                  onClick={() => setEmbroideryColor(color.value)}
                  className={`
                    w-full p-2 rounded-md border-2 transition-all
                    ${embroideryColor === color.value 
                      ? 'border-gold scale-105' 
                      : 'border-gray-200 hover:border-gray-300'
                    }
                  `}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                >
                  <div className="w-full h-4 rounded" />
                </button>
              ))}
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Color seleccionado: {embroideryColors.find(c => c.value === embroideryColor)?.name}
            </p>
          </div>

          {/* Font Selection */}
          <div>
            <Label htmlFor="font-select">Estilo de Letra</Label>
            <Select value={selectedFont} onValueChange={setSelectedFont}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {embroideryFonts.map((font) => (
                  <SelectItem key={font} value={font} style={{ fontFamily: font }}>
                    {font}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Preview Text */}
          {personalization && (
            <div className="p-3 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-600 mb-1">Vista previa del texto:</p>
              <p 
                className="text-lg font-bold"
                style={{ 
                  fontFamily: selectedFont,
                  color: embroideryColor 
                }}
              >
                {personalization}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BagCustomizer;