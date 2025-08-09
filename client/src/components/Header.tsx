import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { ShoppingBag, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useCart } from '@/hooks/use-cart';
import { Cart } from './Cart';
import { scrollToSection } from '@/lib/utils';

export function Header() {
  const [location] = useLocation();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { cartCount } = useCart();

  const navigationItems = [
    { href: '/', label: 'Inicio', section: 'home' },
    { href: '#products', label: 'Productos', section: 'products' },
    { href: '#personalization', label: 'Personalización', section: 'personalization' },
    { href: '#about', label: 'Nosotros', section: 'about' },
    { href: '#contact', label: 'Contacto', section: 'contact' },
  ];

  const handleNavClick = (item: typeof navigationItems[0]) => {
    if (item.href === '/') {
      window.location.href = '/';
    } else {
      scrollToSection(item.section);
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="bg-white shadow-sm fixed w-full top-0 z-50 border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/">
            <div className="flex items-center cursor-pointer">
              <div className="bg-sigerist-charcoal rounded-full w-10 h-10 flex items-center justify-center">
                <span className="text-sigerist-gold font-bold text-sm">S</span>
              </div>
              <div className="ml-3">
                <h1 className="font-bold text-sigerist-charcoal text-xl">Sigerist</h1>
                <p className="text-xs text-gray-500">Medellín, Colombia</p>
              </div>
            </div>
          </Link>
          
          <div className="hidden md:flex items-center space-x-8">
            {navigationItems.map((item) => (
              <button
                key={item.section}
                onClick={() => handleNavClick(item)}
                className="text-sigerist-charcoal hover:text-sigerist-gold transition-colors font-medium"
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={() => setIsCartOpen(true)}
            >
              <ShoppingBag className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-sigerist-gold text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Button>

            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px]">
                <div className="flex flex-col space-y-4 mt-8">
                  {navigationItems.map((item) => (
                    <button
                      key={item.section}
                      onClick={() => handleNavClick(item)}
                      className="text-left text-sigerist-charcoal hover:text-sigerist-gold transition-colors font-medium py-2"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      <Cart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </nav>
  );
}
