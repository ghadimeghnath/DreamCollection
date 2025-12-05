"use client";

import { useState } from 'react';
import { updateOrderStatus } from '../actions';
import { Box, Calendar, CreditCard, User } from 'lucide-react';

export default function AdminOrderList({ initialOrders }) {
    const [orders, setOrders] = useState(initialOrders);

    const handleStatusChange = async (orderId, newStatus) => {
        // Optimistic update
        const updatedOrders = orders.map(o => 
            o._id === orderId ? { ...o, status: newStatus } : o
        );
        setOrders(updatedOrders);

        await updateOrderStatus(orderId, newStatus);
    };

    return (
        <div className="space-y-4 pb-24 md:pb-0 w-full">
            {orders.map((order) => (
                <div key={order._id} className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                    {/* Order Header */}
                    <div className="bg-gray-50 px-4 md:px-6 py-4 border-b border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
                            <div className="flex items-center gap-2 text-gray-600">
                                <Box size={16} />
                                <span className="font-mono font-medium">{order._id.slice(-6).toUpperCase()}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                                <Calendar size={16} />
                                <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                                <User size={16} />
                                <span className="truncate max-w-[100px] md:max-w-none">{order.userId}</span> 
                            </div>
                        </div>

                        <div className="flex items-center justify-between md:justify-end gap-3 w-full md:w-auto">
                            <span className="font-bold text-gray-900">${order.totalAmount}</span>
                            <select 
                                value={order.status}
                                onChange={(e) => handleStatusChange(order._id, e.target.value)}
                                className={`text-xs font-semibold px-3 py-1.5 rounded-full border-none outline-none cursor-pointer
                                    ${order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                                    ${order.status === 'Processing' ? 'bg-blue-100 text-blue-800' : ''}
                                    ${order.status === 'Shipped' ? 'bg-purple-100 text-purple-800' : ''}
                                    ${order.status === 'Delivered' ? 'bg-green-100 text-green-800' : ''}
                                    ${order.status === 'Cancelled' ? 'bg-red-100 text-red-800' : ''}
                                `}
                            >
                                <option value="Pending">Pending</option>
                                <option value="Processing">Processing</option>
                                <option value="Shipped">Shipped</option>
                                <option value="Delivered">Delivered</option>
                                <option value="Cancelled">Cancelled</option>
                            </select>
                        </div>
                    </div>

                    {/* Order Details */}
                    <div className="p-4 md:p-6 flex flex-col lg:flex-row gap-6">
                        {/* Items */}
                        <div className="flex-1 space-y-3">
                            {order.items.map((item, idx) => (
                                <div key={idx} className="flex items-center gap-4">
                                    <div className="h-12 w-12 bg-gray-100 rounded border border-gray-200 overflow-hidden shrink-0">
                                        <img src={item.image || '/placeholder.png'} className="h-full w-full object-contain mix-blend-multiply" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                                        <p className="text-xs text-gray-500">Qty: {item.quantity} × ${item.price}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Shipping Info */}
                        <div className="lg:w-1/3 bg-gray-50 p-4 rounded text-sm border border-gray-100 h-fit">
                            <p className="font-medium text-gray-900 mb-2">Shipping Address</p>
                            <div className="text-gray-600 space-y-0.5">
                                <p>{order.shippingAddress?.street}</p>
                                <p>{order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.zip}</p>
                                <p>{order.shippingAddress?.country}</p>
                            </div>
                            
                            <div className="mt-4 pt-3 border-t border-gray-200 flex items-center gap-2 text-gray-500">
                                <CreditCard size={14} />
                                <span>Method: {order.paymentMethod}</span>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}