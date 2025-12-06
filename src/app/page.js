import Navbar from "@/components/layout/Navbar/Navbar";
import Footer from "@/components/layout/Footer";
import AllProducts from "@/features/product/components/AllProducts";
import Link from "next/link";

export default async function Home() {

  return (
    <>
      <header className='text-center'>
        <Navbar />
      </header>
      <main className='flex min-h-screen flex-col items-center p-8 md:px-24 bg-gray-50/30'>
        <div className='w-full max-w-7xl'>
                  {/* Breadcrumb */}
                  <p className="text-sm text-gray-500 mb-8">
                      <Link href="/" className="hover:text-indigo-600">Home</Link> / 
                  </p>
          <AllProducts />
        </div>
      </main>
      <Footer />
    </>
  );
}

// import Hero from "@/components/home/Hero";
// import Categories from "@/components/home/Categories";
// import PromoBanner from "@/components/home/PromoBanner";
// import TrustSignals from "@/components/home/TrustSignals";
// import ProductCard from "@/features/product/components/ProductCard";
// import Footer from "@/components/layout/Footer";
// import { getProducts } from "@/features/product/actions";
// import Link from "next/link";

// export default async function Home() {
//   // Fetch products on the server
//   const products = await getProducts();

//   // Slice top 8 for "Featured"
//   const featuredProducts = products.slice(0, 8);

//   return (
//     <main className="bg-white min-h-screen">
//       <Hero />

//       <Categories />

//       {/* Featured Products Section */}
//       <section id="featured" className="py-10 px-6 max-w-7xl mx-auto">
//         <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
//           <div>
//             <h2 className="text-3xl font-bold text-gray-900">Featured Drops</h2>
//             <p className="text-gray-500 mt-2">Fresh from the factory to your shelf</p>
//           </div>
//           <Link href="/search">
//              <button className="px-6 py-2.5 rounded-full border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition">
//                 View All Products
//              </button>
//           </Link>
//         </div>

//         {products.length > 0 ? (
//           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
//             {featuredProducts.map(product => (
//               <ProductCard key={product._id} product={product} />
//             ))}
//           </div>
//         ) : (
//           <div className="text-center py-20 bg-gray-50 rounded-xl border border-dashed border-gray-200">
//             <p className="text-gray-500">No products found. Check back later!</p>
//           </div>
//         )}
//       </section>

//       {/* Ads / Promo Section */}
//       <PromoBanner />

//       <TrustSignals />

//       <Footer />
//     </main>
//   );
// }
