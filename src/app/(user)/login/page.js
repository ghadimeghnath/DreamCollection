import LoginForm from "@/features/auth/components/LoginForm";
import { Suspense } from "react";

export default function LoginPage() {
  return<>
  <div className="min-h-[calc(100vh-100px)] flex items-center">

  <Suspense fallback={<div>Loading...</div>}>
  <LoginForm/>
  </Suspense>
  </div>
  </>
}