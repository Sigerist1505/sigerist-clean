import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { ArrowLeft, Mail, Lock, Eye, EyeOff, LogIn } from "lucide-react";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "La contraseña es requerida"),
});

type LoginData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string>("");
  const { login } = useAuth();

  const form = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginData) => {
      console.log("Login attempt with:", data);
      try {
        const response = await fetch("/api/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });
        
        console.log("Login response status:", response.status);
        
        if (!response.ok) {
          const errorData = await response.json();
          console.log("Login error response:", errorData);
          throw new Error(errorData.message || "Error al iniciar sesión");
        }
        
        const result = await response.json();
        console.log("Login success response:", result);
        return result;
      } catch (error) {
        console.error("Login fetch error:", error);
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log("Login mutation success with data:", data);
      setLoginError("");
      login({
        id: data.id,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
      });
      toast({
        title: "Inicio de sesión exitoso",
        description: `Bienvenido de vuelta, ${data.firstName}!`,
        variant: "default",
      });
      // Force a page reload to ensure navbar updates
      window.location.href = "/";
    },
    onError: (error) => {
      console.error("Login mutation error:", error);
      const errorMessage = error.message === "Credenciales incorrectas" 
        ? "Contraseña incorrecta. Por favor, inténtalo de nuevo."
        : error.message || "Error al iniciar sesión";
      
      setLoginError(errorMessage);
      
      toast({
        title: "Error al iniciar sesión",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: LoginData) => {
    loginMutation.mutate(data);
  };

  return (
    <div className="min-h-screen pt-16 bg-black">
      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-8">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2 text-[#ffffff] hover:text-accent/80 bg-transparent border border-[#ebc005]">
              <ArrowLeft className="h-4 w-4" />
              Volver al inicio
            </Button>
          </Link>
        </div>

        <Card className="bg-black border border-[#C0C0C0]/30 shadow-xl">
          <CardHeader className="text-center pb-4">
            <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <LogIn className="h-8 w-8 text-accent" />
            </div>
            <CardTitle className="text-2xl font-bold text-accent">
              Iniciar Sesión
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Accede a tu cuenta de Sigerist Luxury Bags
            </CardDescription>
          </CardHeader>
          
          <CardContent className="p-6">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="block text-sm font-medium text-gray-300">
                  <Mail className="h-4 w-4 inline mr-2" />
                  Correo Electrónico
                </Label>
                <Input
                  id="email"
                  type="email"
                  {...form.register("email")}
                  placeholder="tu@email.com"
                  className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-400 focus:border-accent focus:ring-accent"
                />
                {form.formState.errors.email && (
                  <p className="text-gray-400 text-sm">{form.formState.errors.email.message}</p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password" className="block text-sm font-medium text-gray-300">
                  <Lock className="h-4 w-4 inline mr-2" />
                  Contraseña
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    {...form.register("password")}
                    placeholder="Tu contraseña"
                    className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-400 focus:border-accent focus:ring-accent pr-10"
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

              {/* Login Error Alert */}
              {loginError && (
                <div className="bg-gray-900/20 border border-gray-500/50 rounded-lg p-4 mb-4">
                  <div className="flex items-center">
                    <div className="text-gray-400 text-sm font-medium">
                      {loginError}
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loginMutation.isPending}
                className="w-full bg-[#ebc005] hover:bg-[#d4a804] text-[#000000] font-semibold py-3"
              >
                {loginMutation.isPending ? (
                  "Iniciando sesión..."
                ) : (
                  "Iniciar Sesión"
                )}
              </Button>
            </form>

            {/* Register Link */}
            <div className="mt-6 text-center">
              <p className="text-muted-foreground text-sm">
                ¿No tienes una cuenta?{" "}
                <Link href="/register">
                  <span className="text-accent hover:text-accent/80 font-medium cursor-pointer">
                    Regístrate aquí
                  </span>
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}