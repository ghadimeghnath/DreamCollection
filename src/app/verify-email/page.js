import { verifyEmail } from "@/features/auth/actions";
import Link from "next/link";
import { CheckCircle, XCircle } from "lucide-react";

export const metadata = {
  title: "Verify Email | Dream Collection",
};

export default async function VerifyEmailPage({ searchParams }) {
  const { token } = await searchParams;

  if (!token) {
    return <StatusCard success={false} message="Missing token" />;
  }

  const result = await verifyEmail(token);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50/50 p-4">
      <StatusCard success={result.success} message={result.message || result.error} />
    </div>
  );
}

function StatusCard({ success, message }) {
  return (
    <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 max-w-md w-full text-center">
      <div className={`mx-auto flex items-center justify-center h-16 w-16 rounded-full mb-4 ${success ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
        {success ? <CheckCircle size={32} /> : <XCircle size={32} />}
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        {success ? "Email Verified!" : "Verification Failed"}
      </h2>
      <p className="text-gray-500 mb-6">{message}</p>
      
      <Link href="/login">
        <button className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition">
            Back to Login
        </button>
      </Link>
    </div>
  );
}