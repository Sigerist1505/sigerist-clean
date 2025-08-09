import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Settings, 
  MessageCircle, 
  Clock, 
  Users,
  CheckCircle,
  XCircle,
  Bot
} from "lucide-react";

interface ChatbotStatus {
  isActive: boolean;
  isBusinessHours: boolean;
  config: {
    isActive: boolean;
    businessHours: {
      start: string;
      end: string;
    };
    autoTransferKeywords: string[];
  };
}

export function ChatbotAdmin() {
  const [status, setStatus] = useState<ChatbotStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("18:00");
  const { toast } = useToast();

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      const response = await fetch('/api/chatbot/status');
      const data = await response.json();
      setStatus(data);
      setStartTime(data.config.businessHours.start);
      setEndTime(data.config.businessHours.end);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo obtener el estado del chatbot",
        variant: "destructive"
      });
    }
  };

  const toggleChatbot = async () => {
    if (!status) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/chatbot/toggle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ active: !status.isActive }),
      });

      const data = await response.json();
      
      if (data.success) {
        setStatus(prev => prev ? { ...prev, isActive: data.active } : null);
        toast({
          title: data.active ? "Chatbot Activado" : "Chatbot Desactivado",
          description: data.message,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo cambiar el estado del chatbot",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateBusinessHours = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/chatbot/hours', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ start: startTime, end: endTime }),
      });

      const data = await response.json();
      
      if (data.success) {
        await fetchStatus();
        toast({
          title: "Horarios Actualizados",
          description: `Nuevo horario: ${startTime} - ${endTime}`,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron actualizar los horarios",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!status) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Cargando estado del chatbot...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Estado General */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Estado del Chatbot
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-medium">Chatbot Activo</span>
            <div className="flex items-center gap-2">
              <Switch
                checked={status.isActive}
                onCheckedChange={toggleChatbot}
                disabled={isLoading}
              />
              <Badge variant={status.isActive ? "default" : "secondary"}>
                {status.isActive ? "Activado" : "Desactivado"}
              </Badge>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="font-medium">Horario Laboral</span>
            <div className="flex items-center gap-2">
              {status.isBusinessHours ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500" />
              )}
              <Badge variant={status.isBusinessHours ? "default" : "outline"}>
                {status.isBusinessHours ? "En horario" : "Fuera de horario"}
              </Badge>
            </div>
          </div>

          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              <strong>Estado actual:</strong> {status.isActive 
                ? (status.isBusinessHours 
                  ? "El chatbot está respondiendo automáticamente" 
                  : "Enviando mensajes de fuera de horario")
                : "Todas las consultas son derivadas a atención humana"
              }
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Configuración de Horarios */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Horarios de Atención
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Hora de Inicio
              </label>
              <Input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Hora de Fin
              </label>
              <Input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>
          
          <Button 
            onClick={updateBusinessHours}
            disabled={isLoading}
            className="w-full"
          >
            Actualizar Horarios
          </Button>

          <p className="text-sm text-muted-foreground">
            Horario actual: {status.config.businessHours.start} - {status.config.businessHours.end} (Lun - Sáb)
          </p>
        </CardContent>
      </Card>

      {/* Información de Transferencia */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Transferencia a Humano
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <p className="text-sm">
              El chatbot transfiere automáticamente cuando detecta estas palabras:
            </p>
            <div className="flex flex-wrap gap-2">
              {status.config.autoTransferKeywords.map((keyword, index) => (
                <Badge key={index} variant="outline">
                  {keyword}
                </Badge>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Cuando se detectan estas palabras, el cliente es inmediatamente derivado a atención humana.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Instrucciones */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configuración de Twilio
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Webhook URL:</h4>
            <code className="text-sm bg-background p-2 rounded block">
              https://tu-dominio.replit.app/webhook/twilio
            </code>
          </div>
          
          <div className="text-sm space-y-2">
            <p><strong>Para activar en WhatsApp:</strong></p>
            <ol className="list-decimal list-inside space-y-1 ml-4">
              <li>Ve a tu consola de Twilio</li>
              <li>Messaging → Settings → WhatsApp sandbox</li>
              <li>Configura el webhook URL arriba</li>
              <li>Comparte el número de sandbox para pruebas</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}