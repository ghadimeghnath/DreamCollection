"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, PlusCircle, ShoppingBag } from "lucide-react";

function AdminSidebar() {
  const pathname = usePathname();

  const sidebarLinks = [
    { name: "Dashboard", path: "/admin", icon: <LayoutDashboard size={22} /> },
    { name: "Add Product", path: "/admin/add", icon: <PlusCircle size={22} /> },
    { name: "Orders", path: "/admin/orders", icon: <ShoppingBag size={22} /> },
  ];

  return (
    <>
      {/* Spacer to prevent content from being hidden behind the fixed bottom bar on mobile */}
      <div className="md:hidden h-16 w-full shrink-0" />

      <div className='
        z-50
        /* Mobile: Fixed Bottom Bar */
        fixed bottom-0 left-0 w-full h-16 bg-white border-t border-gray-200 flex flex-row justify-between items-center shadow-[0_-2px_10px_rgba(0,0,0,0.05)]
        
        /* Desktop: Sticky Sidebar */
        md:relative md:w-64 md:h-[calc(100vh-60px)] md:border-r md:border-t-0 md:flex-col md:justify-start md:py-6 md:shadow-none
      '>
        {sidebarLinks.map((item, index) => {
          const isActive = pathname === item.path;
          return (
            <Link
              href={item.path}
              key={index}
              className={`
                group flex items-center transition-all duration-200
                
                /* Mobile: Vertical stack, equal width, centered */
                flex-1 flex-col justify-center h-full gap-1
                
                /* Desktop: Horizontal row, padding */
                md:flex-none md:flex-row md:justify-start md:px-6 md:py-3.5 md:gap-3 md:h-auto w-full

                ${isActive 
                  ? "text-indigo-600 bg-indigo-50/50 md:bg-indigo-50 md:border-r-4 md:border-indigo-600" 
                  : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                }
              `}
            >
              {/* Active Indicator for Mobile (Top Border) */}
              {isActive && <div className="absolute top-0 w-12 h-1 bg-indigo-600 rounded-b-md md:hidden" />}

              <div className={`transition-transform duration-200 ${isActive ? 'scale-110 md:scale-100' : ''}`}>
                {item.icon}
              </div>
              
              <span className={`
                text-[10px] font-medium
                md:text-sm md:inline-block
              `}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </>
  );
}

export default AdminSidebar;