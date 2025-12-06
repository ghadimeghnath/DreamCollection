"use client"
import Link from 'next/link';
import { useAppSelector } from '@/lib/hooks';
import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';

function Navbar() {
    const { data: session } = useSession();
    const totalQty = useAppSelector((state) => state.cart.totalQuantity);
    const [open, setOpen] = useState(false); 

    return (
        <nav className="flex items-center justify-between px-6 md:px-16 lg:px-24 xl:px-32 py-4 border-b border-gray-300 bg-white relative transition-all z-50">

            <Link href="/">
                <h1 className='font-semibold md:text-xl'>dream collection</h1>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden sm:flex items-center gap-8">
                <Link href="/" className="hover:text-indigo-600 transition">Home</Link>
                <Link href="#" className="hover:text-indigo-600 transition">About</Link>
                <Link href="/contact" className="hover:text-indigo-600 transition">Contact</Link>

                {/* Search Bar */}
                <div className="hidden lg:flex items-center text-sm gap-2 border border-gray-300 px-3 rounded-full">
                    <input className="py-1.5 w-full bg-transparent outline-none placeholder-gray-500" type="text" placeholder="Search products" />
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10.836 10.615 15 14.695" stroke="#7A7B7D" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                        <path clipRule="evenodd" d="M9.141 11.738c2.729-1.136 4.001-4.224 2.841-6.898S7.67.921 4.942 2.057C2.211 3.193.94 6.281 2.1 8.955s4.312 3.92 7.041 2.783" stroke="#7A7B7D" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>

                {/* Cart Icon */}
                <div className="relative cursor-pointer">
                    <Link href={'/cart'}>
                        <div className="relative">
                            <svg width="18" height="18" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M.583.583h2.333l1.564 7.81a1.17 1.17 0 0 0 1.166.94h5.67a1.17 1.17 0 0 0 1.167-.94l.933-4.893H3.5m2.333 8.75a.583.583 0 1 1-1.167 0 .583.583 0 0 1 1.167 0m6.417 0a.583.583 0 1 1-1.167 0 .583.583 0 0 1 1.167 0" stroke="#615fff" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <span className="absolute -top-2 -right-3 text-xs text-white bg-indigo-500 w-[18px] h-[18px] rounded-full flex items-center justify-center">
                                {totalQty}
                            </span>
                        </div>
                    </Link>
                </div>

                {/* Profile Icon (ONLY when logged in) */}
                {session && (
                    <Link href="/profile">
                        <div className="w-10 h-10 rounded-full overflow-hidden cursor-pointer border border-gray-200">
                            {session.user?.image ? (
                                <img src={session.user.image} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                        <circle cx="12" cy="7" r="4"></circle>
                                    </svg>
                                </div>
                            )}
                        </div>
                    </Link>
                )}

                {/* If NOT logged in show Login */}
                {!session && (
                    <Link href="/login">
                        <button className="cursor-pointer px-8 py-2 bg-indigo-500 hover:bg-indigo-600 transition text-white rounded-full">
                            Login
                        </button>
                    </Link>
                )}
            </div>

            {/* Mobile Navbar */}
            <div className=" flex gap-4 justify-center items-center sm:hidden">

                {/* Cart Icon */}
                <Link href={'/cart'} className="relative cursor-pointer">
                    <svg width="18" height="18" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M.583.583h2.333l1.564 7.81a1.17 1.17 0 0 0 1.166.94h5.67a1.17 1.17 0 0 0 1.167-.94l.933-4.893H3.5m2.333 8.75a.583.583 0 1 1-1.167 0 .583.583 0 0 1 1.167 0m6.417 0a.583.583 0 1 1-1.167 0 .583.583 0 0 1 1.167 0" stroke="#615fff" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="absolute -top-2 -right-3 text-xs text-white bg-indigo-500 w-[18px] h-[18px] rounded-full flex items-center justify-center">
                        {totalQty}
                    </span>
                </Link>

                {/* Mobile Profile Icon */}
                {session && (
                    <Link href="/profile">
                        <div className="relative -right-2 w-8 h-8 rounded-full overflow-hidden border border-gray-200 cursor-pointer">
                            {session.user?.image ? (
                                <img src={session.user.image} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                        <circle cx="12" cy="7" r="4"></circle>
                                    </svg>
                                </div>
                            )}
                        </div>
                    </Link>
                )}
                

                {/* Hamburger */}
                <button onClick={() => setOpen(!open)} aria-label="Menu">
                    <svg width="21" height="15" viewBox="0 0 21 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect width="21" height="1.5" rx=".75" fill="#426287" />
                        <rect x="8" y="6" width="13" height="1.5" rx=".75" fill="#426287" />
                        <rect x="6" y="13" width="15" height="1.5" rx=".75" fill="#426287" />
                    </svg>
                </button>
            </div>

            {/* Mobile Menu */}
            <div className={`${open ? 'flex' : 'hidden'} absolute top-[60px] left-0 w-full bg-white shadow-md py-4 flex-col items-start gap-4 px-5 text-sm md:hidden z-40`}>

                <Link href="/" onClick={() => setOpen(false)} className="block py-2 w-full border-b border-gray-100">Home</Link>

                <Link href="/about" onClick={() => setOpen(false)} className="block py-2 w-full border-b border-gray-100">About</Link>

                <Link href="/contact" onClick={() => setOpen(false)} className="block py-2 w-full border-b border-gray-100">Contact</Link>

                {!session && (
                    <Link href="/login" onClick={() => setOpen(false)} className="w-full">
                        <button className="cursor-pointer px-6 py-2 mt-4 bg-indigo-500 hover:bg-indigo-600 transition text-white rounded-full text-sm w-full">
                            Login
                        </button>
                    </Link>
                ) }
            </div>
        </nav>
    )
}

export default Navbar;
