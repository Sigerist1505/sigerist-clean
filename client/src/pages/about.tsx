import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Award, Users, Clock } from "lucide-react";

export default function About() {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <section className="py-32 bg-gradient-to-br from-black to-gray-900 border-b-4 border-[#C0C0C0]/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-block bg-gradient-to-r from-[#ebc005]/20 to-[#C0C0C0]/20 px-6 py-2 rounded-full mb-6 border border-[#C0C0C0]/30">
              <span className="text-[#ebc005] font-bold text-sm uppercase tracking-widest">🏆 ARTESANOS DESDE 2018</span>
            </div>
            <h1 className="text-6xl font-black text-[#c9a920] mb-8 tracking-wide" style={{textShadow: '0 0 20px rgba(201, 169, 32, 0.6), 0 0 40px rgba(201, 169, 32, 0.3)'}}>
              SIGERIST LUXURY BAGS
            </h1>
            <div className="w-32 h-2 mx-auto mb-8 bg-[#C0C0C0]" style={{boxShadow: '0 0 15px rgba(192, 192, 192, 0.8), 0 0 25px rgba(192, 192, 192, 0.5)'}}></div>
            <p className="text-2xl text-[#C0C0C0] max-w-4xl mx-auto font-medium mb-8">
              Creamos memorias únicas con cada puntada, transformando bolsos en tesoros familiares que perduran generaciones
            </p>
            <p className="text-lg text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Somos una empresa colombiana especializada en bolsos, loncheras, pañaleras y maletas personalizadas de lujo, 
              dedicada a crear piezas únicas que celebran los momentos más especiales de las familias.
            </p>
          </div>
        </div>
      </section>

      {/* ¿Quiénes somos? */}
      <section className="py-20 bg-black border-t-4 border-gray-400/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-block bg-gradient-to-r from-[#ebc005]/20 to-[#C0C0C0]/20 px-4 py-2 rounded-full mb-4 border border-[#C0C0C0]/30">
                <span className="text-[#ebc005] font-bold text-xs uppercase tracking-widest">¿QUIÉNES SOMOS?</span>
              </div>
              <h2 className="text-4xl font-black text-[#c9a920] mb-6 tracking-wide" style={{textShadow: '0 0 20px rgba(201, 169, 32, 0.6), 0 0 40px rgba(201, 169, 32, 0.3)'}}>
                SIGERIST LUXURY BAGS
              </h2>
              <div className="w-24 h-2 mb-6 bg-[#C0C0C0]" style={{boxShadow: '0 0 15px rgba(192, 192, 192, 0.8), 0 0 25px rgba(192, 192, 192, 0.5)'}}></div>
              
              <p className="text-lg text-[#C0C0C0] mb-8 leading-relaxed">
                Sigerist Luxury Bags es una empresa apasionada por el diseño y la creación de bolsos, loncheras, pañaleras y maletas personalizadas, pensadas especialmente para madres con gustos exigentes que buscan lo mejor para ellas y sus pequeños. Nos dedicamos a ofrecer un servicio excepcional, asegurándonos de que cada cliente se sienta plenamente satisfecho al portar un producto único y soñado, diseñado con esmero y dedicación. La calidad superior de nuestros materiales, la elegancia refinada de nuestros diseños y un servicio al cliente impecable son los pilares fundamentales que sustentan nuestra marca, convirtiéndonos en el compañero ideal para las madres que valoran la distinción y la funcionalidad en cada detalle.
              </p>

              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="text-center p-6 bg-gradient-to-br from-[#ebc005]/10 to-[#C0C0C0]/10 rounded-xl border border-[#C0C0C0]/20">
                  <div className="text-3xl font-black text-[#ebc005]" style={{textShadow: '0 0 10px rgba(235, 192, 5, 0.5)'}}>500+</div>
                  <div className="text-sm text-[#C0C0C0] font-semibold">Familias Felices</div>
                </div>
                <div className="text-center p-6 bg-gradient-to-br from-[#ebc005]/10 to-[#C0C0C0]/10 rounded-xl border border-[#C0C0C0]/20">
                  <div className="text-3xl font-black text-[#ebc005]" style={{textShadow: '0 0 10px rgba(235, 192, 5, 0.5)'}}>6</div>
                  <div className="text-sm text-[#C0C0C0] font-semibold">Años de Experiencia</div>
                </div>
              </div>
            </div>

            <div className="relative">
              <img 
                src="/attached_assets/image_1754117910580.png" 
                alt="Sigerist Luxury Bags - Bolsos artesanales" 
                className="rounded-2xl shadow-2xl w-full"
              />
              <div className="absolute -bottom-6 -right-6 bg-gradient-to-r from-[#ebc005] to-[#d4a804] text-[#000000] p-6 rounded-xl shadow-lg border-2 border-[#C0C0C0]/30">
                <div className="text-2xl font-bold">100%</div>
                <div className="text-sm font-semibold">Artesanal</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Nuestros Valores */}
      <section className="py-20 bg-gradient-to-br from-black to-gray-900 border-t-4 border-gray-400/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-[#c9a920] mb-6 tracking-wide" style={{textShadow: '0 0 20px rgba(201, 169, 32, 0.6), 0 0 40px rgba(201, 169, 32, 0.3)'}}>
              NUESTROS VALORES
            </h2>
            <div className="w-32 h-2 mx-auto mb-6 bg-[#C0C0C0]" style={{boxShadow: '0 0 15px rgba(192, 192, 192, 0.8), 0 0 25px rgba(192, 192, 192, 0.5)'}}></div>
            <p className="text-xl text-[#C0C0C0] max-w-3xl mx-auto">
              Los principios que guían cada puntada y cada diseño en Sigerist
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="bg-gradient-to-br from-black to-gray-900 border-2 border-[#C0C0C0]/50 hover:border-[#ebc005] transition-all duration-300 group">
              <CardContent className="p-8 text-center">
                <div className="bg-gradient-to-r from-[#ebc005] to-[#d4a804] text-[#000000] rounded-full p-4 inline-flex mb-6">
                  <Heart className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold text-[#ebc005] mb-4">Pasión</h3>
                <p className="text-[#C0C0C0] leading-relaxed">
                  Cada bolso se crea con amor y dedicación, poniendo el corazón en cada detalle.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-black to-gray-900 border-2 border-[#C0C0C0]/50 hover:border-[#ebc005] transition-all duration-300 group">
              <CardContent className="p-8 text-center">
                <div className="bg-gradient-to-r from-[#ebc005] to-[#d4a804] text-[#000000] rounded-full p-4 inline-flex mb-6">
                  <Award className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold text-[#ebc005] mb-4">Calidad</h3>
                <p className="text-[#C0C0C0] leading-relaxed">
                  Utilizamos solo los mejores materiales y técnicas artesanales tradicionales.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-black to-gray-900 border-2 border-[#C0C0C0]/50 hover:border-[#ebc005] transition-all duration-300 group">
              <CardContent className="p-8 text-center">
                <div className="bg-gradient-to-r from-[#ebc005] to-[#d4a804] text-[#000000] rounded-full p-4 inline-flex mb-6">
                  <Users className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold text-[#ebc005] mb-4">Familia</h3>
                <p className="text-[#C0C0C0] leading-relaxed">
                  Creemos en los vínculos familiares y celebramos cada momento especial juntos.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-black to-gray-900 border-2 border-[#C0C0C0]/50 hover:border-[#ebc005] transition-all duration-300 group">
              <CardContent className="p-8 text-center">
                <div className="bg-gradient-to-r from-[#ebc005] to-[#d4a804] text-[#000000] rounded-full p-4 inline-flex mb-6">
                  <Clock className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold text-[#ebc005] mb-4">Tradición</h3>
                <p className="text-[#C0C0C0] leading-relaxed">
                  Preservamos técnicas artesanales ancestrales con un toque moderno y elegante.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Misión y Visión */}
      <section className="py-20 bg-gradient-to-br from-black to-gray-900 border-t-4 border-gray-400/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16">
            {/* Misión */}
            <div className="text-center lg:text-left">
              <div className="inline-block bg-gradient-to-r from-[#ebc005]/20 to-[#C0C0C0]/20 px-4 py-2 rounded-full mb-6 border border-[#C0C0C0]/30">
                <span className="text-[#ebc005] font-bold text-xs uppercase tracking-widest">NUESTRA MISIÓN</span>
              </div>
              <h2 className="text-4xl font-black text-[#c9a920] mb-6 tracking-wide" style={{textShadow: '0 0 20px rgba(201, 169, 32, 0.6), 0 0 40px rgba(201, 169, 32, 0.3)'}}>
                MISIÓN
              </h2>
              <div className="w-24 h-2 mb-6 bg-[#C0C0C0] mx-auto lg:mx-0" style={{boxShadow: '0 0 15px rgba(192, 192, 192, 0.8), 0 0 25px rgba(192, 192, 192, 0.5)'}}></div>
              <p className="text-lg text-[#C0C0C0] leading-relaxed">
                En Sigerist Luxury Bags, nos comprometemos a diseñar y fabricar bolsos, loncheras, pañaleras y maletas personalizadas con los más altos estándares de calidad, dedicándonos a transformar las necesidades de las madres exigentes en obras de arte funcionales. Buscamos liderar con creatividad en cada diseño y ofrecer una experiencia de personalización inigualable, asegurando que cada cliente reciba un producto que capture su esencia y le brinde una alegría única.
              </p>
            </div>

            {/* Visión */}
            <div className="text-center lg:text-left">
              <div className="inline-block bg-gradient-to-r from-[#ebc005]/20 to-[#C0C0C0]/20 px-4 py-2 rounded-full mb-6 border border-[#C0C0C0]/30">
                <span className="text-[#ebc005] font-bold text-xs uppercase tracking-widest">NUESTRA VISIÓN</span>
              </div>
              <h2 className="text-4xl font-black text-[#c9a920] mb-6 tracking-wide" style={{textShadow: '0 0 20px rgba(201, 169, 32, 0.6), 0 0 40px rgba(201, 169, 32, 0.3)'}}>
                VISIÓN
              </h2>
              <div className="w-24 h-2 mb-6 bg-[#C0C0C0] mx-auto lg:mx-0" style={{boxShadow: '0 0 15px rgba(192, 192, 192, 0.8), 0 0 25px rgba(192, 192, 192, 0.5)'}}></div>
              <p className="text-lg text-[#C0C0C0] leading-relaxed">
                Sigerist Luxury Bags es una empresa apasionada por el diseño y la creación de bolsos, loncheras, pañaleras y maletas personalizadas, pensadas especialmente para madres con gustos exigentes que buscan lo mejor para ellas y sus pequeños. Nos dedicamos a ofrecer un servicio excepcional, asegurándonos de que cada cliente se sienta plenamente satisfecho al portar un producto único y soñado, diseñado con esmero y dedicación. La calidad superior de nuestros materiales, la elegancia refinada de nuestros diseños y un servicio al cliente impecable son los pilares fundamentales que sustentan nuestra marca, convirtiéndonos en el compañero ideal para las madres que valoran la distinción y la funcionalidad en cada detalle.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Nuestro Proceso */}
      <section className="py-20 bg-black border-t-4 border-gray-400/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-[#c9a920] mb-6 tracking-wide" style={{textShadow: '0 0 20px rgba(201, 169, 32, 0.6), 0 0 40px rgba(201, 169, 32, 0.3)'}}>
              NUESTRO PROCESO ARTESANAL
            </h2>
            <div className="w-32 h-2 mx-auto mb-6 bg-[#C0C0C0]" style={{boxShadow: '0 0 15px rgba(192, 192, 192, 0.8), 0 0 25px rgba(192, 192, 192, 0.5)'}}></div>
            <p className="text-xl text-[#C0C0C0] max-w-3xl mx-auto">
              De la idea al tesoro familiar: así creamos cada pieza única
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Diseño Personalizado",
                description: "Trabajamos contigo para crear un diseño único que capture la esencia de tu historia personal.",
                image: "/attached_assets/IMG-20250531-WA0003.jpg"
              },
              {
                step: "02", 
                title: "Bordado Artesanal",
                description: "Nuestros artesanos expertos dan vida al diseño con técnicas tradicionales de bordado de lujo.",
                image: "/attached_assets/IMG-20250531-WA0008.jpg"
              },
              {
                step: "03",
                title: "Acabados de Lujo",
                description: "Cada detalle se perfecciona con materiales premium y controles de calidad rigurosos.",
                image: "/attached_assets/IMG-20250531-WA0015.jpg"
              }
            ].map((process, index) => (
              <Card key={index} className="bg-gradient-to-br from-black to-gray-900 border-2 border-[#C0C0C0]/50 hover:border-[#ebc005] transition-all duration-500 hover:scale-105">
                <CardContent className="p-0">
                  <div className="relative">
                    <img 
                      src={process.image} 
                      alt={process.title}
                      className="w-full h-64 object-cover rounded-t-lg"
                    />
                    <div className="absolute top-4 left-4 bg-gradient-to-r from-[#ebc005] to-[#d4a804] text-[#000000] w-12 h-12 rounded-full flex items-center justify-center font-black text-lg">
                      {process.step}
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-[#ebc005] mb-3">{process.title}</h3>
                    <p className="text-[#C0C0C0] leading-relaxed">{process.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 bg-gradient-to-r from-[#ebc005]/10 to-[#C0C0C0]/10 border-t-4 border-gray-400/40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-black text-[#c9a920] mb-6" style={{textShadow: '0 0 20px rgba(201, 169, 32, 0.6), 0 0 40px rgba(201, 169, 32, 0.3)'}}>
            ¿LISTO PARA CREAR TU HISTORIA?
          </h2>
          <p className="text-xl text-[#C0C0C0] mb-8 max-w-2xl mx-auto">
            Únete a las +500 familias que han confiado en Sigerist para crear sus tesoros más preciados
          </p>
          <Button 
            size="lg"
            className="bg-gradient-to-r from-[#ebc005] to-[#d4a804] text-[#000000] hover:from-[#d4a804] hover:to-[#b8950b] font-bold text-lg px-12 py-4 rounded-xl shadow-[0_8px_25px_rgba(235,192,5,0.4)] border-2 border-[#C0C0C0]/30 uppercase tracking-wider"
            onClick={() => window.location.href = '/'}
          >
            🎁 COMENZAR MI DISEÑO
          </Button>
        </div>
      </section>
    </div>
  );
}