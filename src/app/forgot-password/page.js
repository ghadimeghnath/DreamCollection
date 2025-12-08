import ForgotPasswordForm from "@/features/auth/components/ForgotPasswordForm";

export const metadata = {
  title: "Forgot Password | Dream Collection",
};

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-gray-50/50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <ForgotPasswordForm />
      </div>
    </div>
  );
}