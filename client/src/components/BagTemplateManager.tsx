import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, Image, Settings, CheckCircle } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface BagTemplate {
  id: string;
  name: string;
  imageUrl: string;
  embroideryPosition: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

const BagTemplateManager: React.FC = () => {
  const [templates, setTemplates] = useState<BagTemplate[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [templateName, setTemplateName] = useState('');

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      setTemplateName(file.name.replace(/\.[^/.]+$/, ''));
    }
  };

  const uploadBagTemplate = async () => {
    if (!selectedFile || !templateName) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('bagImage', selectedFile);
      formData.append('templateName', templateName);

      const response = await fetch('/api/upload-bag-template', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();
      
      if (result.success) {
        setTemplates([...templates, result.template]);
        setSelectedFile(null);
        setTemplateName('');
      }
    } catch (error) {
      console.error('Error uploading template:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Subir Foto de Bolso en Blanco
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="bag-image">Foto del Bolso (PNG/JPG)</Label>
            <Input
              id="bag-image"
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="mt-1"
            />
            <p className="text-sm text-gray-500 mt-1">
              Sube foto del bolso en blanco para personalización
            </p>
          </div>

          {selectedFile && (
            <div>
              <Label htmlFor="template-name">Nombre del Template</Label>
              <Input
                id="template-name"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="Ej: Mochila León Samuel"
                className="mt-1"
              />
            </div>
          )}

          <Button
            onClick={uploadBagTemplate}
            disabled={!selectedFile || !templateName || isUploading}
            className="w-full"
          >
            {isUploading ? 'Subiendo...' : 'Crear Template'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Image className="w-5 h-5" />
            Templates Disponibles
          </CardTitle>
        </CardHeader>
        <CardContent>
          {templates.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Image className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No hay templates creados aún</p>
              <p className="text-sm">Sube fotos de tus bolsos para empezar</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.map((template) => (
                <div key={template.id} className="border rounded-lg p-3">
                  <img
                    src={template.imageUrl}
                    alt={template.name}
                    className="w-full h-32 object-cover rounded mb-2"
                  />
                  <h4 className="font-medium">{template.name}</h4>
                  <div className="flex items-center gap-2 mt-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-green-600">Listo para usar</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-blue-800">Instrucciones</CardTitle>
        </CardHeader>
        <CardContent className="text-blue-700 space-y-2">
          <h4 className="font-medium">Para mejores resultados:</h4>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            <li>Usa fotos con buena iluminación y fondo neutro</li>
            <li>Asegúrate que el área de bordado esté visible</li>
            <li>Resolución mínima recomendada: 800x600px</li>
            <li>Formato preferido: PNG con fondo transparente</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default BagTemplateManager;