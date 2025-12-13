"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { LogOut, Settings, Menu, X } from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';

export default function AdminNavbar() {
  const { data: session } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm h-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex justify-between items-center h-full">
          
          <Link href="/admin" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-sm group-hover:bg-indigo-700 transition">
              <span className="text-white font-bold text-lg">D</span>
            </div>
            <span className="font-bold text-xl text-gray-900 hidden sm:block tracking-tight">Dream Admin</span>
          </Link>

          <div className="flex items-center gap-3 md:gap-4">
            
            {/* Direct Settings Link */}
            <Link 
              href="/admin/settings"
              className="hidden md:flex items-center justify-center p-2 rounded-full text-gray-500 hover:text-indigo-600 hover:bg-gray-100 transition"
              title="Store Settings"
            >
              <Settings size={20} />
            </Link>

            <div className="h-6 w-px bg-gray-200 hidden md:block" />

            <div className="flex items-center gap-3">
              <div className="text-right hidden lg:block">
                <p className="text-sm font-medium text-gray-900 leading-none">{session?.user?.name || 'Admin'}</p>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider mt-0.5">Manager</p>
              </div>
              
              <div className="h-9 w-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold border-2 border-white shadow-sm ring-1 ring-gray-100">
                {session?.user?.name?.[0] || 'A'}
              </div>
              
              <button 
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="hidden md:block p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition"
                title="Sign Out"
              >
                <LogOut size={18} />
              </button>

              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white absolute w-full shadow-lg z-50">
          <div className="pt-4 pb-3 border-b border-gray-200 px-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                  {session?.user?.name?.[0] || 'A'}
                </div>
              </div>
              <div className="ml-3">
                <div className="text-base font-medium leading-none text-gray-800">{session?.user?.name}</div>
                <div className="text-sm font-medium leading-none text-gray-500 mt-1">{session?.user?.email}</div>
              </div>
            </div>
          </div>
          <div className="py-2 px-2 space-y-1">
             <Link 
                href="/admin/settings" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-3 rounded-md text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50"
             >
               <Settings size={20} /> Store Settings
             </Link>
             <button 
               onClick={() => signOut({ callbackUrl: '/login' })}
               className="w-full flex items-center gap-3 px-3 py-3 rounded-md text-base font-medium text-red-600 hover:bg-red-50"
             >
               <LogOut size={20} /> Sign out
             </button>
          </div>
        </div>
      )}
    </nav>
  );
}