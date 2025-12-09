"use client";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useAppDispatch } from "@/lib/hooks";
import { addToCart } from "@/features/cart/cartSlice";
import Link from "next/link";

export default function ProductCard({ product }) {
  const dispatch = useAppDispatch();
  const displayImage = product.images?.[0] || "/hotwheel.svg";

  const handleAddToCart = (e) => {
    e.preventDefault(); 
    e.stopPropagation();
    
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

  // Construct dynamic URL: /products/Category/Slug
  // Ensure category is safe for URL (optional safety check)
  const categoryPath = product.category ? encodeURIComponent(product.category) : 'Uncategorized';
  const productUrl = `/products/${categoryPath}/${product.slug}`;

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className='group relative border border-neutral-200 bg-white shadow-sm transition-shadow hover:shadow-md rounded-lg overflow-hidden'
    >
      <Link href={productUrl} className="h-full flex flex-col">
        <div className='aspect-square relative overflow-hidden bg-neutral-100'>
          <img
            src={displayImage}
            alt={product.name}
            className='h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 mix-blend-multiply'
          />
          {!product.inStock && (
            <div className='absolute inset-0 bg-black/50 flex items-center justify-center'>
              <span className='text-white font-bold tracking-widest uppercase text-xs md:text-sm border-2 border-white px-3 py-1'>
                Sold Out
              </span>
            </div>
          )}
        </div>

        <div className='p-3 md:p-4 flex flex-col flex-grow'>
            <div className="mb-2">
                <p className='text-xs text-neutral-500 uppercase tracking-wide truncate'>
                {product.category} • {product.year}
                </p>
                <h3 className='font-medium text-neutral-900 text-sm md:text-base line-clamp-2'>
                {product.name}
                </h3>
                <p className='text-xs text-neutral-500 truncate'>
                {product.description} 
                </p>
            </div>

            <div className='mt-auto'>
                <p className='font-mono text-sm md:text-lg font-semibold text-gray-900'>${product.price}</p>
            </div>
        </div>
      </Link>
    </motion.div>
  );
}