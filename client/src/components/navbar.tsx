import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ShoppingBag, Search, Menu, X, User, LogOut } from "lucide-react";
import { useCart } from "./cart-provider";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [location] = useLocation();
  const { itemCount } = useCart();
  const { user, isAuthenticated, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

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
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="relative">
              {isSearchOpen ? (
                <div className="flex items-center">
                  <Input
                    type="text"
                    placeholder="Buscar productos..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-48 text-black placeholder-gray-500 bg-white border-gray-300"
                    autoFocus
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsSearchOpen(false)}
                    className="ml-2 hover:text-accent transition-colors text-[#ffffff]"
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

            {isAuthenticated ? (
              <div className="flex items-center gap-3">
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
              <>
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
              </>
            )}
            
            <Link href="/cart">
              <Button
                variant="ghost"
                size="sm"
                className="hover:text-accent transition-colors relative text-[#ffffff]"
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

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-400/40 bg-black">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "block px-3 py-2 text-base font-medium text-white hover:text-accent transition-colors rounded-md hover:bg-gray-800",
                    location === item.href && "text-accent bg-gray-800"
                  )}
                  onClick={(e) => handleNavClick(item.href, e)}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
