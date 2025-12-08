"use client";

import { useState, Fragment } from 'react';
import { updateOrderStatus } from '../actions';
import { 
    ChevronDown, ChevronUp, ChevronLeft, ChevronRight, 
    Box, Calendar, User, Mail, MapPin, CreditCard, Package, Truck, AlertCircle 
} from 'lucide-react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useToast } from "@/context/ToastContext"; // Added toast

const STATUS_OPTIONS = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

export default function AdminOrderList({ initialOrders, pagination, currentStatus }) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { addToast } = useToast();
    
    // Optimistic State
    const [orders, setOrders] = useState(initialOrders);
    const [expandedOrderId, setExpandedOrderId] = useState(null);
    const [updatingId, setUpdatingId] = useState(null);

    if (initialOrders !== orders && initialOrders.length !== orders.length) {
         setOrders(initialOrders);
    }

    const updateUrl = (key, value) => {
        const params = new URLSearchParams(searchParams);
        if (value && value !== 'All') {
            params.set(key, value);
        } else {
            params.delete(key);
        }
        if (key !== 'page') params.set('page', 1);
        router.replace(`${pathname}?${params.toString()}`);
    };

    const handleStatusChange = async (orderId, newStatus) => {
        setUpdatingId(orderId);
        // Optimistic update
        const previousOrders = [...orders];
        const updatedOrders = orders.map(o => 
            o._id === orderId ? { ...o, status: newStatus } : o
        );
        setOrders(updatedOrders);

        const res = await updateOrderStatus(orderId, newStatus);
        setUpdatingId(null);
        
        if (res.success) {
            addToast(`Order status updated to ${newStatus}`, "success");
        } else {
            setOrders(previousOrders); // Revert
            addToast("Failed to update status", "error");
        }
    };

    const toggleExpand = (id) => {
        setExpandedOrderId(expandedOrderId === id ? null : id);
    };

    const getStatusColor = (status) => {
        switch(status) {
            case 'Pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'Processing': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'Shipped': return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'Delivered': return 'bg-green-100 text-green-800 border-green-200';
            case 'Cancelled': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    // --- Reusable Expanded Content ---
    const renderOrderDetails = (order) => (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 text-left">
            
            {/* 1. Products */}
            <div className="lg:col-span-2 space-y-4">
                <h4 className="text-xs font-semibold uppercase text-gray-500 tracking-wider flex items-center gap-2">
                    <Package size={14} /> Order Items
                </h4>
                <div className="space-y-3">
                    {order.items.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-4 p-3 bg-white border border-gray-200 rounded-lg">
                            <div className="h-12 w-12 bg-gray-100 rounded overflow-hidden shrink-0 border border-gray-100">
                                <img src={item.image || '/placeholder.png'} alt={item.name} className="h-full w-full object-contain mix-blend-multiply" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                                <p className="text-xs text-gray-500">Qty: {item.quantity} × ${item.price}</p>
                            </div>
                            <p className="font-medium text-gray-900 text-sm">${item.quantity * item.price}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* 2. Shipping & Workflow */}
            <div className="space-y-6">
                <div>
                    <h4 className="text-xs font-semibold uppercase text-gray-500 tracking-wider flex items-center gap-2 mb-3">
                        <MapPin size={14} /> Shipping Address
                    </h4>
                    <div className="bg-white p-4 rounded-lg border border-gray-200 text-sm text-gray-600 leading-relaxed shadow-sm">
                        <p className="font-medium text-gray-900 mb-1 flex items-center gap-2">
                            <User size={14} className="text-gray-400"/> {order.userId?.name || 'Guest'}
                        </p>
                        <p>{order.shippingAddress?.street}</p>
                        <p>{order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.zip}</p>
                        <p>{order.shippingAddress?.country}</p>
                        <p className="mt-2 text-xs text-gray-400 font-mono flex items-center gap-1">
                             📞 {order.shippingAddress?.phone || 'No Phone'}
                        </p>
                    </div>
                </div>

                <div>
                    <h4 className="text-xs font-semibold uppercase text-gray-500 tracking-wider flex items-center gap-2 mb-3">
                        <CreditCard size={14} /> Workflow Actions
                    </h4>
                    <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-3 shadow-sm">
                        <div>
                            <label className="text-xs text-gray-500 block mb-1.5">Update Status</label>
                            <div className="relative">
                                <select 
                                    value={order.status}
                                    onChange={(e) => handleStatusChange(order._id, e.target.value)}
                                    disabled={updatingId === order._id}
                                    className={`w-full text-sm font-medium px-3 py-2 pr-8 rounded-md border border-gray-300 outline-none focus:ring-2 focus:ring-indigo-500 transition cursor-pointer appearance-none bg-white
                                        ${updatingId === order._id ? 'opacity-50 cursor-not-allowed' : ''}
                                    `}
                                >
                                    {STATUS_OPTIONS.map(opt => (
                                        <option key={opt} value={opt}>{opt}</option>
                                    ))}
                                </select>
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                    <ChevronDown size={14} />
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t border-gray-100 text-xs">
                            <span className="text-gray-500">Payment:</span>
                            <span className="font-medium bg-gray-100 px-2 py-0.5 rounded text-gray-700">{order.paymentMethod}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            
            {/* --- Status Filter Tabs --- */}
            <div className="flex overflow-x-auto pb-2 gap-2 scrollbar-thin scrollbar-thumb-gray-200 -mx-4 px-4 md:mx-0 md:px-0">
                {['All', ...STATUS_OPTIONS].map((status) => (
                    <button
                        key={status}
                        onClick={() => updateUrl('status', status)}
                        className={`
                            px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors border flex-shrink-0
                            ${(currentStatus === status || (status === 'All' && !currentStatus)) 
                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' 
                                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                            }
                        `}
                    >
                        {status}
                    </button>
                ))}
            </div>

            {/* --- 1. MOBILE VIEW (Cards) --- */}
            <div className="block lg:hidden space-y-4">
                {orders.map((order) => (
                    <div key={order._id} className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                        {/* Card Header */}
                        <div 
                            className="p-4 flex justify-between items-start cursor-pointer active:bg-gray-50 transition-colors"
                            onClick={() => toggleExpand(order._id)}
                        >
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <span className="font-mono text-sm font-bold text-gray-900">#{order._id.slice(-6).toUpperCase()}</span>
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getStatusColor(order.status)}`}>
                                        {order.status}
                                    </span>
                                </div>
                                <div className="text-xs text-gray-500 flex flex-col gap-1">
                                    <span className="flex items-center gap-1"><Calendar size={12}/> {new Date(order.createdAt).toLocaleDateString()}</span>
                                    <span className="flex items-center gap-1"><User size={12}/> {order.userId?.name}</span>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-gray-900">${order.totalAmount}</p>
                                <button className="mt-2 p-1 text-indigo-600 bg-indigo-50 rounded-full">
                                    {expandedOrderId === order._id ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
                                </button>
                            </div>
                        </div>

                        {/* Expanded Content (Mobile) */}
                        {expandedOrderId === order._id && (
                            <div className="border-t border-gray-100 bg-gray-50/50 p-4 animate-in slide-in-from-top-2 duration-200">
                                {renderOrderDetails(order)}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* --- 2. DESKTOP VIEW (Table) --- */}
            <div className="hidden lg:block bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-500">
                        <thead className="bg-gray-50/50 text-xs uppercase text-gray-500 font-semibold border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4">Order ID</th>
                                <th className="px-6 py-4">Customer</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Total</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {orders.map((order) => (
                                <Fragment key={order._id}>
                                    {/* Main Row */}
                                    <tr 
                                        className={`hover:bg-gray-50/80 transition-colors cursor-pointer ${expandedOrderId === order._id ? 'bg-gray-50' : ''}`}
                                        onClick={() => toggleExpand(order._id)}
                                    >
                                        <td className="px-6 py-4 font-mono font-medium text-gray-900">
                                            #{order._id.slice(-6).toUpperCase()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-medium text-gray-900">{order.userId?.name || 'Guest'}</span>
                                                <span className="text-xs text-gray-400">{order.userId?.email}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Calendar size={14} className="text-gray-400" />
                                                {new Date(order.createdAt).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-900">
                                            ${order.totalAmount}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button 
                                                className="p-2 text-gray-400 hover:text-indigo-600 rounded-full hover:bg-indigo-50 transition"
                                                onClick={(e) => { e.stopPropagation(); toggleExpand(order._id); }}
                                            >
                                                {expandedOrderId === order._id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                            </button>
                                        </td>
                                    </tr>

                                    {/* Expanded Details Row */}
                                    {expandedOrderId === order._id && (
                                        <tr className="bg-gray-50/50">
                                            <td colSpan="6" className="px-6 py-8 border-b border-gray-100 shadow-inner">
                                                {renderOrderDetails(order)}
                                            </td>
                                        </tr>
                                    )}
                                </Fragment>
                            ))}
                            
                            {orders.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-gray-400">
                                        <div className="flex flex-col items-center gap-2">
                                            <Package size={32} className="opacity-20" />
                                            <p>No orders found matching this filter.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* --- Pagination Footer --- */}
            {pagination.totalItems > 0 && (
                <div className="border-t border-gray-200 pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-sm text-gray-500">
                        Page {pagination.currentPage} of {pagination.totalPages} <span className="text-gray-300">|</span> {pagination.totalItems} Orders
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => updateUrl('page', pagination.currentPage - 1)}
                            disabled={pagination.currentPage === 1}
                            className="flex items-center px-3 py-1.5 border border-gray-300 rounded-md bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm text-gray-700"
                        >
                            <ChevronLeft size={16} className="mr-1"/> Prev
                        </button>
                        <button
                            onClick={() => updateUrl('page', pagination.currentPage + 1)}
                            disabled={pagination.currentPage === pagination.totalPages}
                            className="flex items-center px-3 py-1.5 border border-gray-300 rounded-md bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm text-gray-700"
                        >
                            Next <ChevronRight size={16} className="ml-1"/>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}