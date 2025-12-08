"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { requestPasswordReset } from "../actions";
import { useToast } from "@/context/ToastContext";
import { Loader2, ArrowLeft, Mail, AlertCircle, Lock } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function ForgotPasswordForm() {
  const { addToast } = useToast();
  const searchParams = useSearchParams();
  
  // Auto-fill from URL param if available
  const email = searchParams.get("email");
  
  const [loading, setLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  // If accessed directly without email, force back to login to ensure validation
  if (!email) {
    return (
        <div className="bg-white py-8 px-6 shadow-xl sm:rounded-xl sm:px-10 border border-gray-100 text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Email Required</h3>
            <p className="text-sm text-gray-500 mb-6">
                Please go back to the login page and enter your email address to reset your password.
            </p>
            <Link href="/login">
                <Button variant="outline" className="w-full">Back to Login</Button>
            </Link>
        </div>
    );
  }

  const handleSendReset = async () => {
    setLoading(true);
    const res = await requestPasswordReset(email);

    if (res.success) {
      setIsSent(true);
      addToast(res.message, "success");
    } else {
      addToast(res.error, "error");
    }
    setLoading(false);
  };

  if (isSent) {
    return (
      <div className="bg-white py-8 px-6 shadow-xl sm:rounded-xl sm:px-10 border border-gray-100 text-center animate-in fade-in zoom-in-95">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
          <Mail className="h-6 w-6 text-green-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Check your email</h3>
        <p className="text-sm text-gray-500 mb-6">
          We have sent a password reset link to <br/><strong>{email}</strong>.
        </p>
        <div className="text-xs text-gray-400 mb-6 bg-gray-50 p-3 rounded">
            Click the link in the email to sign in or set a new password.
        </div>
        <Link href="/login">
            <Button variant="outline" className="w-full">Back to Login</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white py-8 px-6 shadow-xl sm:rounded-xl sm:px-10 border border-gray-100 text-center">
      <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100 mb-4">
          <Lock className="h-6 w-6 text-indigo-600" />
      </div>
      
      <h3 className="text-xl font-bold text-gray-900 mb-2">Reset Password</h3>
      
      <p className="text-sm text-gray-500 mb-6">
        Send password reset instructions to:<br/>
        <span className="font-medium text-gray-900">{email}</span>
      </p>

      <div className="space-y-3">
        <Button 
            onClick={handleSendReset} 
            disabled={loading} 
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
        >
            {loading ? <Loader2 className="animate-spin mr-2" size={18} /> : null}
            Send Reset Link
        </Button>
        
        <Link href="/login">
             <Button variant="ghost" className="w-full text-gray-500">Cancel</Button>
        </Link>
      </div>
    </div>
  );
}