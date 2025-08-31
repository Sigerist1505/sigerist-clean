import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ShoppingBag, Search, Menu, X, User, LogOut } from "lucide-react";
import { useCart } from "./cart-provider";
import { useAuth } from "@/contexts/auth-context";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/utils";



export function Navbar() {
  const [location, setLocation] = useLocation();
  const { itemCount, items } = useCart();
  const { user, isAuthenticated, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCartPreview, setShowCartPreview] = useState(false);

  const handleSearch = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter') return;
    
    const query = searchQuery.trim().toLowerCase();
    if (!query) return;

    // Category mappings for intelligent search
    const categoryMappings: Record<string, string> = {
      // Maletas/Suitcases
      'maleta': 'maleta',
      'maletas': 'maleta', 
      'equipaje': 'maleta',
      'viaje': 'maleta',
      'milan': 'maleta',
      'milano': 'maleta',
      'viajera': 'maleta',
      
      // Pañaleras/Diaper bags
      'pañalera': 'pañalera',
      'pañaleras': 'pañalera',
      'bebe': 'pañalera',
      'bebé': 'pañalera',
      'diaper': 'pañalera',
      'baby': 'pañalera',
      'multifuncional': 'pañalera',
      'grande': 'pañalera',
      'mediana': 'pañalera',
      
      // Cambiadores/Changing pads
      'cambiador': 'cambiador',
      'cambiadores': 'cambiador',
      'changing': 'cambiador',
      'pad': 'cambiador',
      
      // Bolsos/Bags
      'bolso': 'bolso',
      'bolsos': 'bolso',
      'bag': 'bolso',
      'bags': 'bolso',
      'mariposa': 'bolso',
      'butterfly': 'bolso',
      
      // Mochilas/Backpacks
      'mochila': 'mochila',
      'mochilas': 'mochila',
      'backpack': 'mochila',
      'universitaria': 'mochila',
      
      // Loncheras/Lunch boxes
      'lonchera': 'lonchera',
      'loncheras': 'lonchera',
      'lunch': 'lonchera',
      'baul': 'lonchera',
      'porta': 'lonchera',
      'biberones': 'lonchera',
      'portabiberones': 'lonchera',
      'portachupetas': 'lonchera',
      'portachupetes': 'lonchera',
      
      // Organizadores/Organizers
      'organizador': 'organizador',
      'organizadores': 'organizador',
      'organizer': 'organizador',
      'higiene': 'organizador',
      'mudas': 'organizador',
    };

    // Find matching category
    const matchedCategory = Object.entries(categoryMappings).find(([key]) => 
      query.includes(key)
    )?.[1];

    if (matchedCategory) {
      // Redirect to products page with category filter
      setLocation(`/productos?category=${matchedCategory}`);
    } else {
      // General search - redirect to products page
      setLocation(`/productos?search=${encodeURIComponent(query)}`);
    }
    
    setSearchQuery("");
    setIsSearchOpen(false);
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleNavClick = (href: string, e: React.MouseEvent) => {
    if (href.startsWith('/#')) {
      e.preventDefault();
      const sectionId = href.substring(2); // Remove /#
      
      // If we're not on the home page, navigate to home first with the hash
      if (location !== '/') {
        window.location.href = href;
      } else {
        // If we're on home page, scroll directly to section
        scrollToSection(sectionId);
      }
      setIsMobileMenuOpen(false);
    }
  };

  const navItems = [
    { label: "Inicio", href: "/" },
    { label: "Productos", href: "/#productos" },
    { label: "Personalización", href: "/#personalizacion" },
    { label: "Nosotros", href: "/nosotros" },
    { label: "FAQ", href: "/faq" },
  ];

  return (
    <nav className="bg-black text-accent fixed w-full z-50 shadow-lg border-b border-gray-400/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
            <img 
              src="/assets/logo.png" 
              alt="Sigerist Luxury Bags Logo - Bolsos personalizados Colombia Medellín" 
              className="h-12 w-auto object-contain"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "hover:text-accent/80 transition-colors text-sm font-medium text-white tracking-wide",
                    location === item.href && "text-accent"
                  )}
                  onClick={(e) => handleNavClick(item.href, e)}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2 md:space-x-4">
            {/* Search - Hidden on mobile */}
            <div className="relative hidden md:block">
              {isSearchOpen ? (
                <div className="flex items-center">
                  <Input
                    type="text"
                    placeholder="Buscar productos..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleSearch}
                    className="w-48 text-black placeholder-gray-500 bg-white border-gray-300"
                    autoFocus
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSearch}
                    className="ml-1 hover:text-accent transition-colors text-gray-600"
                    title="Buscar"
                  >
                    <Search className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsSearchOpen(false)}
                    className="ml-1 hover:text-accent transition-colors text-[#ffffff]"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsSearchOpen(true)}
                  className="hover:text-accent transition-colors text-[#ffffff]"
                >
                  <Search className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Auth buttons - Hidden on mobile, shown in hamburger menu */}
            {isAuthenticated ? (
              <div className="hidden md:flex items-center gap-3">
                <span className="text-white text-sm">
                  <User className="h-4 w-4 inline mr-1" />
                  Hola, {user?.firstName}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={logout}
                  className="text-red-400 hover:text-red-300 hover:bg-red-900/20 transition-colors"
                >
                  <LogOut className="h-4 w-4 mr-1" />
                  Cerrar Sesión
                </Button>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link href="/login">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-[#ffffff] hover:bg-accent/10 transition-colors bg-transparent border border-[#C0C0C0]"
                  >
                    Iniciar Sesión
                  </Button>
                </Link>
                
                <Link href="/register">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-[#C0C0C0] text-[#ffffff] hover:bg-[#C0C0C0] hover:text-black transition-colors bg-transparent"
                  >
                    Registrarse
                  </Button>
                </Link>
              </div>
            )}
            
            <div className="relative">
              <Link href="/cart">
                <Button
                  variant="ghost"
                  size="sm"
                  className="hover:text-accent transition-colors relative text-[#ffffff]"
                  onMouseEnter={() => setShowCartPreview(true)}
                  onMouseLeave={() => setShowCartPreview(false)}
                >
                  <ShoppingBag className="h-4 w-4" />
                  {itemCount > 0 && (
                    <Badge
                      className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs bg-accent text-accent-foreground"
                    >
                      {itemCount}
                    </Badge>
                  )}
                </Button>
              </Link>

              {/* Cart Preview Tooltip */}
              {showCartPreview && itemCount > 0 && (
                <div 
                  className="absolute right-0 top-full mt-2 w-80 bg-black border border-[#C0C0C0]/30 rounded-lg shadow-xl z-50"
                  onMouseEnter={() => setShowCartPreview(true)}
                  onMouseLeave={() => setShowCartPreview(false)}
                >
                  <div className="p-4">
                    <h3 className="text-sm font-medium text-[#C0C0C0] mb-3">Carrito ({itemCount} productos)</h3>
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {items.slice(0, 3).map((item) => (
                        <div key={item.id} className="flex items-center gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-white truncate">{item.name}</p>
                            <p className="text-xs text-gray-400">
                              Cantidad: {item.quantity} | {formatPrice(item.price || 0)}
                            </p>
                          </div>
                        </div>
                      ))}
                      {items.length > 3 && (
                        <p className="text-xs text-gray-400 text-center">
                          +{items.length - 3} producto{items.length - 3 !== 1 ? 's' : ''} más
                        </p>
                      )}
                    </div>
                    <div className="mt-3 pt-3 border-t border-[#C0C0C0]/20">
                      <Link href="/cart">
                        <Button className="w-full bg-[#ebc005] hover:bg-[#d4a804] text-black text-sm">
                          Ver Carrito
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="hover:text-accent transition-colors text-[#ffffff]"
              >
                {isMobileMenuOpen ? (
                  <X className="h-4 w-4" />
                ) : (
                  <Menu className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu - Shows when hamburger is clicked */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 mobile-menu bg-black border-t border-gray-400/40 shadow-lg z-50">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {/* Navigation items for mobile */}
              <div className="space-y-2 mb-4">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "block px-3 py-2 text-sm font-medium text-white hover:text-accent hover:bg-gray-800 transition-colors rounded-md",
                      location === item.href && "text-accent bg-gray-800"
                    )}
                    onClick={(e) => {
                      handleNavClick(item.href, e);
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>

              {/* User actions for mobile */}
              {isAuthenticated ? (
                <div className="space-y-2 border-t border-gray-400/40 pt-3">
                  <div className="px-3 py-2 text-sm text-accent">
                    <User className="h-4 w-4 inline mr-2" />
                    Hola, {user?.firstName}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      logout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-900/20 transition-colors"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Cerrar Sesión
                  </Button>
                </div>
              ) : (
                <div className="space-y-2 border-t border-gray-400/40 pt-3">
                  <Link href="/login">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-[#ffffff] hover:bg-accent/10 transition-colors bg-transparent border border-[#C0C0C0]"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Iniciar Sesión
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start border-[#C0C0C0] text-[#ffffff] hover:bg-[#C0C0C0] hover:text-black transition-colors bg-transparent"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Registrarse
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
