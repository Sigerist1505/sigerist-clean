import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { insertRegisteredUserSchema } from "@shared/schema";
import { ArrowLeft, User, Mail, Phone, MapPin, Lock, Eye, EyeOff } from "lucide-react";
import type { InsertRegisteredUser } from "@shared/schema";

export default function RegisterPage() {
  const { toast } = useToast();
  const [isRegistered, setIsRegistered] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { login } = useAuth();

  const form = useForm<InsertRegisteredUser>({
    resolver: zodResolver(insertRegisteredUserSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      address: "",
      phoneNumber: "",
      acceptsMarketing: "false",
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: InsertRegisteredUser) => {
      const response = await fetch("/api/register", {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Error en el registro");
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      // Automatically log in user after successful registration
      login({
        id: data.user.id,
        firstName: data.user.firstName,
        lastName: data.user.lastName,
        email: data.user.email,
      });
      toast({
        title: "¡Registro exitoso!",
        description: `Bienvenido ${data.user.firstName}. Tu cuenta ha sido creada correctamente.`,
      });
      setIsRegistered(true);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error en el registro",
        description: error.message || "No se pudo completar el registro. Intenta nuevamente.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertRegisteredUser) => {
    console.log("Form submitted with data:", data);
    console.log("Form errors:", form.formState.errors);
    registerMutation.mutate(data);
  };

  if (isRegistered) {
    return (
      <div className="min-h-screen pt-16 bg-black">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Card className="bg-black border border-accent/30 shadow-xl">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <User className="h-8 w-8 text-accent" />
              </div>
              <h2 className="text-2xl font-bold text-accent mb-4">
                ¡Registro Completado!
              </h2>
              <p className="text-muted-foreground mb-8">
                Tu cuenta ha sido creada exitosamente. Ahora puedes explorar nuestros productos exclusivos.
              </p>
              <div className="space-y-4">
                <Link href="/">
                  <Button size="lg" className="w-full bg-[#ebc005] hover:bg-[#d4a804] text-[#000000] font-semibold">
                    Explorar Productos
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  onClick={() => setIsRegistered(false)}
                  className="w-full border-[#ebc005] text-[#ffffff] hover:bg-[#ebc005]/10 bg-transparent"
                >
                  Registrar Otro Usuario
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16 bg-black">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-8">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2 text-[#ffffff] hover:text-accent/80 bg-transparent border border-[#ebc005]">
              <ArrowLeft className="h-4 w-4" />
              Volver al inicio
            </Button>
          </Link>
        </div>

        <Card className="bg-black border border-accent/30 shadow-xl">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-3xl font-bold text-accent">
              Crear Cuenta
            </CardTitle>
            <CardDescription className="text-lg text-muted-foreground">
              Regístrate para acceder a productos exclusivos y personalización premium
            </CardDescription>
          </CardHeader>
          
          <CardContent className="p-8">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Name Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-accent font-medium">
                    <User className="h-4 w-4 inline mr-2" />
                    Nombre *
                  </Label>
                  <Input
                    id="firstName"
                    {...form.register("firstName")}
                    placeholder="Tu nombre"
                    className="bg-background border-accent/30 focus:border-accent text-foreground"
                  />
                  {form.formState.errors.firstName && (
                    <p className="text-gray-400 text-sm">{form.formState.errors.firstName.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-accent font-medium">
                    <User className="h-4 w-4 inline mr-2" />
                    Apellido *
                  </Label>
                  <Input
                    id="lastName"
                    {...form.register("lastName")}
                    placeholder="Tu apellido"
                    className="bg-background border-accent/30 focus:border-accent text-foreground"
                  />
                  {form.formState.errors.lastName && (
                    <p className="text-gray-400 text-sm">{form.formState.errors.lastName.message}</p>
                  )}
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-accent font-medium">
                  <Mail className="h-4 w-4 inline mr-2" />
                  Correo Electrónico *
                </Label>
                <Input
                  id="email"
                  type="email"
                  {...form.register("email")}
                  placeholder="tu@email.com"
                  className="bg-background border-accent/30 focus:border-accent text-foreground"
                />
                {form.formState.errors.email && (
                  <p className="text-gray-400 text-sm">{form.formState.errors.email.message}</p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-accent font-medium">
                  <Lock className="h-4 w-4 inline mr-2" />
                  Contraseña *
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    {...form.register("password")}
                    placeholder="Mín. 8 caracteres, incluye mayúscula, número y símbolo"
                    className="bg-background border-accent/30 focus:border-accent text-foreground pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
                {form.formState.errors.password && (
                  <p className="text-gray-400 text-sm">{form.formState.errors.password.message}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-accent font-medium">
                  <Lock className="h-4 w-4 inline mr-2" />
                  Confirmar Contraseña *
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    {...form.register("confirmPassword")}
                    placeholder="Repite tu contraseña"
                    className="bg-background border-accent/30 focus:border-accent text-foreground pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
                {form.formState.errors.confirmPassword && (
                  <p className="text-gray-400 text-sm">{form.formState.errors.confirmPassword.message}</p>
                )}
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phoneNumber" className="text-accent font-medium">
                  <Phone className="h-4 w-4 inline mr-2" />
                  Número de Celular *
                </Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  {...form.register("phoneNumber")}
                  placeholder="+57 300 123 4567"
                  className="bg-background border-accent/30 focus:border-accent text-foreground"
                />
                {form.formState.errors.phoneNumber && (
                  <p className="text-gray-400 text-sm">{form.formState.errors.phoneNumber.message}</p>
                )}
              </div>

              {/* Address */}
              <div className="space-y-2">
                <Label htmlFor="address" className="text-accent font-medium">
                  <MapPin className="h-4 w-4 inline mr-2" />
                  Dirección Completa *
                </Label>
                <Textarea
                  id="address"
                  {...form.register("address")}
                  placeholder="Calle, número, barrio, ciudad, departamento"
                  rows={3}
                  className="bg-background border-accent/30 focus:border-accent text-foreground resize-none"
                />
                {form.formState.errors.address && (
                  <p className="text-gray-400 text-sm">{form.formState.errors.address.message}</p>
                )}
              </div>

              {/* Marketing Consent */}
              <div className="space-y-4 border-t border-accent/20 pt-6">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="acceptsMarketing"
                    checked={form.watch("acceptsMarketing") === "true"}
                    onCheckedChange={(checked) => {
                      form.setValue("acceptsMarketing", checked ? "true" : "false");
                    }}
                    className="border-accent/50 data-[state=checked]:bg-accent data-[state=checked]:border-accent"
                  />
                  <div className="space-y-1">
                    <Label
                      htmlFor="acceptsMarketing"
                      className="text-sm font-medium text-accent cursor-pointer"
                    >
                      Recibir ofertas especiales y novedades por email
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Mantente al día con nuestras colecciones exclusivas, descuentos especiales 
                      y lanzamientos de productos únicos. Puedes cancelar en cualquier momento.
                    </p>
                  </div>
                </div>
              </div>

              {/* Debug: Show form errors */}
              {Object.keys(form.formState.errors).length > 0 && (
                <div className="bg-orange-900/20 border border-orange-500/50 rounded-lg p-4">
                  <h4 className="text-red-400 font-medium mb-2">Errores en el formulario:</h4>
                  <ul className="text-red-300 text-sm space-y-1">
                    {Object.entries(form.formState.errors).map(([field, error]) => (
                      <li key={field}>
                        <strong>{field}:</strong> {error?.message}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                size="lg"
                disabled={registerMutation.isPending}
                className="w-full bg-[#ebc005] hover:bg-[#d4a804] text-[#000000] font-semibold text-lg py-3"
                onClick={() => {
                  console.log("Button clicked!");
                  console.log("Form valid:", form.formState.isValid);
                  console.log("Form errors:", form.formState.errors);
                }}
              >
                {registerMutation.isPending ? "Registrando..." : "Crear Cuenta"}
              </Button>

              {/* Terms */}
              <p className="text-sm text-muted-foreground text-center">
                Al registrarte, aceptas nuestros términos de servicio y política de privacidad.
                Tu información será utilizada únicamente para mejorar tu experiencia de compra.
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}