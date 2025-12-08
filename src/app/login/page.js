import LoginForm from "@/features/auth/components/LoginForm";
import { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Login / Sign Up | Dream Collection",
  description: "Access your account to manage orders and save your favorite cars.",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-50/50 flex flex-col justify-center py-5 sm:px-6 lg:px-8">
      
      {/* Back to Home Link */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md  px-4 sm:px-0">
        <Link href="/" className="inline-flex items-center text-sm text-gray-500 hover:text-indigo-600 transition-colors mb-6">
            <ArrowLeft size={16} className="mr-2" /> Back to Store
        </Link>
        
        <h2 className="text-center text-2xl font-bold tracking-tight text-gray-600">
          Welcome to Dream Collection
        </h2>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-[480px]">
        <Suspense fallback={<div className="text-center p-4">Loading authentication...</div>}>
          <LoginForm />
        </Suspense>

        {/* Trust/Benefits Section */}
        <div className="mt-3 grid grid-cols-3 gap-4 text-center text-xs text-gray-500 px-6 sm:px-0">
            <div className="flex flex-col items-center gap-1">
                <span className="p-2 bg-indigo-50 text-indigo-600 rounded-full">🚚</span>
                <span>Order Tracking</span>
            </div>
            <div className="flex flex-col items-center gap-1">
                <span className="p-2 bg-indigo-50 text-indigo-600 rounded-full">🛒</span>
                <span>Saved Cart</span>
            </div>
            <div className="flex flex-col items-center gap-1">
                <span className="p-2 bg-indigo-50 text-indigo-600 rounded-full">⚡</span>
                <span>Fast Checkout</span>
            </div>
        </div>
      </div>
    </div>
  );
}