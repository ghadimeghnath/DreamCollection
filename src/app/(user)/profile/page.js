import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth.config";
import { redirect } from "next/navigation";
import { getUserAddresses, getUserOrders } from "@/features/user/actions";
import UserProfile from "@/features/user/components/UserProfile";

export const metadata = {
  title: "My Profile | Dream Collection",
};

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  // Parallel data fetching for speed
  const [addresses, orders] = await Promise.all([
    getUserAddresses(session.user.id),
    getUserOrders(session.user.id)
  ]);

  return (
    <div className="bg-gray-50 min-h-screen">
       <UserProfile 
          user={session.user} 
          addresses={addresses} 
          orders={orders} 
       />
    </div>
  );
}