import { useQuery } from "@tanstack/react-query";
import type { Product } from "@shared/schema";
import { ProductCard } from "@/components/product-card";

export default function ProductsPage() {
  const { data: products, isLoading, error } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

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
          <h1 className="text-4xl font-bold text-gray-200">Todos los Productos</h1>
          <p className="text-gray-400 mt-2">
            Explora nuestro catálogo completo de bolsos personalizados de lujo
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
        ) : products && products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
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