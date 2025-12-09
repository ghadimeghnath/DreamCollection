"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Package, 
  Settings, 
  BarChart3, 
  Users,
  PlusCircle 
} from "lucide-react";

export default function AdminSidebar() {
  const pathname = usePathname();

  // Define Groups for scalable navigation
  const menuGroups = [
    {
      label: "Overview",
      items: [
        { 
          name: "Dashboard", 
          path: "/admin", 
          icon: <LayoutDashboard size={20} />,
          // Active strictly on root admin or dashboard sub-pages
          isActive: (path) => path === "/admin" 
        },
        // Placeholder for future Analytics feature
        // { name: "Analytics", path: "/admin/analytics", icon: <BarChart3 size={20} /> } 
      ]
    },
    {
      label: "Management",
      items: [
        { 
          name: "Products", 
          path: "/admin/products", 
          icon: <Package size={20} />,
          // Active for product list, add product, or edit pages
          isActive: (path) => path.startsWith("/admin/products") || path.startsWith("/admin/edit") || path.startsWith("/admin/add")
        },
        { 
          name: "Orders", 
          path: "/admin/orders", 
          icon: <ShoppingBag size={20} />,
          isActive: (path) => path.startsWith("/admin/orders")
        },
        // Placeholder for future User Management
        // { name: "Customers", path: "/admin/users", icon: <Users size={20} /> }
      ]
    },
    {
      label: "Configuration",
      items: [
        {
          name: "Store Settings",
          path: "/admin/settings",
          icon: <Settings size={20} />,
          isActive: (path) => path.startsWith("/admin/settings")
        }
      ]
    }
  ];

  const checkActive = (item) => item.isActive ? item.isActive(pathname) : pathname === item.path;

  return (
    <>
      {/* Mobile Bottom Nav Spacer */}
      <div className="md:hidden h-16 w-full shrink-0" />

      {/* Sidebar Container */}
      <aside className='
        z-40
        /* Mobile: Fixed Bottom Bar */
        fixed bottom-0 left-0 w-full h-16 bg-white border-t border-gray-200 flex flex-row justify-around items-center px-2
        
        /* Desktop: Sticky Sidebar */
        md:relative md:w-64 md:h-[calc(100vh-60px)] md:border-r md:border-t-0 md:flex-col md:justify-start md:px-4 md:py-6 md:gap-6 md:shadow-none
      '
      aria-label="Admin Navigation"
      >
        {menuGroups.map((group, groupIndex) => (
          <div key={groupIndex} className={`contents md:block w-full ${group.label === 'Configuration' ? 'hidden md:block' : ''}`}>
             {/* Note: Configuration is hidden on mobile bottom bar to save space, accessible via other means or "More" menu if needed later */}
             
            {/* Group Label (Desktop Only) */}
            <h3 className="hidden md:block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-3">
              {group.label}
            </h3>

            {/* Group Items */}
            <nav className="contents md:flex md:flex-col md:gap-1">
              {group.items.map((item, itemIndex) => {
                const isActive = checkActive(item);
                
                return (
                  <Link
                    href={item.path}
                    key={itemIndex}
                    className={`
                      group relative flex items-center transition-all duration-200 outline-none rounded-lg
                      
                      /* Mobile: Column layout, centered, small text */
                      flex-1 flex-col justify-center h-full py-1
                      
                      /* Desktop: Row layout, left aligned, padding */
                      md:flex-none md:flex-row md:justify-start md:px-3 md:py-2.5 md:h-auto

                      /* Focus Styles */
                      focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1

                      ${isActive 
                        ? "text-indigo-600 bg-indigo-50" 
                        : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                      }
                    `}
                    aria-current={isActive ? "page" : undefined}
                  >
                    {/* Mobile Top Indicator line for active state */}
                    {isActive && (
                      <span className="absolute top-0 w-8 h-0.5 bg-indigo-600 rounded-full md:hidden" />
                    )}

                    {/* Icon */}
                    <span className={`transition-colors ${isActive ? 'text-indigo-600' : 'text-gray-500 group-hover:text-gray-700'}`}>
                      {item.icon}
                    </span>
                    
                    {/* Label */}
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