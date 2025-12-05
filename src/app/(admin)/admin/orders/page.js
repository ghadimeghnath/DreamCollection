import { getAllOrders } from '@/features/admin/actions';
import AdminOrderList from '@/features/admin/components/AdminOrderList';

export const metadata = {
  title: "Order Management | Admin",
};

export default async function AdminOrdersPage() {
  const orders = await getAllOrders();

  return (
    <div className='p-6 max-w-7xl mx-auto'>
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Order Management</h1>
        <AdminOrderList initialOrders={orders} />
    </div>
  );
}