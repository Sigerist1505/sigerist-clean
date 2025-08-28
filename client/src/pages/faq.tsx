import { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const faqData: FAQItem[] = [
  {
    category: "Envíos y Entregas",
    question: "¿Cuánto tiempo tardan en entregar mis productos?",
    answer: "Ofrecemos dos opciones: Servicio estándar (15-20 días) y servicio express (5-8 días) con costo adicional de $50.000."
  },
  {
    category: "Envíos y Entregas", 
    question: "¿Cuánto cuesta el envío?",
    answer: "El envío regular cuesta alrededor de $25.000 pesos y se paga contraentrega. El servicio priority tiene un costo adicional de $50.000."
  },
  {
    category: "Envíos y Entregas",
    question: "¿A dónde envían?",
    answer: "Enviamos a toda Colombia desde nuestro punto de fabricación en Medellín. Llevamos tu bolso personalizado hasta tu puerta."
  },
  {
    category: "Pagos",
    question: "¿Cómo puedo pagar mis productos?",
    answer: "Tenemos dos formas de pago: 1) 50% inicial vía transferencia + 50% restante al finalizar más el envío, enviándote avances del proceso. 2) Pago completo con tarjeta de crédito a través de nuestra plataforma."
  },
  {
    category: "Productos y Calidad",
    question: "¿Qué materiales utilizan?",
    answer: "Usamos materiales premium: Cuero PVC que no se pela, rasga ni quema; reata importada resistente y duradera; herrajes de lujo en acero inoxidable que no se oxidan."
  },
  {
    category: "Productos y Calidad",
    question: "¿Tienen garantía los productos?",
    answer: "Sí, todos nuestros bolsos cuentan con 6 meses de garantía. Con buen cuidado, nuestros productos pueden durar más de 5 años debido a su alta calidad y resistencia."
  },
  {
    category: "Productos y Calidad",
    question: "¿Ofrecen descuentos por comprar varios productos?",
    answer: "Sí, tenemos un Kit completo de lujo con 7 piezas (valor $1.595.000) con 10% de descuento especial, quedando en $1.435.500. Además incluye 1 accesorio GRATIS."
  },
  {
    category: "Empresa",
    question: "¿Cuánto tiempo llevan en el mercado?",
    answer: "Sigerist Luxury Bags está en el mercado desde finales de junio de 2024, especializándonos en bolsos de lujo personalizados con bordados artesanales únicos."
  },
  {
    category: "Personalización",
    question: "¿Qué tipos de bordados ofrecen?",
    answer: "Ofrecemos 9 categorías de bordados: Safari (animales), Kawaii (muñequitas), Disney (personajes), Ositos tiernos, Náutico, Nombres personalizados, Animales, Flores y diseños 3D."
  }
];

const categories = Array.from(new Set(faqData.map(item => item.category)));

export default function FAQ() {
  const [openItems, setOpenItems] = useState<number[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("Todos");

  const toggleItem = (index: number) => {
    setOpenItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const filteredFAQ = selectedCategory === "Todos" 
    ? faqData 
    : faqData.filter(item => item.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600">
              Preguntas
            </span>
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-300 via-white to-gray-300">
              Frecuentes
            </span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Encuentra respuestas a las preguntas más comunes sobre nuestros bolsos de lujo personalizados, 
            procesos de elaboración, envíos y garantías.
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          <button
            onClick={() => setSelectedCategory("Todos")}
            className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
              selectedCategory === "Todos"
                ? "bg-gradient-to-r from-yellow-400 to-yellow-500 text-black shadow-lg shadow-yellow-500/25"
                : "bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 border border-gray-600"
            }`}
          >
            Todos
          </button>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                selectedCategory === category
                  ? "bg-gradient-to-r from-yellow-400 to-yellow-500 text-black shadow-lg shadow-yellow-500/25"
                  : "bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 border border-gray-600"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* FAQ Items */}
        <div className="max-w-4xl mx-auto">
          {filteredFAQ.map((item, index) => (
            <div
              key={index}
              className="mb-4 bg-gray-800/30 backdrop-blur-sm border border-gray-700 rounded-2xl overflow-hidden hover:border-gray-600 transition-all duration-300"
            >
              <button
                onClick={() => toggleItem(index)}
                className="w-full px-8 py-6 text-left flex items-center justify-between hover:bg-gray-700/20 transition-colors duration-300"
              >
                <div>
                  <span className="text-yellow-400 text-sm font-medium mb-2 block">
                    {item.category}
                  </span>
                  <h3 className="text-xl font-semibold text-white">
                    {item.question}
                  </h3>
                </div>
                {openItems.includes(index) ? (
                  <ChevronUpIcon className="w-6 h-6 text-yellow-400 flex-shrink-0 ml-4" />
                ) : (
                  <ChevronDownIcon className="w-6 h-6 text-gray-400 flex-shrink-0 ml-4" />
                )}
              </button>
              
              {openItems.includes(index) && (
                <div className="px-8 pb-6">
                  <div className="pt-4 pb-2 border-t border-gray-700">
                    <p className="text-gray-300 leading-relaxed text-lg">
                      {item.answer}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Contact Section */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-3xl p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-white mb-4">
              ¿No encontraste tu respuesta?
            </h3>
            <p className="text-gray-300 mb-6">
              Nuestro equipo está listo para ayudarte con cualquier pregunta adicional
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="https://wa.me/573160183418"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-bold rounded-full hover:from-yellow-500 hover:to-yellow-600 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                📱 WhatsApp
              </a>
              <a
                href="mailto:info@sigeristluxurybags.com"
                className="inline-flex items-center px-8 py-4 bg-gray-700/50 text-white font-bold rounded-full hover:bg-gray-600/50 transition-all duration-300 border border-gray-600"
              >
                ✉️ Email
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
