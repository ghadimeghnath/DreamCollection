// src/app/page.js
import Navbar from "@/components/layout/Navbar/Navbar";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/features/product/components/ProductCard";
import { getProducts } from "@/features/product/actions"; // Direct DB call
import Link from "next/link";

export default async function Home() {
  // OPTIMIZATION: Fetch on server (Parallel fetch if you add more calls)
  const { products } = await getProducts(); 

  return (
    <>
      <header className='text-center'>
        <Navbar />
      </header>
      <main className='flex min-h-screen flex-col items-center p-8 md:px-24 bg-gray-50/30'>
        <div className='w-full max-w-7xl'>
          <p className="text-sm text-gray-500 mb-8">
             <Link href="/" className="hover:text-indigo-600">Home</Link> / 
          </p>
          
          {/* Render List Directly - No Loading State Needed */}
          <div className='grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-7xl mx-auto -z-10'>
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}