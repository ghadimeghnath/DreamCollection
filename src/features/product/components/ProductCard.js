"use client";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { useAppDispatch } from "@/lib/hooks";
import { addToCart } from "@/features/cart/cartSlice";
import Link from "next/link";

export default function ProductCard({ product }) {
  const dispatch = useAppDispatch();
  
  // Use the first image from the array, or fallback
  const displayImage = product.images?.[0] || "/hotwheel.svg";

  const handleAddToCart = (e) => {
    e.preventDefault(); // Stop the Link from navigating
    e.stopPropagation(); // Stop event bubbling
    
    dispatch(
      addToCart({
        id: product._id,
        name: product.name,
        price: product.price,
        image: displayImage,  
        quantity: 1,
      })
    );
  };

  const handleBuyNow = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // Add buy now logic here
  };

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className='group relative border border-neutral-200 bg-white shadow-sm transition-shadow hover:shadow-md'
    >
      <Link href={`/products/${product.name}`} className="block h-full">
        {/* Image Container */}
        <div className='aspect-square relative overflow-hidden bg-neutral-100'>
          <img
            src={displayImage}
            alt={product.name}
            className='h-full w-full object-cover transition-transform duration-500 group-hover:scale-105'
          />
          {!product.inStock && (
            <div className='absolute inset-0 bg-black/50 flex items-center justify-center'>
              <span className='text-white font-bold tracking-widest uppercase text-sm border-2 border-white px-3 py-1'>
                Sold Out
              </span>
            </div>
          )}
        </div>

        {/* Details - Minimal Typography */}
        <div className='p-1 md:p-4 space-y-2'>
          <div className='flex flex-col justify-between'>
            <div>
              <p className='text-xs text-neutral-500 uppercase tracking-wide'>
                {product.series} • {product.year}
              </p>
              <h3 className='md:font-semibold text-neutral-900 text-sm truncate'>
                {product.name}
              </h3>
            </div>
            <span className='font-mono text-xs md:text-sm'>${product.price}</span>
          </div>
          <p className="truncate text-xs text-neutral-600">{product.description}</p>
        </div>
      </Link>
    </motion.div>
  );
}