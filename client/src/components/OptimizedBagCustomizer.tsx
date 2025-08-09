import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Sparkles, Eye, Download, AlertTriangle, CheckCircle } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface OptimizedBagCustomizerProps {
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

const OptimizedBagCustomizer: React.FC<OptimizedBagCustomizerProps> = ({ 
  product, 
  onCustomizationChange 
}) => {
  const [personalization, setPersonalization] = useState('');
  const [embroideryColor, setEmbroideryColor] = useState('#8B4513');
  const [selectedFont, setSelectedFont] = useState('Georgia');
  const [canvasPreview, setCanvasPreview] = useState('');
  const [professionalPreview, setProfessionalPreview] = useState('');
  const [previewCount, setPreviewCount] = useState(0);
  const [isGeneratingPro, setIsGeneratingPro] = useState(false);
  const [showProfessional, setShowProfessional] = useState(false);

  const MAX_PROFESSIONAL_PREVIEWS = 5;

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
    'Georgia', 'Times New Roman', 'Brush Script MT',
    'Lucida Handwriting', 'Monotype Corsiva', 'Palace Script MT'
  ];

  // Generate instant Canvas preview (free)
  const generateCanvasPreview = () => {
    if (!personalization.trim()) {
      setCanvasPreview('');
      return;
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 400;
    canvas.height = 300;

    // Load product image
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      // Draw product image
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      // Add embroidery text
      ctx.font = `bold 24px ${selectedFont}`;
      ctx.fillStyle = embroideryColor;
      ctx.textAlign = 'center';
      ctx.fillText(personalization, canvas.width / 2, canvas.height / 2);
      
      // Add border effect
      ctx.strokeStyle = embroideryColor;
      ctx.lineWidth = 1;
      ctx.strokeText(personalization, canvas.width / 2, canvas.height / 2);
      
      setCanvasPreview(canvas.toDataURL());
      
      onCustomizationChange({
        personalization: personalization.trim(),
        embroideryColor,
        font: selectedFont,
        preview: showProfessional ? professionalPreview : canvas.toDataURL()
      });
    };
    
    img.src = product.image;
  };

  // Generate professional SVG preview (free and high quality)
  const generateProfessionalPreview = async () => {
    if (!personalization.trim()) return;

    setIsGeneratingPro(true);
    
    try {
      const response = await apiRequest('POST', '/api/generate-bag-preview', {
        productName: product.name,
        personalization: personalization.trim(),
        embroideryColor,
        font: selectedFont,
        baseImageUrl: product.image
      });

      const data = await response.json();
      
      if (data.success) {
        setProfessionalPreview(data.previewUrl);
        setShowProfessional(true);
        
        onCustomizationChange({
          personalization: personalization.trim(),
          embroideryColor,
          font: selectedFont,
          preview: data.previewUrl
        });
      }
    } catch (error) {
      console.error('Error generating professional preview:', error);
    } finally {
      setIsGeneratingPro(false);
    }
  };

  // Auto-generate professional preview
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      generateProfessionalPreview();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [personalization, embroideryColor, selectedFont]);

  const remainingPreviews = MAX_PROFESSIONAL_PREVIEWS - previewCount;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Preview Display */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Vista Previa
            {showProfessional && (
              <Badge variant="default" className="text-xs">
                <Sparkles className="w-3 h-3 mr-1" />
                Profesional
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            {(showProfessional ? professionalPreview : canvasPreview) ? (
              <img
                src={showProfessional ? professionalPreview : canvasPreview}
                alt={`Vista previa: ${personalization}`}
                className="w-full h-auto max-h-96 object-contain border border-gray-200 rounded-lg shadow-sm"
              />
            ) : (
              <div className="w-full h-96 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <Eye className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">
                    {personalization.trim() 
                      ? 'Generando vista previa...' 
                      : 'Escribe un nombre para ver la vista previa'
                    }
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Preview Quality Toggle */}
          <div className="flex gap-2 mt-4">
            <Button
              variant="default"
              size="sm"
              onClick={() => {
                setShowProfessional(false);
                generateCanvasPreview();
              }}
              className="flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Vista Profesional (Gratis)
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              disabled={!personalization.trim()}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Descargar
            </Button>
          </div>

          {/* Usage Warning */}
          {remainingPreviews <= 2 && remainingPreviews > 0 && (
            <Alert className="mt-4 border-orange-200 bg-orange-50">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-700">
                Te quedan {remainingPreviews} vistas previas profesionales
              </AlertDescription>
            </Alert>
          )}

          {remainingPreviews <= 0 && (
            <Alert className="mt-4 border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-700">
                Límite alcanzado. Usa vista rápida para explorar más opciones.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Customization Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Personalización</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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
                    w-full p-2 rounded-md border-2 transition-all relative
                    ${embroideryColor === color.value 
                      ? 'border-gold scale-105' 
                      : 'border-gray-200 hover:border-gray-300'
                    }
                  `}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                >
                  <div className="w-full h-4 rounded" />
                  {embroideryColor === color.value && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full border border-gray-400" />
                    </div>
                  )}
                </button>
              ))}
            </div>
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

          {/* Smart Usage Guide */}
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="pt-4">
              <div className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="text-blue-700 text-sm">
                  <p className="font-medium mb-1">Uso Inteligente:</p>
                  <ul className="space-y-1 text-xs">
                    <li>• Explora con <strong>Vista Rápida</strong> (ilimitada)</li>
                    <li>• Usa <strong>Profesional</strong> solo para decisión final</li>
                    <li>• Máximo {MAX_PROFESSIONAL_PREVIEWS} vistas profesionales por sesión</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
};

export default OptimizedBagCustomizer;