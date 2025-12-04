import { Inter } from "next/font/google";
import "./globals.css";
import StoreProvider from "@/lib/StoreProvider";
import AuthProvider from "@/features/auth/components/AuthProvider";
import SessionWrapper from "@/features/auth/components/SessionWrapper"; // Import the wrapper
import Navbar from "@/components/layout/Navbar/Navbar";
import Footer from "@/components/layout/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Hot Wheels Store",
  description: "Best Die-cast models",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased relative`}>
        {/* 1. SessionWrapper provides the session context */}
        <SessionWrapper>
          {/* 2. StoreProvider provides the Redux store */}
          <StoreProvider>
            {/* 3. AuthProvider syncs Session -> Redux */}
            <AuthProvider>
                   <header className='text-center'>
                            <Navbar />
                          </header>
              {children}
      <Footer />

            </AuthProvider>
          </StoreProvider>
        </SessionWrapper>
      </body>
    </html>
  );
}
