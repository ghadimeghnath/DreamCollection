"use client"
import { useState } from "react";
import { useAppDispatch } from "@/lib/hooks";
import { addToCart } from "@/features/cart/cartSlice";
import { Button } from "@/components/ui/button";
import Link from "next/link";

function ProductDetail({ product }) {
    const dispatch = useAppDispatch();
    
    // Safety check if images are missing
    const initialImage = product.images && product.images.length > 0 ? product.images[0] : '/hotwheel.svg';
    const [thumbnail, setThumbnail] = useState(initialImage);

    const handleAddToCart = () => {
        dispatch(addToCart({
            id: product._id,
            name: product.name,
            price: product.price,
            image: initialImage,
            quantity: 1,
        }));
    };

    // Convert description string to array for bullet points (split by newline or period)
    const descriptionPoints = product.description 
        ? product.description.split('\n').filter(line => line.trim() !== '') 
        : ["No description available."];

    return (
        <div className="max-w-6xl w-full px-6">
            {/* Breadcrumbs */}
            <p className="text-gray-500 text-sm mb-6">
                <span><Link href={'/'} className="hover:text-indigo-500">Home</Link></span> / 
                <span> <Link href={'/'} className="hover:text-indigo-500">Products</Link></span> /
                <span> {product.series ? product.series : 'Cars'}</span> /
                <span className="text-indigo-500 font-medium"> {product.name}</span>
            </p>

            <div className="flex flex-col md:flex-row  lg:gap-16">
                
                {/* Image Gallery Section */}
                <div className="flex flex-col-reverse md:flex-row gap-4 w-full md:w-1/2">
                    {/* Thumbnails */}
                    <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-visible">
                        {product.images?.map((image, index) => (
                            <div 
                                key={index} 
                                onClick={() => setThumbnail(image)} 
                                className={`border-2 w-20 h-20 md:w-24 md:h-24 rounded-lg overflow-hidden cursor-pointer shrink-0 transition-all ${thumbnail === image ? 'border-indigo-500' : 'border-gray-200'}`} 
                            >
                                <img src={image} alt={`View ${index + 1}`} className="w-full h-full object-cover hover:scale-110 transition duration-300" />
                            </div>
                        ))}
                    </div>

                    {/* Main Image */}
                    <div className="flex-1 border border-gray-200 rounded-xl overflow-hidden bg-gray-50 relative h-[400px] md:h-[500px]">
                         <img src={thumbnail} alt={product.name} className="w-full h-full object-contain mix-blend-multiply p-4" />
                         {!product.inStock && (
                            <span className="absolute top-4 right-4 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                                Out of Stock
                            </span>
                         )}
                    </div>
                </div>

                {/* Details Section */}
                <div className="flex-1">
                    <h1 className="text-2xl md:text-4xl font-bold text-gray-900">{product.name}</h1>
                    <p className="text-gray-500 mt-2">{product.series} • {product.year}</p>

                    {/* Pricing */}
                    <div className="mt-2 flex items-baseline gap-4">
                        <span className="text-2xl font-bold text-gray-900">${product.price}</span>
                        {product.originalPrice && product.originalPrice > product.price && (
                            <>
                                <span className="text-lg text-gray-400 line-through">${product.originalPrice}</span>
                                <span className="text-sm font-medium text-green-600 bg-green-100 px-2 py-1 rounded">
                                    {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                                </span>
                            </>
                        )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Inclusive of all taxes</p>

                    {/* Description */}
                    <div className="mt-2">
                        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">About Product</h3>
                        <ul className="list-disc pl-5 space-y-2 text-gray-600">
                            {descriptionPoints.map((desc, index) => (
                                <li key={index}>{desc}</li>
                            ))}
                        </ul>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col items-center mt-5 gap-4">
                        <Button 
                            onClick={handleAddToCart}
                            disabled={!product.inStock}
                            className="w-full rounded-full font-medium bg-gray-100 text-gray-900 hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Add to Cart
                        </Button>
                        <Button 
                            disabled={!product.inStock}
                            className="w-full py-4 rounded-full font-medium bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg hover:shadow-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Buy Now
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProductDetail;