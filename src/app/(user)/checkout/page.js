import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth.config";
import { redirect } from "next/navigation";
import { getUserAddresses } from "@/features/user/actions";
import Checkout from "@/features/checkout/components/Checkout";

export const metadata = {
  title: "Checkout | Dream Collection",
};

export default async function CheckoutPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login?callbackUrl=/checkout");
  }

  // Fetch addresses so user can pick one
  const addresses = await getUserAddresses(session.user.id);

  return (
    <div className="bg-gray-50 min-h-screen">
        <Checkout userId={session.user.id} savedAddresses={addresses} />
    </div>
  );
}