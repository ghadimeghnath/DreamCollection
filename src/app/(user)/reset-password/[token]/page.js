import ResetPasswordForm from "@/features/auth/components/ResetPasswordForm";

export const metadata = {
  title: "Reset Password | Dream Collection",
};

export default async function ResetPage({ params }) {
  const { token } = await params;

  return (
    <div className="min-h-screen bg-gray-50/50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <ResetPasswordForm token={token} />
      </div>
    </div>
  );
}