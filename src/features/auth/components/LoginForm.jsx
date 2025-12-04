"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button"; // Shadcn
import { Input } from "@/components/ui/input";   // Shadcn

const LoginForm = () => {
  const router = useRouter();
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const email = e.target[0].value;
    const password = e.target[1].value;

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false, // Prevent auto redirect to handle errors
    });

    if (res?.error) {
      setError("Invalid email or password");
    } else {
      router.push("/"); // Redirect to home on success
      router.refresh(); // Refresh to update server components
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full max-w-sm mx-auto mt-10 p-6 border rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-center">Login</h1>
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <Input type="email" placeholder="Email" required />
        <Input type="password" placeholder="Password" required />
        <Button type="submit">Sign In with Email</Button>
      </form>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <div className="relative my-2">
        <div className="absolute inset-0 flex items-center"><span className="w-full border-t"></span></div>
        <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted-foreground">Or continue with</span></div>
      </div>

      <Button variant="outline" onClick={() => signIn("google", { callbackUrl: "/" })}>
        Sign in with Google
      </Button>
    </div>
  );
};

export default LoginForm;
