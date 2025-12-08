import { Inter } from "next/font/google";
import "./globals.css";
import StoreProvider from "@/lib/StoreProvider";
import AuthProvider from "@/features/auth/components/AuthProvider";
import SessionWrapper from "@/features/auth/components/SessionWrapper"; 
import { ToastProvider } from "@/context/ToastContext"; 
import CartSync from "@/features/cart/components/CartSync";
import AnalyticsTracker from "@/features/analytics/components/AnalyticsTracker"; // Import Tracker

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Hot Wheels Store",
  description: "Best Die-cast models",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased relative`}>
        <SessionWrapper>
          <StoreProvider>
            <AuthProvider>
              <ToastProvider>
                <CartSync/>
                <AnalyticsTracker /> {/* Runs silently in background */}
                {children}
              </ToastProvider>
            </AuthProvider>
          </StoreProvider>
        </SessionWrapper>
      </body>
    </html>
  );
}