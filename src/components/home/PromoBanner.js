"use client";
import { motion } from "framer-motion";

export default function PromoBanner() {
  return (
    <section className="py-10 px-6 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Ad Spot 1: Internal Promo */}
        <motion.div 
          whileHover={{ scale: 1.01 }}
          className="relative h-64 rounded-2xl overflow-hidden bg-gray-900 flex items-center shadow-lg"
        >
          <div className="absolute inset-0 opacity-40 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
          <div className="relative z-10 p-8 md:p-12">
            <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-3 inline-block">
              Limited Time
            </span>
            <h3 className="text-3xl font-bold text-white mb-2">Red Line Club</h3>
            <p className="text-gray-300 mb-6 max-w-xs">Join the exclusive club for premium members and get early access.</p>
            <button className="text-white font-semibold underline decoration-2 underline-offset-4 hover:text-red-400 transition">
              Join Now
            </button>
          </div>
          {/* Decorative Circle */}
          <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-red-600 rounded-full blur-3xl opacity-20" />
        </motion.div>

        {/* Ad Spot 2: External / Partner Ad Placeholder */}
        <div className="relative h-64 rounded-2xl overflow-hidden bg-indigo-50 border-2 border-indigo-100 border-dashed flex flex-col items-center justify-center text-center p-6">
            <div className="space-y-2">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest border border-gray-300 px-2 py-0.5 rounded">Ad / Sponsor</span>
                <h4 className="text-xl font-semibold text-indigo-900">Your Ad Here</h4>
                <p className="text-gray-500 text-sm max-w-xs mx-auto">
                    Place Google AdSense or affiliate banners in this dedicated slot to monetize your traffic.
                </p>
            </div>
        </div>

      </div>
    </section>
  );
}