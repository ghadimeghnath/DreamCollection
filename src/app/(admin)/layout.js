import { Geist, Geist_Mono } from "next/font/google";
import "../../app/globals.css";
import AdminNavbar from "@/features/admin/components/AdminNavbar";
import AdminSidebar from "@/features/admin/components/AdminSidebar";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth.config";
import { redirect } from "next/navigation";
import { ToastProvider } from "@/context/ToastContext"; 

// ... font definitions ...

export const metadata = {
  title: "Admin Dashboard | Dream Collection",
  description: "Manage products, orders, and store settings.",
};

export default async function AdminLayout({ children }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login?callbackUrl=/admin");
  }

  if (session.user.role !== "admin") {
    redirect("/"); 
  }

  return (
    <div className={`antialiased min-h-screen flex flex-col bg-gray-50/30`}>
        <ToastProvider>
            {/* Navbar acts as the top control strip */}
            <AdminNavbar />
            
            {/* Flex container for Sidebar + Content */}
            <div className="flex flex-col md:flex-row flex-1 relative">
                <AdminSidebar />
                
                {/* Sidebar handles navigation (Left on Desktop, Bottom on Mobile) */}
                
                {/* Main Content Area */}
                <main className="flex-1 w-full p-4 md:p-8 overflow-x-hidden pb-24 md:pb-8">
                    {children} 
                </main>
            </div>
        </ToastProvider>
    </div>
  );
}