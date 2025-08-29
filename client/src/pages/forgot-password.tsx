import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Mail, Lock, Shield } from "lucide-react";
import { z } from "zod";

const forgotPasswordSchema = z.object({
  email: z.string().email("Email inválido"),
});

const resetPasswordSchema = z.object({
  code: z.string().length(6, "El código debe tener 6 dígitos"),
  newPassword: z
    .string()
    .min(8, "Mínimo 8 caracteres")
    .regex(/[A-Z]/, "Incluye al menos una mayúscula")
    .regex(/[0-9]/, "Incluye al menos un número")
    .regex(/[^A-Za-z0-9]/, "Incluye al menos un símbolo"),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  path: ["confirmPassword"],
  message: "Las contraseñas no coinciden",
});

type ForgotPasswordData = z.infer<typeof forgotPasswordSchema>;
type ResetPasswordData = z.infer<typeof resetPasswordSchema>;

export default function ForgotPasswordPage() {
  const { toast } = useToast();
  const [step, setStep] = useState<"email" | "code" | "success">("email");
  const [userEmail, setUserEmail] = useState("");

  const forgotPasswordForm = useForm<ForgotPasswordData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const resetPasswordForm = useForm<ResetPasswordData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      code: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const forgotPasswordMutation = useMutation({
    mutationFn: async (data: ForgotPasswordData) => {
      const response = await fetch("/api/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || "Error al enviar código");
      }

      return response.json();
    },
    onSuccess: (data) => {
      setUserEmail(forgotPasswordForm.getValues("email"));
      setStep("code");
      toast({
        title: "Código enviado",
        description: data.message,
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Error al enviar el código",
        variant: "destructive",
      });
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async (data: ResetPasswordData) => {
      const response = await fetch("/api/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: userEmail,
          code: data.code,
          newPassword: data.newPassword,
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || "Error al restablecer contraseña");
      }

      return response.json();
    },
    onSuccess: (data) => {
      setStep("success");
      toast({
        title: "¡Contraseña actualizada!",
        description: data.message,
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Error al restablecer la contraseña",
        variant: "destructive",
      });
    },
  });

  const onSubmitEmail = (data: ForgotPasswordData) => {
    forgotPasswordMutation.mutate(data);
  };

  const onSubmitReset = (data: ResetPasswordData) => {
    resetPasswordMutation.mutate(data);
  };

  return (
    <div className="min-h-screen pt-16 bg-black">
      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-8">
          <Link href="/login">
            <Button variant="ghost" size="sm" className="gap-2 text-[#ffffff] hover:text-accent/80 bg-transparent border border-[#ebc005]">
              <ArrowLeft className="h-4 w-4" />
              Volver al login
            </Button>
          </Link>
        </div>

        <Card className="bg-black border border-[#C0C0C0]/30 shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-accent">
              {step === "email" && "Recuperar Contraseña"}
              {step === "code" && "Ingresa el Código"}
              {step === "success" && "¡Listo!"}
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              {step === "email" && "Te enviaremos un código de 6 dígitos a tu email"}
              {step === "code" && "Revisa tu email e ingresa el código recibido"}
              {step === "success" && "Tu contraseña ha sido actualizada exitosamente"}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {step === "email" && (
              <form onSubmit={forgotPasswordForm.handleSubmit(onSubmitEmail)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="block text-sm font-medium text-gray-300">
                    <Mail className="h-4 w-4 inline mr-2" />
                    Correo Electrónico
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    {...forgotPasswordForm.register("email")}
                    placeholder="tu@email.com"
                    className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-400 focus:border-accent focus:ring-accent"
                  />
                  {forgotPasswordForm.formState.errors.email && (
                    <p className="text-gray-400 text-sm">
                      {forgotPasswordForm.formState.errors.email.message}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={forgotPasswordMutation.isPending}
                  className="w-full bg-[#ebc005] hover:bg-[#d4a804] text-[#000000] font-semibold"
                >
                  {forgotPasswordMutation.isPending ? "Enviando..." : "Enviar Código"}
                </Button>
              </form>
            )}

            {step === "code" && (
              <form onSubmit={resetPasswordForm.handleSubmit(onSubmitReset)} className="space-y-4">
                <div className="bg-blue-900/20 border border-blue-500/50 rounded-lg p-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-blue-400" />
                    <div className="text-blue-300 text-sm">
                      Código enviado a: <strong>{userEmail}</strong>
                    </div>
                  </div>
                  <p className="text-blue-300 text-xs mt-1">
                    El código expira en 15 minutos
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="code" className="block text-sm font-medium text-gray-300">
                    <Shield className="h-4 w-4 inline mr-2" />
                    Código de 6 dígitos
                  </Label>
                  <Input
                    id="code"
                    type="text"
                    maxLength={6}
                    {...resetPasswordForm.register("code")}
                    placeholder="123456"
                    className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-400 focus:border-accent focus:ring-accent text-center text-lg tracking-widest"
                  />
                  {resetPasswordForm.formState.errors.code && (
                    <p className="text-gray-400 text-sm">
                      {resetPasswordForm.formState.errors.code.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword" className="block text-sm font-medium text-gray-300">
                    <Lock className="h-4 w-4 inline mr-2" />
                    Nueva Contraseña
                  </Label>
                  <Input
                    id="newPassword"
                    type="password"
                    {...resetPasswordForm.register("newPassword")}
                    placeholder="Tu nueva contraseña"
                    className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-400 focus:border-accent focus:ring-accent"
                  />
                  {resetPasswordForm.formState.errors.newPassword && (
                    <p className="text-gray-400 text-sm">
                      {resetPasswordForm.formState.errors.newPassword.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300">
                    <Lock className="h-4 w-4 inline mr-2" />
                    Confirmar Nueva Contraseña
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    {...resetPasswordForm.register("confirmPassword")}
                    placeholder="Confirma tu nueva contraseña"
                    className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-400 focus:border-accent focus:ring-accent"
                  />
                  {resetPasswordForm.formState.errors.confirmPassword && (
                    <p className="text-gray-400 text-sm">
                      {resetPasswordForm.formState.errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep("email")}
                    className="flex-1"
                  >
                    Volver
                  </Button>
                  <Button
                    type="submit"
                    disabled={resetPasswordMutation.isPending}
                    className="flex-1 bg-[#ebc005] hover:bg-[#d4a804] text-[#000000] font-semibold"
                  >
                    {resetPasswordMutation.isPending ? "Actualizando..." : "Actualizar Contraseña"}
                  </Button>
                </div>
              </form>
            )}

            {step === "success" && (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                  <Shield className="h-8 w-8 text-green-400" />
                </div>
                <p className="text-muted-foreground">
                  Ya puedes iniciar sesión con tu nueva contraseña.
                </p>
                <Link href="/login">
                  <Button className="w-full bg-[#ebc005] hover:bg-[#d4a804] text-[#000000] font-semibold">
                    Ir al Login
                  </Button>
                </Link>
              </div>
            )}

            {step !== "success" && (
              <div className="text-center">
                <p className="text-muted-foreground text-sm">
                  ¿Recordaste tu contraseña?{" "}
                  <Link href="/login">
                    <span className="text-accent hover:text-accent/80 font-medium cursor-pointer">
                      Iniciar sesión
                    </span>
                  </Link>
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}