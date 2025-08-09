import { ChatbotTest } from "@/components/chatbot-test";
import { ChatbotAdmin } from "@/components/chatbot-admin";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ChatbotTestPage() {
  return (
    <div className="min-h-screen bg-black pt-20 pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-accent mb-4">
            Gestión del Chatbot Sigerist
          </h1>
          <p className="text-xl text-gray-300">
            Controla y prueba el asistente virtual inteligente
          </p>
        </div>
        
        <Tabs defaultValue="test" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="test">Probar Chatbot</TabsTrigger>
            <TabsTrigger value="admin">Administrar</TabsTrigger>
          </TabsList>
          
          <TabsContent value="test" className="space-y-6">
            <ChatbotTest />
          </TabsContent>
          
          <TabsContent value="admin" className="space-y-6">
            <ChatbotAdmin />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}