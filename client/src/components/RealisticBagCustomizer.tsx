import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Download, Palette, Sparkles, Crown, Zap } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface RealisticBagCustomizerProps {
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

const RealisticBagCustomizer: React.FC<RealisticBagCustomizerProps> = ({ 
  product, 
  onCustomizationChange 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [personalization, setPersonalization] = useState('');
  const [embroideryColor, setEmbroideryColor] = useState('#4169E1');
  const [selectedFont, setSelectedFont] = useState('Georgia');
  const [previewUrl, setPreviewUrl] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const embroideryColors = [
    { name: 'Azul Royal', value: '#4169E1' },
    { name: 'Dorado', value: '#FFD700' },
    { name: 'Plateado', value: '#C0C0C0' },
    { name: 'Rosa', value: '#FF69B4' },
    { name: 'Negro', value: '#000000' },
    { name: 'Blanco', value: '#FFFFFF' },
    { name: 'Verde', value: '#228B22' },
    { name: 'Rojo', value: '#DC143C' },
  ];

  const embroideryFonts = [
    'Georgia',
    'Times New Roman', 
    'Brush Script MT',
    'Lucida Handwriting',
    'Palace Script MT',
    'Monotype Corsiva'
  ];

  const generateCanvasPreview = async () => {
    const canvas = canvasRef.current;
    if (!canvas || !personalization.trim()) {
      setPreviewUrl('');
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 600;
    canvas.height = 400;

    // Create realistic bag with embroidery
    try {
      // Load product image as base
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        // Draw base image
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // Add realistic embroidery overlay
        drawRealisticEmbroidery(ctx, personalization, embroideryColor, selectedFont);
        
        const dataUrl = canvas.toDataURL();
        setPreviewUrl(dataUrl);
        
        onCustomizationChange({
          personalization: personalization.trim(),
          embroideryColor,
          font: selectedFont,
          preview: dataUrl
        });
      };

      img.onerror = () => {
        // Fallback: create luxury bag from scratch
        drawLuxuryBag(ctx);
        drawRealisticEmbroidery(ctx, personalization, embroideryColor, selectedFont);
        
        const dataUrl = canvas.toDataURL();
        setPreviewUrl(dataUrl);
        
        onCustomizationChange({
          personalization: personalization.trim(),
          embroideryColor,
          font: selectedFont,
          preview: dataUrl
        });
      };
      
      img.src = product.image;
    } catch (error) {
      console.error('Error generating preview:', error);
    }
  };

  const generateBannerbearPreview = async () => {
    if (!personalization.trim()) {
      setPreviewUrl('');
      return;
    }

    setIsGenerating(true);
    
    try {
      const response = await apiRequest('POST', '/api/generate-bag-preview', {
        productName: product.name,
        personalization: personalization.trim(),
        embroideryColor,
        font: selectedFont,
        baseImageUrl: product.image
      });

      const data = await response.json();
      
      if (data.success && data.previewUrl) {
        setPreviewUrl(data.previewUrl);
        
        onCustomizationChange({
          personalization: personalization.trim(),
          embroideryColor,
          font: selectedFont,
          preview: data.previewUrl
        });
      }
    } catch (error) {
      console.error('Error with Bannerbear preview:', error);
      // Fallback to canvas preview
      await generateCanvasPreview();
    } finally {
      setIsGenerating(false);
    }
  };

  const generateRealisticPreview = async () => {
    await generateCanvasPreview();
  };

  const drawLuxuryBag = (ctx: CanvasRenderingContext2D) => {
    const { width, height } = ctx.canvas;
    
    // Background
    const bgGradient = ctx.createLinearGradient(0, 0, width, height);
    bgGradient.addColorStop(0, '#f0f0f0');
    bgGradient.addColorStop(1, '#d0d0d0');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);
    
    // Luxury bag base
    const bagGradient = ctx.createLinearGradient(0, 0, width, height);
    bagGradient.addColorStop(0, '#E8DCC0');
    bagGradient.addColorStop(0.5, '#D4C4A0');
    bagGradient.addColorStop(1, '#B8A082');
    
    // Main bag body
    ctx.fillStyle = bagGradient;
    ctx.beginPath();
    ctx.ellipse(width/2, height/2, width*0.35, height*0.3, 0, 0, 2 * Math.PI);
    ctx.fill();
    
    // Bag outline
    ctx.strokeStyle = '#8B7355';
    ctx.lineWidth = 3;
    ctx.stroke();
    
    // Bag handles
    ctx.strokeStyle = '#8B7355';
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(width/2, height*0.25, width*0.25, 0, Math.PI);
    ctx.stroke();
    
    // Hardware details
    ctx.fillStyle = '#C9B037';
    ctx.beginPath();
    ctx.arc(width*0.25, height*0.4, 8, 0, 2 * Math.PI);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(width*0.75, height*0.4, 8, 0, 2 * Math.PI);
    ctx.fill();
  };

  const drawRealisticEmbroidery = (ctx: CanvasRenderingContext2D, text: string, color: string, font: string) => {
    const { width, height } = ctx.canvas;
    const fontSize = Math.max(24, Math.min(48, 300 / text.length));
    
    // Text positioning
    const x = width / 2;
    const y = height * 0.65;
    
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Create embroidery shadow
    ctx.font = `bold ${fontSize}px ${font}`;
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.fillText(text, x + 3, y + 3);
    
    // Create base embroidery
    ctx.fillStyle = color;
    ctx.fillText(text, x, y);
    
    // Add thread texture effect
    ctx.globalCompositeOperation = 'multiply';
    ctx.fillStyle = lightenColor(color, 30);
    ctx.fillText(text, x - 1, y - 1);
    
    // Add highlight
    ctx.globalCompositeOperation = 'overlay';
    ctx.fillStyle = lightenColor(color, 50);
    ctx.fillText(text, x + 0.5, y - 0.5);
    
    // Add stitch outline
    ctx.globalCompositeOperation = 'source-over';
    ctx.strokeStyle = darkenColor(color, 30);
    ctx.lineWidth = 0.8;
    ctx.strokeText(text, x, y);
    
    // Individual stitch marks
    const textWidth = ctx.measureText(text).width;
    const stitchSpacing = textWidth / (text.length * 3);
    
    ctx.fillStyle = darkenColor(color, 40);
    for (let i = 0; i < text.length * 3; i++) {
      const stitchX = x - textWidth/2 + i * stitchSpacing;
      const stitchY = y + fontSize * 0.4 + (Math.random() - 0.5) * 4;
      
      ctx.beginPath();
      ctx.arc(stitchX, stitchY, 1, 0, 2 * Math.PI);
      ctx.fill();
    }
    
    // Quality badge
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.fillRect(width - 100, height - 40, 90, 30);
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.strokeRect(width - 100, height - 40, 90, 30);
    
    ctx.fillStyle = darkenColor(color, 30);
    ctx.font = 'bold 10px Arial';
    ctx.fillText('BORDADO', width - 55, height - 30);
    ctx.fillText('ARTESANAL', width - 55, height - 20);
  };

  const lightenColor = (color: string, percent: number): string => {
    if (color.startsWith('#')) {
      const num = parseInt(color.slice(1), 16);
      const amt = Math.round(2.55 * percent);
      const R = Math.min(255, (num >> 16) + amt);
      const G = Math.min(255, ((num >> 8) & 0x00FF) + amt);
      const B = Math.min(255, (num & 0x0000FF) + amt);
      return `#${((1 << 24) + (R << 16) + (G << 8) + B).toString(16).slice(1)}`;
    }
    return color;
  };

  const darkenColor = (color: string, percent: number): string => {
    if (color.startsWith('#')) {
      const num = parseInt(color.slice(1), 16);
      const amt = Math.round(2.55 * percent);
      const R = Math.max(0, (num >> 16) - amt);
      const G = Math.max(0, ((num >> 8) & 0x00FF) - amt);
      const B = Math.max(0, (num & 0x0000FF) - amt);
      return `#${((1 << 24) + (R << 16) + (G << 8) + B).toString(16).slice(1)}`;
    }
    return color;
  };

  const downloadPreview = () => {
    if (!previewUrl) return;
    const link = document.createElement('a');
    link.download = `${product.name}-${personalization || 'preview'}.png`;
    link.href = previewUrl;
    link.click();
  };

  // Auto-generate preview
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      generateRealisticPreview();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [personalization, embroideryColor, selectedFont]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Preview Display */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5" />
            Vista Previa Realista
            <Badge variant="default" className="text-xs">
              <Sparkles className="w-3 h-3 mr-1" />
              En Tiempo Real
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <canvas
              ref={canvasRef}
              className="w-full h-auto max-h-96 border border-gray-200 rounded-lg shadow-sm"
              style={{ display: 'none' }}
            />
            
            {previewUrl ? (
              <img
                src={previewUrl}
                alt={`Vista previa: ${personalization}`}
                className="w-full h-auto max-h-96 object-contain border border-gray-200 rounded-lg shadow-sm"
              />
            ) : (
              <div className="w-full h-96 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-center">
                <div className="text-center text-gray-500">
                  {isGenerating ? (
                    <>
                      <div className="animate-spin w-8 h-8 border-4 border-gold border-t-transparent rounded-full mx-auto mb-2" />
                      <p className="text-sm">Generando preview premium...</p>
                    </>
                  ) : (
                    <>
                      <Palette className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">
                        {personalization.trim() 
                          ? 'Generando bordado realista...' 
                          : 'Escribe un nombre para ver el bordado'
                        }
                      </p>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-center gap-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={downloadPreview}
              disabled={!previewUrl}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Descargar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Customization Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Personalización del Bordado</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Name Input */}
          <div>
            <Label htmlFor="personalization">Nombre a Bordar</Label>
            <Input
              id="personalization"
              value={personalization}
              onChange={(e) => setPersonalization(e.target.value)}
              placeholder="Ej: Salomón, Pedro, Diego..."
              maxLength={15}
              className="mt-1"
            />
            <p className="text-sm text-gray-500 mt-1">
              {personalization.length}/15 caracteres
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
                    w-full p-3 rounded-md border-2 transition-all relative
                    ${embroideryColor === color.value 
                      ? 'border-gold scale-105 shadow-lg' 
                      : 'border-gray-200 hover:border-gray-300'
                    }
                  `}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                >
                  <div className="w-full h-4 rounded" />
                  {embroideryColor === color.value && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-3 h-3 bg-white rounded-full border-2 border-gray-600" />
                    </div>
                  )}
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

          {/* Technology Info */}
          <div className="pt-2 border-t">
            <Badge variant="default" className="text-xs">
              <Sparkles className="w-3 h-3 mr-1" />
              Bordado Realista - Gratis e Ilimitado
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RealisticBagCustomizer;