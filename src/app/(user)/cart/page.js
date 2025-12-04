import Cart from "@/features/cart/components/Cart";

export const metadata = {
  title: "My Cart | Dream Collection",
};

export default function CartPage() {
  return (
    <div className="bg-white min-h-screen">
       <Cart />
    </div>
  );
}