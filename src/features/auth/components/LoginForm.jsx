"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation"; // Added useSearchParams
import { Button } from "@/components/ui/button"; 
import { Input } from "@/components/ui/input";

const LoginForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/"; // Default to home if no callback
  
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const email = e.target[0].value;
    const password = e.target[1].value;

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (res?.error) {
      setError("Invalid email or password");
      setLoading(false);
    } else {
      // Redirect to the original destination (e.g., /admin) or home
      router.push(callbackUrl);
      router.refresh();
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full max-w-sm mx-auto p-6 border rounded-lg shadow-md bg-white">
      <h1 className="text-2xl font-bold text-center">Login</h1>
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <Input type="email" placeholder="Email" required disabled={loading} />
        <Input type="password" placeholder="Password" required disabled={loading} />
        <Button type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign In with Email"}
        </Button>
      </form>

      {error && <p className="text-red-500 text-sm text-center">{error}</p>}

      <div className="relative my-2">
        <div className="absolute inset-0 flex items-center"><span className="w-full border-t"></span></div>
        <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-muted-foreground">Or continue with</span></div>
      </div>

      <Button variant="outline" onClick={() => signIn("google", { callbackUrl })} disabled={loading}>
        Sign in with Google
      </Button>
    </div>
  );
};

export default LoginForm;