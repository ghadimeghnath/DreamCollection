"use client";
import Link from "next/link";
import { motion } from "framer-motion";

const categories = [
  { name: "Muscle", image: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=800", count: "12 Items" },
  { name: "JDM Legends", image: "https://images.unsplash.com/photo-1626668893632-6f3a4466d22f?auto=format&fit=crop&q=80&w=800", count: "8 Items" },
  { name: "Exotics", image: "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?auto=format&fit=crop&q=80&w=800", count: "15 Items" },
  { name: "Off-Road", image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=800", count: "6 Items" },
];

export default function Categories() {
  return (
    <section className="py-20 px-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-end mb-10">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Shop by Category</h2>
          <p className="text-gray-500 mt-2">Find the perfect addition to your garage</p>
        </div>
        <Link href="/search" className="text-indigo-600 font-medium hover:underline hidden md:block">
          View All Categories
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {categories.map((cat, idx) => (
          <motion.div
            key={idx}
            whileHover={{ y: -5 }}
            className="group relative h-64 rounded-2xl overflow-hidden cursor-pointer shadow-md"
          >
            <Link href={`/search?category=${cat.name}`}>
              <img 
                src={cat.image} 
                alt={cat.name} 
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 p-6">
                <h3 className="text-xl font-bold text-white">{cat.name}</h3>
                <p className="text-gray-300 text-sm group-hover:text-white transition-colors">{cat.count}</p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}