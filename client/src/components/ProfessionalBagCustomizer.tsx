import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Download, RotateCcw, Palette, Loader2 } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface ProfessionalBagCustomizerProps {
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

const ProfessionalBagCustomizer: React.FC<ProfessionalBagCustomizerProps> = ({ 
  product, 
  onCustomizationChange 
}) => {
  const [personalization, setPersonalization] = useState('');
  const [embroideryColor, setEmbroideryColor] = useState('#8B4513');
  const [selectedFont, setSelectedFont] = useState('Georgia');
  const [previewUrl, setPreviewUrl] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [isUsingBannerbear, setIsUsingBannerbear] = useState(false);

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

  const generatePreview = async () => {
    if (!personalization.trim()) {
      setPreviewUrl('');
      return;
    }

    setIsGenerating(true);
    setError('');

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
        setPreviewUrl(data.previewUrl);
        setIsUsingBannerbear(data.isUsingBannerbear);
        
        onCustomizationChange({
          personalization: personalization.trim(),
          embroideryColor,
          font: selectedFont,
          preview: data.previewUrl
        });
      } else {
        setError(data.error || 'Error generating preview');
      }
    } catch (err) {
      setError('Failed to generate preview');
      console.error('Preview generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Debounced preview generation
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      generatePreview();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [personalization, embroideryColor, selectedFont]);

  const resetCustomization = () => {
    setPersonalization('');
    setEmbroideryColor('#8B4513');
    setSelectedFont('Georgia');
    setPreviewUrl('');
    setError('');
  };

  const downloadPreview = () => {
    if (!previewUrl) return;

    const link = document.createElement('a');
    link.download = `${product.name}-${personalization || 'preview'}.png`;
    link.href = previewUrl;
    link.click();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Professional Preview */}
      <Card className="border-2 border-blue-500 shadow-lg bg-gradient-to-br from-slate-50 to-slate-100">
        <CardHeader className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-t-xl border-b-2 border-blue-500">
          <CardTitle className="flex items-center gap-2 text-blue-100">
            <Palette className="w-5 h-5 text-blue-400" />
            Vista Profesional del Bordado
            {isUsingBannerbear && (
              <Badge variant="secondary" className="text-xs bg-blue-600 text-white">
                Pro
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 bg-gradient-to-br from-slate-50 to-slate-100">
          <div className="relative">
            {isGenerating && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80 rounded-xl z-10">
                <div className="flex items-center gap-2 text-blue-200">
                  <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
                  <span>Generando vista elegante...</span>
                </div>
              </div>
            )}
            
            {previewUrl ? (
              <img
                src={previewUrl}
                alt={`Vista previa: ${personalization}`}
                className="w-full h-auto max-h-96 object-cover border-2 border-blue-500 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              />
            ) : (
              <div className="w-full h-96 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-2 border-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                <div className="text-center text-blue-100">
                  <Palette className="w-12 h-12 mx-auto mb-2 text-blue-400" />
                  <p className="text-sm text-blue-200">
                    {personalization.trim() 
                      ? 'Creando vista elegante...' 
                      : 'Escribe un nombre para ver la vista previa'
                    }
                  </p>
                </div>
              </div>
            )}

            {error && (
              <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
                {error}
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

          {/* Technology Badge */}
          <div className="pt-2 border-t">
            <Badge variant={isUsingBannerbear ? "default" : "outline"} className="text-xs">
              {isUsingBannerbear 
                ? "🎨 Powered by Bannerbear Pro" 
                : "🎨 Canvas Preview Mode"
              }
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfessionalBagCustomizer;