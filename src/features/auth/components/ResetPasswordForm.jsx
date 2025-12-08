"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { resetPassword } from "../actions";
import { useToast } from "@/context/ToastContext";
import { Loader2, Lock } from "lucide-react";

export default function ResetPasswordForm({ token }) {
  const router = useRouter();
  const { addToast } = useToast();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 6) {
        addToast("Password must be at least 6 characters", "warning");
        return;
    }
    
    setLoading(true);
    const res = await resetPassword(token, password);

    if (res.success) {
      addToast("Password reset successfully! Login now.", "success");
      router.push("/login");
    } else {
      addToast(res.error, "error");
    }
    setLoading(false);
  };

  return (
    <div className="bg-white py-8 px-6 shadow-xl sm:rounded-xl sm:px-10 border border-gray-100">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900">Set New Password</h3>
        <p className="text-sm text-gray-500 mt-1">
          Your new password must be different to previously used passwords.
        </p>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="relative">
             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Lock size={18} />
            </div>
            <Input 
                type="password" 
                placeholder="New Password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10"
                required 
                disabled={loading}
            />
        </div>

        <Button type="submit" disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">
            {loading ? <Loader2 className="animate-spin mr-2" size={18} /> : null}
            Reset Password
        </Button>
      </form>
    </div>
  );
}