import { Geist, Geist_Mono } from "next/font/google";
import "../../app/globals.css";
import AdminNavbar from "@/features/admin/components/AdminNavbar";
import AdminSidebar from "@/features/admin/components/AdminSidebar";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth.config";
import { redirect } from "next/navigation";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Admin Dashboard | Dream Collection",
  description: "Manage products, orders, and store settings.",
};

export default async function AdminLayout({ children }) {
  // 1. Validate Session on the Server
  const session = await getServerSession(authOptions);

  // 2. Strict Redirection Logic
  if (!session) {
    // If no session exists, force login with a callback to the dashboard
    redirect("/login?callbackUrl=/admin");
  }

  if (session.user.role !== "admin") {
    // If logged in but not admin, kick to homepage
    redirect("/"); 
  }

  // 3. Render Admin UI only if Authorized
  return (
    <div className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col bg-gray-50/30`}>
        {/* Navbar stays at the top */}
        <AdminNavbar />
        
        {/* Responsive Layout Container:
            - Mobile: flex-col-reverse (Puts Content on TOP, Sidebar/Spacer on BOTTOM)
            - Desktop: flex-row (Puts Sidebar on LEFT, Content on RIGHT)
        */}
        <div className="flex flex-col-reverse md:flex-row flex-1 relative">
            
            {/* Sidebar Component */}
            <AdminSidebar />
            
            {/* Main Content Area */}
            <main className="flex-1 w-full p-4 md:p-8 overflow-x-hidden">
                {children} 
            </main>
        </div>
    </div>
  );
}