import ProductCard from "@/features/product/components/ProductCard";
import { getProductsByCategory } from "@/features/product/actions";
import Link from "next/link";

export async function generateMetadata({ params }) {
    const { category } = await params;
    return {
        title: `${decodeURIComponent(category)} | Dream Collection`
    }
}

export default async function CategoryPage({ params }) {
  const { category } = await params;
  const decodedCategory = decodeURIComponent(category);
  const products = await getProductsByCategory(category);

  return (
    <div className="flex flex-col items-center p-8 md:px-24 bg-gray-50/30 min-h-screen">
      <div className="w-full max-w-7xl">
        
        {/* Breadcrumb */}
        <p className="text-sm text-gray-500 mb-8">
            <Link href="/" className="hover:text-indigo-600">Home</Link> / 
            <span className="text-gray-900 ml-1">{decodedCategory}</span>
        </p>

        {products.length > 0 ? (
          <div className='grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6  max-w-7xl mx-auto -z-10'>
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-gray-500">
            No products found in this category.
          </div>
        )}
      </div>
    </div>
  );
}   