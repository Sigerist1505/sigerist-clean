import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCart } from "@/components/cart-provider";
import { useToast } from "@/hooks/use-toast";
import { Product } from "@shared/schema";
import { formatPrice } from "@/lib/utils";
import { AddonOptions } from "./addon-options"; // Asume que este componente existe

interface ProductCustomizerProps {
  product: Product;
  onClose?: () => void;
}

interface CustomizationOptions {
  name: string;
  fontStyle: string;
  fontSize: string;
  fontColor: string;
  animalTheme: string;
  bagColor: string;
  specialRequest: string;
}

interface AddonOptions {
  addPompon: boolean;
  addPersonalizedKeychain: boolean;
  addDecorativeBow: boolean;
  keychainPersonalization: string;
  totalAddonPrice: number;
}

const fontStyles = [
  { id: "elegant", name: "Elegante", preview: "Script" },
  { id: "modern", name: "Moderno", preview: "Sans-serif" },
  { id: "classic", name: "Clásico", preview: "Serif" },
  { id: "playful", name: "Divertido", preview: "Comic" }
];

const fontSizes = [
  { id: "small", name: "Pequeño", price: 0 },
  { id: "medium", name: "Mediano", price: 5 },
  { id: "large", name: "Grande", price: 10 }
];

const fontColors = [
  { id: "gold", name: "Dorado", hex: "#FFD700" },
  { id: "silver", name: "Plateado", hex: "#C0C0C0" },
  { id: "white", name: "Blanco", hex: "#FFFFFF" },
  { id: "black", name: "Negro", hex: "#000000" },
  { id: "pink", name: "Rosa", hex: "#FF69B4" },
  { id: "blue", name: "Azul", hex: "#4169E1" }
];

const animalThemes = [
  { id: "lion", name: "León", price: 15, emoji: "🦁" },
  { id: "giraffe", name: "Jirafa", price: 15, emoji: "🦒" },
  { id: "elephant", name: "Elefante", price: 15, emoji: "🐘" },
  { id: "bear", name: "Oso", price: 15, emoji: "🧸" },
  { id: "unicorn", name: "Unicornio", price: 20, emoji: "🦄" },
  { id: "princess", name: "Princesa", price: 20, emoji: "👸" },
  { id: "dinosaur", name: "Dinosaurio", price: 15, emoji: "🦕" },
  { id: "butterfly", name: "Mariposa", price: 15, emoji: "🦋" }
];

const bagColors = [
  { id: "black", name: "Negro", hex: "#000000" },
  { id: "brown", name: "Café", hex: "#8B4513" },
  { id: "navy", name: "Azul Marino", hex: "#000080" },
  { id: "pink", name: "Rosa", hex: "#FFC0CB" },
  { id: "purple", name: "Morado", hex: "#800080" },
  { id: "red", name: "Rojo", hex: "#DC143C" }
];

export function ProductCustomizer({ product, onClose }: ProductCustomizerProps) {
  const [customization, setCustomization] = useState<CustomizationOptions>({
    name: "",
    fontStyle: "elegant",
    fontSize: "medium",
    fontColor: "gold",
    animalTheme: "lion",
    bagColor: "black",
    specialRequest: ""
  });

  const [totalPrice, setTotalPrice] = useState(Number(product.price));
  const [addonOptions, setAddonOptions] = useState<AddonOptions>({
    addPompon: false,
    addPersonalizedKeychain: false,
    addDecorativeBow: false,
    keychainPersonalization: "",
    totalAddonPrice: 0,
  });
  const { addItem } = useCart();
  const { toast } = useToast();

  useEffect(() => {
    calculatePrice();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customization, addonOptions, product.price]);

  const calculatePrice = () => {
    let price = Number(product.price);

    // Add font size cost
    const fontSize = fontSizes.find(f => f.id === customization.fontSize);
    if (fontSize) price += fontSize.price;

    // Add animal theme cost
    const animal = animalThemes.find(a => a.id === customization.animalTheme);
    if (animal) price += animal.price;

    // Add addon costs
    price += addonOptions.totalAddonPrice;

    setTotalPrice(price);
  };

  const handleCustomizationChange = (field: keyof CustomizationOptions, value: string) => {
    setCustomization(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddToCart = () => {
    if (!customization.name.trim()) {
      toast({
        title: "Nombre requerido",
        description: "Por favor ingresa el nombre para personalizar",
        variant: "destructive"
      });
      return;
    }

    // Validate keychain personalization if selected
    if (addonOptions.addPersonalizedKeychain && !addonOptions.keychainPersonalization.trim()) {
      toast({
        title: "Campo requerido",
        description: "Por favor ingresa el texto para el llavero personalizado",
        variant: "destructive"
      });
      return;
    }

    const personalizationText = `Nombre: ${customization.name}, Tema: ${animalThemes.find(a => a.id === customization.animalTheme)?.name}, Color de fuente: ${fontColors.find(c => c.id === customization.fontColor)?.name}, Estilo: ${fontStyles.find(f => f.id === customization.fontStyle)?.name}, Tamaño: ${fontSizes.find(s => s.id === customization.fontSize)?.name}, Color del bolso: ${bagColors.find(b => b.id === customization.bagColor)?.name}${customization.specialRequest ? `, Solicitud especial: ${customization.specialRequest}` : ''}`;

    addItem({
      productId: product.id,
      name: product.name,
      price: Number(totalPrice), // <-- así, como número
      quantity: 1,
      personalization: personalizationText,
      embroideryColor: customization.fontColor,
      embroideryFont: customization.fontStyle,
      addPompon: addonOptions.addPompon,
      addPersonalizedKeychain: addonOptions.addPersonalizedKeychain,
      addDecorativeBow: addonOptions.addDecorativeBow,
      keychainPersonalization: addonOptions.keychainPersonalization,
    });

    toast({
      title: "¡Agregado al carrito!",
      description: `${product.name} personalizado agregado correctamente`,
    });

    // Close the customizer after a short delay to show the toast
    setTimeout(() => {
      if (onClose) onClose();
    }, 1000);
  };

  const selectedAnimal = animalThemes.find(a => a.id === customization.animalTheme);
  const selectedFontColor = fontColors.find(c => c.id === customization.fontColor);
  const selectedBagColor = bagColors.find(b => b.id === customization.bagColor);
  const selectedFontStyle = fontStyles.find(f => f.id === customization.fontStyle);

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      {/* Preview Section */}
      <div className="space-y-6">
        <Card className="bg-black border border-accent/30">
          <CardHeader>
            <CardTitle className="text-accent">Vista Previa</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              {/* Bag Preview */}
              <div 
                className="w-full h-80 rounded-lg flex items-center justify-center relative overflow-hidden transition-all duration-300"
                style={{ backgroundColor: selectedBagColor?.hex }}
              >
                {/* Bag silhouette overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
                
                {/* Animal theme preview */}
                <div className="text-center z-10 transition-all duration-300 scale-100 hover:scale-105">
                  <div className="text-6xl mb-4">{selectedAnimal?.emoji}</div>
                  
                  {/* Name preview */}
                  {customization.name && (
                    <div 
                      className={`text-2xl font-bold mb-2 transition-all duration-300`}
                      style={{ 
                        color: selectedFontColor?.hex,
                        fontFamily: selectedFontStyle?.preview === 'Script' ? 'cursive' : 
                                   selectedFontStyle?.preview === 'Sans-serif' ? 'sans-serif' :
                                   selectedFontStyle?.preview === 'Serif' ? 'serif' : 'comic sans ms',
                        fontSize: customization.fontSize === 'small' ? '1.25rem' :
                                  customization.fontSize === 'large' ? '2rem' : '1.5rem',
                        textShadow: selectedBagColor?.id === 'black' ? '1px 1px 2px rgba(255,255,255,0.3)' : '1px 1px 2px rgba(0,0,0,0.3)'
                      }}
                    >
                      {customization.name}
                    </div>
                  )}
                  
                  <div className="text-sm text-white/80">
                    {selectedAnimal?.name}
                  </div>
                </div>
              </div>
              
              {/* Product info overlay */}
              <div className="absolute top-4 left-4 bg-black/80 text-white p-2 rounded transition-all duration-300 hover:scale-105">
                <div className="text-sm font-medium">{product.name}</div>
                <div className="text-xs text-accent">{formatPrice(totalPrice)}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Customization Summary */}
        <Card className="bg-black border border-accent/30">
          <CardHeader>
            <CardTitle className="text-accent">Resumen de Personalización</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-400">Nombre:</span>
                <div className="text-white font-medium">{customization.name || "No especificado"}</div>
              </div>
              <div>
                <span className="text-gray-400">Tema:</span>
                <div className="text-white font-medium">{selectedAnimal?.name}</div>
              </div>
              <div>
                <span className="text-gray-400">Color de fuente:</span>
                <div className="flex items-center gap-2">
                  <div 
                    className="w-4 h-4 rounded border transition-all duration-200"
                    style={{ backgroundColor: selectedFontColor?.hex }}
                  ></div>
                  <span className="text-white font-medium">{selectedFontColor?.name}</span>
                </div>
              </div>
              <div>
                <span className="text-gray-400">Color del bolso:</span>
                <div className="flex items-center gap-2">
                  <div 
                    className="w-4 h-4 rounded border transition-all duration-200"
                    style={{ backgroundColor: selectedBagColor?.hex }}
                  ></div>
                  <span className="text-white font-medium">{selectedBagColor?.name}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Customization Options */}
      <div className="space-y-6">
        <Card className="bg-black border border-accent/30">
          <CardHeader>
            <CardTitle className="text-accent">Personaliza tu {product.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Name Input */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-white">Nombre a bordar *</Label>
              <Input
                id="name"
                placeholder="Ej: Samuel, Andrea, etc."
                value={customization.name}
                onChange={(e) => handleCustomizationChange('name', e.target.value)}
                maxLength={20}
                className="bg-gray-900 border-accent/30 text-white"
              />
              <p className="text-xs text-gray-400">Máximo 20 caracteres</p>
            </div>

            <Separator className="bg-accent/20" />

            {/* Animal Theme */}
            <div className="space-y-3">
              <Label className="text-white">Tema Animal</Label>
              <div className="grid grid-cols-4 gap-2">
                {animalThemes.map((animal) => (
                  <button
                    key={animal.id}
                    onClick={() => handleCustomizationChange('animalTheme', animal.id)}
                    className={`p-3 rounded-lg border text-center transition-all duration-200 ${
                      customization.animalTheme === animal.id
                        ? 'border-accent bg-accent/20 text-accent'
                        : 'border-gray-600 hover:border-accent/50 text-gray-300'
                    }`}
                  >
                    <div className="text-2xl mb-1">{animal.emoji}</div>
                    <div className="text-xs">{animal.name}</div>
                    <div className="text-xs text-accent">+${animal.price}</div>
                  </button>
                ))}
              </div>
            </div>

            <Separator className="bg-accent/20" />

            {/* Font Style */}
            <div className="space-y-2">
              <Label className="text-white">Estilo de Fuente</Label>
              <Select value={customization.fontStyle} onValueChange={(value) => handleCustomizationChange('fontStyle', value)}>
                <SelectTrigger className="bg-gray-900 border-accent/30 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {fontStyles.map((style) => (
                    <SelectItem key={style.id} value={style.id}>
                      <span style={{ fontFamily: style.preview.toLowerCase() }}>{style.name}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Font Size */}
            <div className="space-y-2">
              <Label className="text-white">Tamaño de Fuente</Label>
              <Select value={customization.fontSize} onValueChange={(value) => handleCustomizationChange('fontSize', value)}>
                <SelectTrigger className="bg-gray-900 border-accent/30 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {fontSizes.map((size) => (
                    <SelectItem key={size.id} value={size.id}>
                      {size.name} {size.price > 0 && `(+$${size.price})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Font Color */}
            <div className="space-y-3">
              <Label className="text-white">Color de Fuente</Label>
              <div className="grid grid-cols-6 gap-2">
                {fontColors.map((color) => (
                  <button
                    key={color.id}
                    onClick={() => handleCustomizationChange('fontColor', color.id)}
                    className={`w-10 h-10 rounded-lg border-2 transition-all duration-200 ${
                      customization.fontColor === color.id
                        ? 'border-accent scale-110'
                        : 'border-gray-600 hover:border-accent/50'
                    }`}
                    style={{ backgroundColor: color.hex }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>

            {/* Bag Color */}
            <div className="space-y-3">
              <Label className="text-white">Color del Bolso</Label>
              <div className="grid grid-cols-6 gap-2">
                {bagColors.map((color) => (
                  <button
                    key={color.id}
                    onClick={() => handleCustomizationChange('bagColor', color.id)}
                    className={`w-10 h-10 rounded-lg border-2 transition-all duration-200 ${
                      customization.bagColor === color.id
                        ? 'border-accent scale-110'
                        : 'border-gray-600 hover:border-accent/50'
                    }`}
                    style={{ backgroundColor: color.hex }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>

            <Separator className="bg-accent/20" />

            {/* Special Requests */}
            <div className="space-y-2">
              <Label htmlFor="special" className="text-white">Solicitudes Especiales (opcional)</Label>
              <Textarea
                id="special"
                placeholder="Cualquier solicitud especial para tu diseño..."
                value={customization.specialRequest}
                onChange={(e) => handleCustomizationChange('specialRequest', e.target.value)}
                maxLength={200}
                className="bg-gray-900 border-accent/30 text-white"
              />
              <p className="text-xs text-gray-400">Máximo 200 caracteres</p>
            </div>
          </CardContent>
        </Card>

        {/* Addon Options */}
        <AddonOptions 
          onAddonChange={(newAddonOptions) => setAddonOptions(newAddonOptions)}
        />

        {/* Price and Add to Cart */}
        <Card className="bg-black border border-accent/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-lg font-medium text-white">Precio Total:</span>
              <span className="text-2xl font-bold text-accent transition-all duration-300 ease-in-out">{formatPrice(totalPrice)}</span>
            </div>
            
            <div className="text-sm text-gray-400 mb-4">
              <div>Producto base: {formatPrice(product.price)}</div>
              {fontSizes.find(f => f.id === customization.fontSize)?.price! > 0 && (
                <div>Tamaño de fuente: +${fontSizes.find(f => f.id === customization.fontSize)?.price}</div>
              )}
              <div>Tema animal: +${selectedAnimal?.price}</div>
              {addonOptions.totalAddonPrice > 0 && (
                <div>Adicionales: {formatPrice(addonOptions.totalAddonPrice)}</div>
              )}
            </div>

            <Button 
              onClick={handleAddToCart}
              disabled={!customization.name.trim()}
              className="w-full bg-accent hover:bg-accent/90 text-black font-semibold"
            >
              Agregar al Carrito - {formatPrice(totalPrice)}
            </Button>
            
            <p className="text-xs text-gray-400 mt-2 text-center">
              Tiempo de bordado: 48 horas • Entrega: 24 horas
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}