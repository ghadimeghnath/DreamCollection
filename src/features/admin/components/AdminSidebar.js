"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, PlusCircle, ShoppingBag, Package, Settings, BarChart3, List } from "lucide-react";

export default function AdminSidebar() {
  const pathname = usePathname();

  const menuGroups = [
    {
      label: "Overview",
      items: [
        { 
          name: "Dashboard", 
          path: "/admin", 
          icon: <LayoutDashboard size={20} />,
          // Only active strictly on /admin
          isActive: (path) => path === "/admin" 
        },
      ]
    },
    {
      label: "Management",
      items: [
        { 
          name: "Products", 
          path: "/admin/products", 
          icon: <Package size={20} />,
          // Active for product list or edit pages
          isActive: (path) => path.startsWith("/admin/products") || path.startsWith("/admin/edit")
        },
        { 
          name: "Orders", 
          path: "/admin/orders", 
          icon: <ShoppingBag size={20} />,
          isActive: (path) => path.startsWith("/admin/orders")
        },
        { 
          name: "Add Product", 
          path: "/admin/add", 
          icon: <PlusCircle size={20} />,
          isActive: (path) => path === "/admin/add"
        },
      ]
    },
  ];

  const checkActive = (item) => item.isActive ? item.isActive(pathname) : pathname === item.path;

  return (
    <>
      <div className="md:hidden h-16 w-full shrink-0" />

      <aside className='
        z-50
        fixed bottom-0 left-0 w-full h-16 bg-white border-t border-gray-200 flex flex-row justify-around items-center px-2
        md:relative md:w-64 md:h-[calc(100vh-60px)] md:border-r md:border-t-0 md:flex-col md:justify-start md:px-4 md:py-6 md:gap-6 md:shadow-none
      '
      aria-label="Admin Navigation"
      >
        {menuGroups.map((group, groupIndex) => (
          <div key={groupIndex} className="contents md:block w-full">
            <h3 className="hidden md:block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-3">
              {group.label}
            </h3>

            <nav className="contents md:flex md:flex-col md:gap-1">
              {group.items.map((item, itemIndex) => {
                const isActive = checkActive(item);
                
                return (
                  <Link
                    href={item.path}
                    key={itemIndex}
                    className={`
                      group relative flex items-center transition-all duration-200 outline-none rounded-lg
                      flex-1 flex-col justify-center h-full py-1
                      md:flex-none md:flex-row md:justify-start md:px-3 md:py-2.5 md:h-auto
                      focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1
                      ${isActive 
                        ? "text-indigo-600 bg-indigo-50" 
                        : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                      }
                    `}
                    aria-current={isActive ? "page" : undefined}
                  >
                    {isActive && (
                      <span className="absolute top-0 w-8 h-0.5 bg-indigo-600 rounded-full md:hidden" />
                    )}

                    <span className={`transition-colors ${isActive ? 'text-indigo-600' : 'text-gray-500 group-hover:text-gray-700'}`}>
                      {item.icon}
                    </span>
                    
                    <span className={`
                      text-[10px] font-medium mt-1
                      md:text-sm md:mt-0 md:ml-3
                      ${isActive ? 'font-semibold' : ''}
                    `}>
                      {item.name}
                    </span>
                  </Link>
                );
              })}
            </nav>
          </div>
        ))}
      </aside>
    </>
  );
}