import { getProducts } from "@/features/product/actions";
import ProductCard from "@/features/product/components/ProductCard";
import Navbar from "@/components/layout/Navbar/Navbar";
import Footer from "@/components/layout/Footer";
import AllProducts from "@/features/product/components/AllProducts";

export default async function Home() {
  const products = await getProducts();

  return (
    <>
      <header className='text-center'>
        <Navbar />
      </header>
      <main className='min-h-screen bg-neutral-50 p-8 '>
        <AllProducts />
      </main>
      <Footer />
    </>
  );
}
