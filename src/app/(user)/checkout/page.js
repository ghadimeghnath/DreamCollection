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

  // Fetch addresses safely. If it fails or returns null, pass empty array.
  let addresses = [];
  try {
    addresses = await getUserAddresses(session.user.id);
  } catch (error) {
    console.error("Failed to fetch addresses for checkout", error);
  }

  return (
    <div className="bg-gray-50 min-h-screen">
        <Checkout userId={session.user.id} savedAddresses={addresses || []} />
    </div>
  );
}