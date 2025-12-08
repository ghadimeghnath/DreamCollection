import { getAllOrders } from '@/features/admin/actions';
import AdminOrderList from '@/features/admin/components/AdminOrderList';

export const metadata = {
  title: "Order Management | Admin",
};

export default async function AdminOrdersPage({ searchParams }) {
  // Await searchParams for Next.js 15+
  const params = await searchParams;
  
  const page = Number(params?.page) || 1;
  const status = params?.status || 'All';

  const { orders, pagination } = await getAllOrders({ page, status });

  return (
    <div className='p-4 md:p-6 max-w-7xl mx-auto'>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div>
                <h1 className="text-2xl font-bold text-gray-800">Orders</h1>
                <p className="text-sm text-gray-500">Track and manage customer shipments</p>
            </div>
            <div className="bg-indigo-50 text-indigo-700 px-4 py-1.5 rounded-full text-sm font-medium border border-indigo-100">
                {pagination.totalItems} Total Orders
            </div>
        </div>

        <AdminOrderList 
            initialOrders={orders} 
            pagination={pagination} 
            currentStatus={status}
        />
    </div>
  );
}