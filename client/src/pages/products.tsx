import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import type { Product } from "@shared/schema";
import { ProductCard } from "@/components/product-card";

export default function ProductsPage() {
  const [location] = useLocation();
  const searchParams = new URLSearchParams(location.split('?')[1] || '');
  const categoryFilter = searchParams.get('category');
  const searchFilter = searchParams.get('search');

  const { data: products, isLoading, error } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  // Filter products based on search parameters
  const filteredProducts = products?.filter(product => {
    if (categoryFilter) {
      // Category-based filtering - match against product name and category
      const nameLower = product.name.toLowerCase();
      const categoryLower = product.category?.toLowerCase() || '';
      
      switch(categoryFilter) {
        case 'maleta':
          return nameLower.includes('maleta') || nameLower.includes('milan') || categoryLower.includes('maleta');
        case 'pañalera':
          return nameLower.includes('pañalera') || nameLower.includes('multifuncional') || categoryLower.includes('pañalera');
        case 'cambiador':
          return nameLower.includes('cambiador') || categoryLower.includes('cambiador');
        case 'bolso':
          return nameLower.includes('bolso') || nameLower.includes('mariposa') || categoryLower.includes('bolso');
        case 'mochila':
          return nameLower.includes('mochila') || categoryLower.includes('mochila');
        case 'lonchera':
          return nameLower.includes('lonchera') || nameLower.includes('porta') || nameLower.includes('baul') || categoryLower.includes('lonchera');
        case 'organizador':
          return nameLower.includes('organizador') || categoryLower.includes('organizador');
        default:
          return true;
      }
    }
    
    if (searchFilter) {
      // General search - search in name, category, and description
      const searchLower = searchFilter.toLowerCase();
      const nameLower = product.name.toLowerCase();
      const categoryLower = product.category?.toLowerCase() || '';
      const descriptionLower = product.description?.toLowerCase() || '';
      
      return nameLower.includes(searchLower) || 
             categoryLower.includes(searchLower) || 
             descriptionLower.includes(searchLower);
    }
    
    return true;
  }) || [];

  const getPageTitle = () => {
    if (categoryFilter) {
      const categoryNames: Record<string, string> = {
        'maleta': 'Maletas',
        'pañalera': 'Pañaleras',
        'cambiador': 'Cambiadores',
        'bolso': 'Bolsos',
        'mochila': 'Mochilas',
        'lonchera': 'Loncheras',
        'organizador': 'Organizadores'
      };
      return categoryNames[categoryFilter] || 'Productos';
    }
    if (searchFilter) {
      return `Resultados para "${searchFilter}"`;
    }
    return 'Todos los Productos';
  };

  if (error) {
    return (
      <div className="min-h-screen pt-24 text-center text-red-400 bg-gray-900">
        Error cargando productos
      </div>
    );
  }

  return (
    <section className="pt-24 pb-20 bg-gradient-to-br from-black via-gray-900 to-black">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-200">{getPageTitle()}</h1>
          <p className="text-gray-400 mt-2">
            {categoryFilter || searchFilter 
              ? `${filteredProducts.length} producto${filteredProducts.length !== 1 ? 's' : ''} encontrado${filteredProducts.length !== 1 ? 's' : ''}`
              : 'Explora nuestro catálogo completo de bolsos personalizados de lujo'
            }
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse bg-gray-800 rounded-2xl p-6">
                <div className="bg-gray-700 h-64 rounded-xl mb-4"></div>
                <div className="bg-gray-700 h-4 rounded mb-2"></div>
                <div className="bg-gray-700 h-4 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : filteredProducts && filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : products && products.length > 0 ? (
          <div className="text-center py-16">
            <div className="bg-gray-800/50 rounded-2xl p-8 max-w-md mx-auto border border-gray-600">
              <h3 className="text-2xl font-bold text-gray-300 mb-4">
                No se encontraron productos
              </h3>
              <p className="text-gray-400">
                {categoryFilter 
                  ? `No hay productos en la categoría "${getPageTitle()}"`
                  : `No se encontraron productos para "${searchFilter}"`
                }
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="bg-gray-800/50 rounded-2xl p-8 max-w-md mx-auto border border-gray-600">
              <h3 className="text-2xl font-bold text-gray-300 mb-4">
                Catálogo en Carga
              </h3>
              <p className="text-gray-400">Pronto verás nuestros productos.</p>
              <div className="animate-spin w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full mx-auto mt-4" />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}