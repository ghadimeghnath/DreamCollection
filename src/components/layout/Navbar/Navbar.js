"use client"
import Link from 'next/link';
import { useAppSelector } from '@/lib/hooks';
import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { Menu, X } from 'lucide-react'; // Using lucide for cleaner icons

function Navbar() {
    const { data: session } = useSession();
    // Connect to the unified cart slice
    const totalQty = useAppSelector((state) => state.cart.totalQuantity);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); 

    return (
        <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-gray-200">
            <div className="flex items-center justify-between px-6 md:px-16 lg:px-24 xl:px-32 py-4">
                
                {/* Logo */}
                <Link href="/" className="z-50">
                    <h1 className='font-bold text-xl md:text-2xl text-indigo-900'>dream collection</h1>
                </Link>

                {/* Desktop Menu */}
                <div className="hidden sm:flex items-center gap-8 font-medium text-sm text-gray-600">
                    <Link href="/" className="hover:text-indigo-600 transition">Home</Link>
                    <Link href="/shop" className="hover:text-indigo-600 transition">Shop</Link>
                    <Link href="/contact" className="hover:text-indigo-600 transition">Contact</Link>

                    {/* Search Bar */}
                    <div className="hidden lg:flex items-center gap-2 border border-gray-300 px-4 py-1.5 rounded-full bg-gray-50 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-100 transition">
                        <input className="w-full bg-transparent outline-none placeholder-gray-400 text-sm" type="text" placeholder="Search products..." />
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M10.836 10.615 15 14.695" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            <path clipRule="evenodd" d="M9.141 11.738c2.729-1.136 4.001-4.224 2.841-6.898S7.67.921 4.942 2.057C2.211 3.193.94 6.281 2.1 8.955s4.312 3.92 7.041 2.783" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>

                    {/* Cart Icon */}
                    <Link href={'/cart'} className="relative group">
                        <div className="p-2 hover:bg-gray-100 rounded-full transition">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="9" cy="21" r="1"></circle>
                                <circle cx="20" cy="21" r="1"></circle>
                                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                            </svg>
                        </div>
                        {totalQty > 0 && (
                            <span className="absolute top-0 right-0 bg-indigo-600 text-white text-[10px] font-bold h-5 w-5 flex items-center justify-center rounded-full border-2 border-white transform translate-x-1 -translate-y-1">
                                {totalQty > 99 ? '99+' : totalQty}
                            </span>
                        )}
                    </Link>

                    {/* Profile / Login */}
                    {session ? (
                        <Link href="/profile">
                            <div className="w-9 h-9 rounded-full overflow-hidden border border-gray-200 hover:border-indigo-400 transition">
                                {session.user?.image ? (
                                    <img src={session.user.image} className="w-full h-full object-cover" alt="Profile" />
                                ) : (
                                    <div className="w-full h-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                                        {session.user?.name?.[0] || 'U'}
                                    </div>
                                )}
                            </div>
                        </Link>
                    ) : (
                        <Link href="/login">
                            <button className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 transition text-white rounded-full font-semibold shadow-sm text-sm">
                                Login
                            </button>
                        </Link>
                    )}
                </div>

                {/* Mobile Menu Toggle */}
                <div className="flex items-center gap-4 sm:hidden">
                    <Link href={'/cart'} className="relative">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="9" cy="21" r="1"></circle>
                            <circle cx="20" cy="21" r="1"></circle>
                            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                        </svg>
                        {totalQty > 0 && (
                            <span className="absolute -top-2 -right-2 bg-indigo-600 text-white text-[10px] font-bold h-5 w-5 flex items-center justify-center rounded-full border-2 border-white">
                                {totalQty}
                            </span>
                        )}
                    </Link>
                    <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-gray-600">
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Dropdown */}
            {isMobileMenuOpen && (
                <div className="sm:hidden absolute top-16 left-0 w-full bg-white border-b border-gray-200 shadow-xl py-4 px-6 flex flex-col gap-4 z-40">
                    <Link href="/" className="text-gray-700 font-medium py-2 border-b border-gray-50" onClick={() => setIsMobileMenuOpen(false)}>Home</Link>
                    <Link href="/shop" className="text-gray-700 font-medium py-2 border-b border-gray-50" onClick={() => setIsMobileMenuOpen(false)}>Shop</Link>
                    <Link href="/contact" className="text-gray-700 font-medium py-2 border-b border-gray-50" onClick={() => setIsMobileMenuOpen(false)}>Contact</Link>
                    
                    {session ? (
                        <Link href="/profile" className="flex items-center gap-3 py-2 text-indigo-600 font-medium" onClick={() => setIsMobileMenuOpen(false)}>
                            <span>My Profile</span>
                        </Link>
                    ) : (
                        <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                            <button className="w-full py-3 bg-indigo-600 text-white rounded-lg font-medium">Login</button>
                        </Link>
                    )}
                </div>
            )}
        </nav>
    );
}

export default Navbar;