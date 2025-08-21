import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatPrice } from "@/lib/utils";

interface AddonOption {
  id: string;
  name: string;
  description: string;
  price: number;
  requiresPersonalization?: boolean;
}

interface AddonOptionsProps {
  onAddonChange: (addons: {
    addPompon: boolean;
    addPersonalizedKeychain: boolean;
    addDecorativeBow: boolean;
    addPersonalization: boolean;
    addExpressService: boolean; // Añadido para Servicio Express
    keychainPersonalization: string;
    namePersonalization: string;
    totalAddonPrice: number;
  }) => void;
}

const addonOptions: AddonOption[] = [
  {
    id: "pompon",
    name: "Pompón Decorativo",
    description: "Pompón de colores que combina perfectamente con tu bolso",
    price: 45000,
  },
  {
    id: "keychain",
    name: "Llavero Personalizado",
    description: "Llavero bordado con el nombre que elijas",
    price: 55000,
    requiresPersonalization: true,
  },
  {
    id: "bow",
    name: "Moño Decorativo",
    description: "Elegante moño decorativo para darle un toque especial",
    price: 55000,
  },
  {
    id: "personalization",
    name: "Personalización de Nombre",
    description: "Bordado personalizado con el nombre que desees",
    price: 15000,
    requiresPersonalization: true,
  },
  {
    id: "expressService",
    name: "Servicio Express",
    description: "Entrega en 24 horas (costo adicional)",
    price: 50000, // $50.000 como ejemplo
  },
];

export function AddonOptions({ onAddonChange }: AddonOptionsProps) {
  const [selectedAddons, setSelectedAddons] = useState({
    addPompon: false,
    addPersonalizedKeychain: false,
    addDecorativeBow: false,
    addPersonalization: false,
    addExpressService: false, // Añadido para Servicio Express
  });

  const [keychainPersonalization, setKeychainPersonalization] = useState("");
  const [namePersonalization, setNamePersonalization] = useState("");

  // Recalcular totalAddonPrice cuando cambien los estados
  useEffect(() => {
    const totalAddonPrice = addonOptions.reduce((total, addon) => {
      const key = `add${addon.id.charAt(0).toUpperCase() + addon.id.slice(1)}` as keyof typeof selectedAddons;
      if (selectedAddons[key]) {
        return total + addon.price;
      }
      return total;
    }, 0);

    onAddonChange({
      ...selectedAddons,
      keychainPersonalization,
      namePersonalization,
      totalAddonPrice,
    });
  }, [selectedAddons, keychainPersonalization, namePersonalization, onAddonChange]);

  const handleAddonToggle = (addonId: string, checked: boolean) => {
    const newSelectedAddons = {
      ...selectedAddons,
      [`add${addonId.charAt(0).toUpperCase() + addonId.slice(1)}`]: checked,
    };

    // Si desactivas keychain, borra la personalización
    if (addonId === "keychain" && !checked) {
      setKeychainPersonalization("");
    }

    setSelectedAddons(newSelectedAddons);
  };

  const handleKeychainPersonalizationChange = (value: string) => {
    setKeychainPersonalization(value);
  };

  const handleNamePersonalizationChange = (value: string) => {
    setNamePersonalization(value);
  };

  return (
    <Card className="bg-black border border-[#C0C0C0]/30">
      <CardHeader>
        <CardTitle className="text-[#ebc005] flex items-center gap-2">
          ✨ Adicionales Premium
        </CardTitle>
        <p className="text-[#C0C0C0] text-sm">
          Personaliza aún más tu bolso con estos hermosos adicionales
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {addonOptions.map((addon) => {
          const key = `add${addon.id.charAt(0).toUpperCase() + addon.id.slice(1)}` as keyof typeof selectedAddons;
          const isSelected = selectedAddons[key];

          return (
            <div
              key={addon.id}
              className={`p-4 rounded-lg border-2 transition-all ${
                isSelected
                  ? "border-[#ebc005] bg-[#ebc005]/10"
                  : "border-[#C0C0C0]/30 hover:border-[#C0C0C0]/50"
              }`}
            >
              <div className="flex items-start gap-3">
                <Checkbox
                  id={addon.id}
                  checked={isSelected}
                  onCheckedChange={(checked) =>
                    handleAddonToggle(addon.id, checked as boolean)
                  }
                  className="mt-1"
                />
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor={addon.id} className="text-white font-medium">
                      {addon.name}
                    </Label>
                    <span className="text-[#ebc005] font-bold">
                      +{formatPrice(addon.price)}
                    </span>
                  </div>
                  <p className="text-[#C0C0C0] text-sm">{addon.description}</p>

                  {/* Personalization input for keychain */}
                  {addon.id === "keychain" && isSelected && (
                    <div className="pt-2">
                      <Label htmlFor="keychain-text" className="text-white text-sm">
                        Texto para el llavero (máx. 12 caracteres)
                      </Label>
                      <Input
                        id="keychain-text"
                        placeholder="Ej: María, Familia, etc."
                        value={keychainPersonalization}
                        onChange={(e) => handleKeychainPersonalizationChange(e.target.value)}
                        maxLength={12}
                        className="mt-1 bg-gray-900 border-[#C0C0C0]/30 text-white"
                      />
                      <p className="text-xs text-gray-400 mt-1">
                        {keychainPersonalization.length}/12 caracteres
                      </p>
                    </div>
                  )}

                  {/* Personalization input for name personalization */}
                  {addon.id === "personalization" && isSelected && (
                    <div className="pt-2">
                      <Label htmlFor="name-text" className="text-white text-sm">
                        Nombre a bordar (máx. 20 caracteres)
                      </Label>
                      <Input
                        id="name-text"
                        placeholder="Ej: Samuel, Andrea, etc."
                        value={namePersonalization}
                        onChange={(e) => handleNamePersonalizationChange(e.target.value)}
                        maxLength={20}
                        className="mt-1 bg-gray-900 border-[#C0C0C0]/30 text-white"
                      />
                      <p className="text-xs text-gray-400 mt-1">
                        {namePersonalization.length}/20 caracteres
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })

        }

        {/* Total adicionales */}
        {Object.values(selectedAddons).some(Boolean) && (
          <div className="pt-4 border-t border-[#C0C0C0]/30">
            <div className="flex items-center justify-between">
              <span className="text-white font-medium">Total Adicionales:</span>
              <span className="text-[#ebc005] font-bold text-lg">
                +{formatPrice(
                  addonOptions.reduce((total, addon) => {
                    const key = `add${addon.id.charAt(0).toUpperCase() + addon.id.slice(1)}` as keyof typeof selectedAddons;
                    if (selectedAddons[key]) {
                      return total + addon.price;
                    }
                    return total;
                  }, 0)
                )}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}