"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative w-full h-[500px] md:h-[600px] bg-gray-900 overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <img 
          src="https://images.unsplash.com/photo-1594787318286-3d835c1d207f?q=80&w=2070&auto=format&fit=crop" 
          alt="Hot Wheels Collection" 
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative h-full max-w-7xl mx-auto px-6 flex flex-col justify-center text-white">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl space-y-6"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-indigo-600/90 text-sm font-semibold tracking-wide uppercase">
            New 2024 Collection
          </span>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight">
            Collect Your <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
              Dream Ride
            </span>
          </h1>
          <p className="text-lg md:text-xl text-gray-300 max-w-lg">
            Discover rare die-cast models, limited editions, and the classics you loved growing up.
          </p>
          
          <div className="flex flex-wrap gap-4 pt-4">
            <Link href="#featured">
              <button className="px-8 py-4 bg-white text-gray-900 rounded-full font-bold hover:bg-gray-100 transition flex items-center gap-2">
                Shop Now <ArrowRight size={20} />
              </button>
            </Link>
            <Link href="/about">
              <button className="px-8 py-4 bg-transparent border border-white/30 text-white rounded-full font-bold hover:bg-white/10 transition backdrop-blur-sm">
                View Series
              </button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}