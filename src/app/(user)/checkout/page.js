import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth.config";
import { redirect } from "next/navigation";
import { getUserAddresses } from "@/features/user/actions";
import { getStoreSettings } from "@/features/admin/settings/actions";
import Checkout from "@/features/checkout/components/Checkout";
import { PAYMENT_GATEWAYS } from "@/features/admin/settings/modules/payments/paymentRegistry";

export const metadata = {
  title: "Checkout | Dream Collection",
};

export default async function CheckoutPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login?callbackUrl=/checkout");
  }

  // Parallel Fetch: User Addresses & Store Settings
  const [addresses, settings] = await Promise.all([
     getUserAddresses(session.user.id).catch(() => []),
     getStoreSettings().catch(() => ({}))
  ]);

  // Filter enabled gateways for the frontend
  const enabledGateways = PAYMENT_GATEWAYS.filter(g => {
     const config = settings.paymentGateways?.find(sg => sg.id === g.id);
     return config?.enabled;
  }).map(g => ({
     ...g,
     // Pass non-sensitive config (like instructions/UPI ID) to frontend if needed
     config: settings.paymentGateways.find(sg => sg.id === g.id)?.config || {} 
  }));

  return (
    <div className="bg-gray-50 min-h-screen">
        <Checkout 
            userId={session.user.id} 
            savedAddresses={addresses || []} 
            availableGateways={enabledGateways}
        />
    </div>
  );
}