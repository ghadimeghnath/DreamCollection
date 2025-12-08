"use client";

import { Badge } from "@/components/ui/badge";

export default function OrderHistory({ orders }) {
  if (orders.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
             <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900">No Orders Yet</h3>
        <p className="text-gray-500">Looks like you haven't placed an order yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold mb-4">Order History</h2>
      {orders.map((order) => (
        <div key={order._id} className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
          <div className="bg-gray-50 px-6 py-4 flex flex-col md:flex-row justify-between md:items-center gap-4 border-b border-gray-200">
            <div className="flex gap-6 text-sm">
                <div>
                    <p className="text-gray-500 uppercase text-xs font-bold tracking-wider">Order Placed</p>
                    <p className="font-medium text-gray-900">{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                    <p className="text-gray-500 uppercase text-xs font-bold tracking-wider">Total</p>
                    <p className="font-medium text-gray-900">${order.totalAmount}</p>
                </div>
                <div>
                     <p className="text-gray-500 uppercase text-xs font-bold tracking-wider">Order #</p>
                     <p className="font-medium text-gray-900 truncate w-24 md:w-auto">{order._id.slice(-6).toUpperCase()}</p>
                </div>
            </div>
            
            <div>
                 <Badge className={`
                    ${order.status === 'Delivered' ? 'bg-green-100 text-green-700 hover:bg-green-100' : ''}
                    ${order.status === 'Shipped' ? 'bg-purple-100 text-purple-700 hover:bg-purple-100' : ''}
                    ${order.status === 'Pending' ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100' : ''}
                    ${order.status === 'Cancelled' ? 'bg-red-100 text-red-700 hover:bg-red-100' : ''}
                 `}>
                    {order.status}
                 </Badge>
            </div>
          </div>

          <div className="p-6">
             {order.items.map((item, idx) => (
                 <div key={idx} className="flex gap-4 mb-4 last:mb-0">
                     <div className="w-16 h-16 bg-gray-100 rounded-md overflow-hidden shrink-0">
                         {item.image ? (
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover mix-blend-multiply" />
                         ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">N/A</div>
                         )}
                     </div>
                     <div>
                         <h4 className="font-medium text-gray-900">{item.name}</h4>
                         <p className="text-sm text-gray-500">Qty: {item.quantity} × ${item.price}</p>
                     </div>
                 </div>
             ))}
          </div>
        </div>
      ))}
    </div>
  );
} 