import { Router, Route } from 'wouter'
import { CartProvider } from '@/contexts/cart-context'
import { Toaster } from '@/components/ui/toaster'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import HomePage from '@/pages/home'
import ProductsPage from '@/pages/products'
import { ProductPage } from '@/pages/product'
import CartPage from '@/pages/cart'
import CheckoutPage from '@/pages/checkout'
import ContactPage from '@/pages/contact'
import AboutPage from '@/pages/about'

function App() {
  return (
    <CartProvider>
      <Router>
        <div className="min-h-screen bg-background">
          <Navbar />
          <main>
            <Route path="/" component={HomePage} />
            <Route path="/products" component={ProductsPage} />
            <Route path="/product/:id" component={ProductPage} />
            <Route path="/cart" component={CartPage} />
            <Route path="/checkout" component={CheckoutPage} />
            <Route path="/contact" component={ContactPage} />
            <Route path="/about" component={AboutPage} />
          </main>
          <Footer />
          <Toaster />
        </div>
      </Router>
    </CartProvider>
  )
}

export default App