"use client";
import { useState } from "react";
import { useAppDispatch } from "@/lib/hooks";
import { addToCart } from "@/features/cart/cartSlice";
import Link from "next/link";
import { useRouter } from "next/navigation";

function ProductDetail({ product }) {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const initialImage = product?.images?.[0] || "/hotwheel.svg";
  const [thumbnail, setThumbnail] = useState(initialImage);

  if (!product) {
    return (
      <div className='text-center py-20 text-gray-500'>
        Loading product details...
      </div>
    );
  }

  const handleAddToCart = () => {
    dispatch(
      addToCart({
        id: product._id,
        name: product.name,
        price: product.price,
        image: initialImage,
        quantity: 1,
      })
    );
  };

  const handleBuyNow = () => {
    // 1. Add item to cart
    dispatch(
      addToCart({
        id: product._id,
        name: product.name,
        price: product.price,
        image: initialImage,
        quantity: 1,
      })
    );
    // 2. Redirect to checkout immediately
    router.push('/checkout');
  };

  const descriptionPoints = product.description
    ? product.description.split("\n").filter((line) => line.trim() !== "")
    : ["No description available."];

  // Encode category for the URL link
  const categoryPath = product.category
    ? encodeURIComponent(product.category)
    : "Uncategorized";

  return (
    <>
      <div className='flex w-full max-w-7xl px-8 pt-8 md:px-24 '>
        {/* Dynamic Breadcrumbs */}
        <p className='text-gray-500 text-sm flex gap-1 flex-wrap justify-self-start'>
          <Link href='/' className='hover:text-indigo-500 transition'>
            Home
          </Link>
          <span>/</span>

          <Link
            href={`/products/${categoryPath}`}
            className='hover:text-indigo-500 transition'
          >
            {product.category}
          </Link>
          <span>/</span>
          <span className='text-indigo-500 font-medium truncate max-w-[200px]'>
            {product.name}
          </span>
        </p>
      </div>
      <div className="min-h-[60vh] flex items-center justify-center">


        <div className='max-w-6xl w-full p-8'>
          <div className='flex flex-col md:flex-row gap-12 lg:gap-16'>
            {/* Image Gallery Section */}
            <div className='flex flex-col-reverse md:flex-row gap-4 w-full md:w-1/2'>
              {/* Thumbnails */}
              <div className='flex md:flex-col gap-3 overflow-x-auto md:overflow-visible no-scrollbar'>
                {product.images?.map((image, index) => (
                  <div
                    key={index}
                    onClick={() => setThumbnail(image)}
                    className={`border-2 w-20 h-20 md:w-24 md:h-24 rounded-lg overflow-hidden cursor-pointer flex-shrink-0 transition-all ${thumbnail === image
                        ? "border-indigo-500"
                        : "border-gray-200"
                      }`}
                  >
                    <img
                      src={image}
                      alt={`View ${index + 1}`}
                      className='w-full h-full object-cover hover:scale-110 transition duration-300'
                    />
                  </div>
                ))}
              </div>

              {/* Main Image */}
              <div className='flex-1 border border-gray-200 rounded-xl overflow-hidden bg-gray-50 relative h-[400px] md:h-[500px]'>
                <img
                  src={thumbnail}
                  alt={product.name}
                  className='w-full h-full object-contain mix-blend-multiply p-4'
                />
                {!product.inStock && (
                  <span className='absolute top-4 right-4 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide'>
                    Out of Stock
                  </span>
                )}
              </div>
            </div>

            {/* Details Section */}
            <div className='flex-1'>
              <h1 className='text-2xl md:text-4xl font-bold text-gray-900'>
                {product.name}
              </h1>
              <p className='text-gray-500 mt-2 text-sm'>
                {product.series} • {product.year}
              </p>

              <div className='mt-6 flex items-baseline gap-4'>
                <span className='text-3xl font-bold text-gray-900'>
                  ${product.price}
                </span>
                {product.originalPrice &&
                  product.originalPrice > product.price && (
                    <>
                      <span className='text-lg text-gray-400 line-through'>
                        ${product.originalPrice}
                      </span>
                      <span className='text-sm font-medium text-green-600 bg-green-100 px-2 py-1 rounded'>
                        {Math.round(
                          ((product.originalPrice - product.price) /
                            product.originalPrice) *
                          100
                        )}
                        % OFF
                      </span>
                    </>
                  )}
              </div>
              <p className='text-xs text-gray-500 mt-1'>Inclusive of all taxes</p>

              <div className='mt-8'>
                <h3 className='text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3'>
                  About Product
                </h3>
                <ul className='list-disc pl-5 space-y-2 text-gray-600'>
                  {descriptionPoints.map((desc, index) => (
                    <li key={index}>{desc}</li>
                  ))}
                </ul>
              </div>

              <div className='flex flex-col sm:flex-row items-center mt-10 gap-4'>
                <button
                  onClick={handleAddToCart}
                  disabled={!product.inStock}
                  className='w-full py-2 rounded-full font-medium bg-gray-100 text-gray-900 hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  Add to Cart
                </button>
                <button
                  onClick={handleBuyNow}
                  disabled={!product.inStock}
                  className='w-full py-2 rounded-full font-medium bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg hover:shadow-xl transition disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  Buy Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ProductDetail;