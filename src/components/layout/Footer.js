import React from 'react'

function Footer() {
      return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap');
            
                * {
                    font-family: 'Poppins', sans-serif;
                }
            `}</style>
            
            <footer className="flex flex-col md:flex-row gap-3 items-center justify-around w-full py-4 text-sm bg-slate-800 text-white/70">
                <p className='text-xs md:text-sm'>Copyright © 2025 dreamcollection. All rights reservered.</p>
                <div className="flex items-center gap-4">
                    <a href="/contact" className="hover:text-white transition-all">
                        Contact Us
                    </a>
                    <div className="h-8 w-px bg-white/20"></div>
                    <a href="#" className="hover:text-white transition-all">
                        Privacy Policy
                    </a>
                    <div className="h-8 w-px bg-white/20"></div>
                    <div className="flex items-center justify-center gap-2 ">
                    <a href="#" className="hover:-translate-y-0.5 transition-all duration-300">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" stroke="#fff" strokeOpacity=".5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </a>
                    <a href="#" className="hover:-translate-y-0.5 transition-all duration-300">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M17 2H7a5 5 0 0 0-5 5v10a5 5 0 0 0 5 5h10a5 5 0 0 0 5-5V7a5 5 0 0 0-5-5" stroke="#fff" strokeOpacity=".5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M16 11.37a4 4 0 1 1-7.914 1.173A4 4 0 0 1 16 11.37m1.5-4.87h.01" stroke="#fff" strokeOpacity=".5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </a>
                </div>
                </div>
            </footer>
        </>
    );
}

export default Footer



// import Link from "next/link";
// import { Facebook, Twitter, Instagram, Youtube } from "lucide-react";

// export default function Footer() {
//   return (
//     <footer className="bg-white border-t border-gray-200 pt-16 pb-8">
//       <div className="max-w-7xl mx-auto px-6">
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
//           {/* Brand */}
//           <div className="space-y-4">
//             <h2 className="text-xl font-bold text-gray-900">dream collection</h2>
//             <p className="text-gray-500 text-sm leading-relaxed">
//               Your premier destination for rare and collectible Hot Wheels die-cast models. Fueling the passion for collectors worldwide.
//             </p>
//             <div className="flex gap-4">
//               <SocialIcon icon={<Instagram size={20} />} />
//               <SocialIcon icon={<Twitter size={20} />} />
//               <SocialIcon icon={<Facebook size={20} />} />
//               <SocialIcon icon={<Youtube size={20} />} />
//             </div>
//           </div>

//           {/* Quick Links */}
//           <div>
//             <h3 className="font-semibold text-gray-900 mb-4">Shop</h3>
//             <ul className="space-y-3 text-sm text-gray-500">
//               <FooterLink href="#">New Arrivals</FooterLink>
//               <FooterLink href="#">Best Sellers</FooterLink>
//               <FooterLink href="#">Pre-Orders</FooterLink>
//               <FooterLink href="#">Sale</FooterLink>
//             </ul>
//           </div>

//           {/* Support */}
//           <div>
//             <h3 className="font-semibold text-gray-900 mb-4">Support</h3>
//             <ul className="space-y-3 text-sm text-gray-500">
//               <FooterLink href="/profile">My Account</FooterLink>
//               <FooterLink href="#">Track Order</FooterLink>
//               <FooterLink href="#">Shipping Policy</FooterLink>
//               <FooterLink href="#">Returns</FooterLink>
//             </ul>
//           </div>

//           {/* Newsletter */}
//           <div>
//             <h3 className="font-semibold text-gray-900 mb-4">Stay in the Loop</h3>
//             <p className="text-sm text-gray-500 mb-4">Subscribe for latest drops and exclusive offers.</p>
//             <div className="flex gap-2">
//               <input 
//                 type="email" 
//                 placeholder="Email address" 
//                 className="bg-gray-50 border border-gray-300 text-sm rounded-lg px-4 py-2.5 w-full outline-none focus:border-indigo-500 transition"
//               />
//               <button className="bg-indigo-600 text-white px-4 py-2.5 rounded-lg hover:bg-indigo-700 transition">
//                 Subscribe
//               </button>
//             </div>
//           </div>
//         </div>

//         <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
//           <p>© {new Date().getFullYear()} Dream Collection. All rights reserved.</p>
//           <div className="flex gap-6">
//             <Link href="#" className="hover:text-gray-900">Privacy Policy</Link>
//             <Link href="#" className="hover:text-gray-900">Terms of Service</Link>
//           </div>
//         </div>
//       </div>
//     </footer>
//   );
// }

// function SocialIcon({ icon }) {
//   return (
//     <a href="#" className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 hover:bg-indigo-50 hover:text-indigo-600 transition">
//       {icon}
//     </a>
//   );
// }

// function FooterLink({ href, children }) {
//   return (
//     <li>
//       <Link href={href} className="hover:text-indigo-600 transition block">
//         {children}
//       </Link>
//     </li>
//   );
// }
