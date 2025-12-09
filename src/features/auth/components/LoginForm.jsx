"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button"; 
import { Input } from "@/components/ui/input";
import { registerUser, resendVerificationEmail } from "../actions";
import { useToast } from "@/context/ToastContext";
import { Loader2, Mail, Lock, User, RefreshCw } from "lucide-react";
import Link from "next/link"; 

const LoginForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const { addToast } = useToast();

  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState(null);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: ""
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleResend = async () => {
    if (!unverifiedEmail) return;
    setLoading(true);
    const res = await resendVerificationEmail(unverifiedEmail);
    setLoading(false);
    if (res.success) {
        addToast("Verification email sent!", "success");
        setUnverifiedEmail(null); 
    } else {
        addToast(res.error, "error");
    }
  };

  const handleForgotPassword = () => {
    const cleanEmail = formData.email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes("@")) {
        addToast("Please enter your email to reset password.", "warning");
        return;
    }
    router.push(`/forgot-password?email=${encodeURIComponent(cleanEmail)}`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setUnverifiedEmail(null);
    
    const cleanData = {
        ...formData,
        email: formData.email.trim().toLowerCase()
    };

    if (isLogin) {
      const res = await signIn("credentials", {
        email: cleanData.email,
        password: cleanData.password,
        redirect: false,
      });

      if (res?.error) {
        if (res.error === "unverified") {
            setUnverifiedEmail(cleanData.email);
            addToast("Account not verified. Please check your email.", "warning");
        } else {
            addToast("Invalid email or password.", "error");
        }
        setLoading(false);
      } else {
        addToast("Welcome back!", "success");
        router.push(callbackUrl);
        router.refresh();
      }
    } else {
      const res = await registerUser(cleanData);
      
      if (res.error) {
        addToast(res.error, "error");
        setLoading(false);
      } else {
        setSuccess(true);
        setLoading(false);
      }
    }
  };

  if (success) {
    return (
        <div className="bg-white py-10 px-6 shadow-xl sm:rounded-xl sm:px-10 border border-gray-100 text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
                <Mail className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Check your email</h3>
            <p className="text-gray-500 mb-8">
                Verification link sent to <span className="font-medium text-gray-900">{formData.email}</span>.
            </p>
            <Button onClick={() => setIsLogin(true) || setSuccess(false)} variant="outline" className="w-full">
                Back to Login
            </Button>
        </div>
    );
  }

  if (unverifiedEmail) {
    return (
        <div className="bg-white py-10 px-6 shadow-xl sm:rounded-xl sm:px-10 border border-gray-100 text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-amber-100 mb-6">
                <Mail className="h-8 w-8 text-amber-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Verification Required</h3>
            <p className="text-gray-500 mb-6 text-sm">
                Verify <strong>{unverifiedEmail}</strong> to continue.
            </p>
            <div className="space-y-3">
                <Button onClick={handleResend} disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">
                    {loading ? <Loader2 className="animate-spin mr-2" size={18} /> : <RefreshCw className="mr-2" size={18} />}
                    Resend Email
                </Button>
                <Button onClick={() => setUnverifiedEmail(null)} variant="ghost" className="w-full">
                    Use a different email
                </Button>
            </div>
        </div>
    );
  }

  return (
    <div className="bg-white py-8 px-4 shadow-xl sm:rounded-xl sm:px-10 border border-gray-100">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900">
            {isLogin ? "Sign in to your account" : "Create your account"}
        </h3>
        <p className="text-sm text-gray-500 mt-1">
            {isLogin ? "Access your orders & wishlist." : "Join us to start collecting today."}
        </p>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit}>
        {!isLogin && (
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <User size={18} />
                </div>
                <Input 
                    name="name"
                    type="text" 
                    placeholder="Full Name" 
                    value={formData.name}
                    onChange={handleChange}
                    className="pl-10"
                    required
                    disabled={loading} 
                />
            </div>
        )}

        <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Mail size={18} />
            </div>
            <Input 
                name="email"
                type="email" 
                placeholder="Email Address" 
                value={formData.email}
                onChange={handleChange}
                className="pl-10"
                required 
                disabled={loading} 
            />
        </div>

        <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Lock size={18} />
            </div>
            <Input 
                name="password"
                type="password" 
                placeholder="Password" 
                value={formData.password}
                onChange={handleChange}
                className="pl-10"
                required 
                disabled={loading} 
            />
            {isLogin && (
                <div className="text-right mt-1">
                    <button 
                        type="button"
                        onClick={handleForgotPassword}
                        className="text-xs font-medium text-indigo-600 hover:text-indigo-500 hover:underline cursor-pointer"
                    >
                        Forgot password?
                    </button>
                </div>
            )}
        </div>

        <Button type="submit" disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-5">
            {loading ? <Loader2 className="animate-spin mr-2" size={18} /> : null}
            {isLogin ? "Sign In" : "Create Account"}
        </Button>
      </form>

      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white px-2 text-gray-500">Or continue with</span>
          </div>
        </div>

        <div className="mt-6">
          <Button 
            variant="outline" 
            onClick={() => signIn("google", { callbackUrl })} 
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-5 border-gray-300 hover:bg-gray-50"
          >
            <svg className="h-5 w-5" aria-hidden="true" viewBox="0 0 24 24">
                <path d="M12.0003 20.45c-4.6667 0-8.45-3.7833-8.45-8.45 0-4.6667 3.7833-8.45 8.45-8.45 2.1 0 4.1.8 5.6 2.25l-2.4 2.4c-.85-.85-1.95-1.35-3.2-1.35-2.6 0-4.75 2.15-4.75 4.75s2.15 4.75 4.75 4.75c2.3 0 4.2-1.55 4.6-3.7H12v-3.3h8.05c.1.55.15 1.1.15 1.7 0 4.75-3.35 8.45-8.2 8.45z" fill="currentColor"/>
            </svg>
            <span className="font-medium text-gray-700">Google</span>
          </Button>
        </div>
      </div>

      <div className="mt-6 text-center text-sm">
        <p className="text-gray-600">
            {isLogin ? "New to Dream Collection?" : "Already have an account?"}
            <button 
                onClick={() => setIsLogin(!isLogin)} 
                className="ml-1 font-semibold text-indigo-600 hover:text-indigo-500 transition-colors"
            >
                {isLogin ? "Create an account" : "Sign in"}
            </button>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;