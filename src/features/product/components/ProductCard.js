"use client";
import { motion } from "framer-motion";
import { useAppDispatch } from "@/lib/hooks";
import { addToCart } from "@/features/cart/cartSlice";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useToast } from "@/context/ToastContext";
import Image from "next/image";

export default function ProductCard({ product }) {
  const dispatch = useAppDispatch();
  const { addToast } = useToast();
  const displayImage = product.images?.[0] || "/hotwheel.svg";

  const handleAddToCart = (e) => {
    e.preventDefault(); 
    e.stopPropagation();
    
    // Strict UI Check
    if (product.stock <= 0) {
        addToast("This item is out of stock", "error");
        return;
    }

    dispatch(
      addToCart({
        _id: product._id, // Ensure consistent ID usage
        name: product.name,
        price: product.price,
        image: displayImage,
        slug: product.slug,
        series: product.series,
        year: product.year,
        stock: product.stock, // CRITICAL: Pass stock for Redux validation
        quantity: 1,
      })
    );
    addToast("Added to cart", "success");
  };

  // Safe URL construction
  const categoryPath = product.category ? encodeURIComponent(product.category) : 'Uncategorized';
  const productUrl = `/products/${categoryPath}/${product.slug}`;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className='group relative border border-gray-200 bg-white shadow-sm transition-all hover:shadow-lg rounded-xl overflow-hidden h-full flex flex-col'
    >
      <Link href={productUrl} className="flex-1 flex flex-col">
        <div className='aspect-square relative overflow-hidden bg-gray-50'>
          <Image
    src={displayImage}
    alt={product.name}
    fill // Automatically fills parent container
    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
    className='object-cover transition-transform duration-500 group-hover:scale-105 mix-blend-multiply p-4'
    priority={false} // Lazy load by default
  />
          {product.stock <= 0 && (
            <div className='absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[1px]'>
              <span className='text-white font-bold tracking-widest uppercase text-xs border border-white/80 px-3 py-1.5 bg-black/50 rounded'>
                Sold Out
              </span>
            </div>
          )}
        </div>

        <div className='p-4 flex flex-col flex-grow'>
            <div className="mb-3">
                <p className='text-[10px] text-gray-500 uppercase tracking-wider font-semibold mb-1'>
                    {product.series} • {product.year}
                </p>
                <h3 className='font-semibold text-gray-900 text-sm md:text-base line-clamp-2 leading-tight group-hover:text-indigo-600 transition-colors'>
                    {product.name}
                </h3>
            </div>

            <div className='mt-auto flex items-end justify-between'>
                <div className="flex flex-col">
                    <p className='font-bold text-lg text-gray-900'>${product.price}</p>
                    {product.originalPrice > product.price && (
                        <p className="text-xs text-gray-400 line-through">${product.originalPrice}</p>
                    )}
                </div>
                
                <button 
                    onClick={handleAddToCart}
                    disabled={product.stock <= 0}
                    className="h-9 w-9 flex items-center justify-center bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed shadow-sm active:scale-95"
                    title={product.stock > 0 ? "Add to Cart" : "Out of Stock"}
                >
                    <ShoppingCart size={16} />
                </button>
            </div>
        </div>
      </Link>
    </motion.div>
  );
}