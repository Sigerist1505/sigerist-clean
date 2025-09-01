import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/components/cart-provider";
import { CustomerInfoProvider } from "@/components/customer-info-provider";
import { AuthProvider } from "@/contexts/auth-context";
import { Navbar } from "@/components/navbar";
import Home from "@/pages/home";
import About from "@/pages/about";
import ProductPage from "@/pages/product";
import CartPage from "@/pages/cart";
import CheckoutPage from "@/pages/checkout";
import PaymentSuccessPage from "@/pages/payment-success";
import PaymentErrorPage from "@/pages/payment-error";
import WompiDemoPage from "@/pages/wompi-demo";
import ChatbotTestPage from "@/pages/chatbot-test";
import CustomizePage from "@/pages/customize";
import RegisterPage from "@/pages/register";
import LoginPage from "@/pages/login";
import ForgotPasswordPage from "@/pages/forgot-password";
import NotFound from "@/pages/not-found";
import FAQ from "@/pages/faq";
import ProductsPage from "@/pages/products"; // Asegúrate de crear este archivo
import PersonalizationPage from "@/pages/personalization";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/nosotros" component={About} />
      <Route path="/product/:id" component={ProductPage} />
      <Route path="/products/:id" component={ProductPage} />
      <Route path="/customize/:id" component={CustomizePage} />
      <Route path="/cart" component={CartPage} />
      <Route path="/checkout" component={CheckoutPage} />
      <Route path="/payment-success" component={PaymentSuccessPage} />
      <Route path="/payment-error" component={PaymentErrorPage} />
      <Route path="/wompi-demo" component={WompiDemoPage} />
      <Route path="/register" component={RegisterPage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/forgot-password" component={ForgotPasswordPage} />
      <Route path="/chatbot-test" component={ChatbotTestPage} />
      <Route path="/faq" component={FAQ} />
      <Route path="/productos" component={ProductsPage} /> {/* Nueva ruta */}
      <Route path="/personalizacion" component={PersonalizationPage} /> {/* Nueva ruta */}
      <Route component={NotFound} /> {/* Fallback 404 */}
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <CartProvider>
            <CustomerInfoProvider>
              <div className="min-h-screen bg-background text-foreground">
                <Navbar />
                <Router />
                <Toaster />
              </div>
            </CustomerInfoProvider>
          </CartProvider>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;