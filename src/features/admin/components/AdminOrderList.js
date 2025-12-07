"use client";

import { useState } from 'react';
import { updateOrderStatus, shipOrder, getLabelURL, cancelOrderShipment, syncOrderStatus } from '../actions';
import { Box, Calendar, CreditCard, User, Truck, Loader2, FileText, Ban, ExternalLink, RefreshCw } from 'lucide-react';
import Link from "next/link";

export default function AdminOrderList({ initialOrders }) {
    const [orders, setOrders] = useState(initialOrders);
    const [loadingAction, setLoadingAction] = useState({ id: null, type: null });

    const isLoading = (id, type) => loadingAction.id === id && loadingAction.type === type;

    const handleStatusChange = async (orderId, newStatus) => {
        const updatedOrders = orders.map(o => o._id === orderId ? { ...o, status: newStatus } : o);
        setOrders(updatedOrders);
        await updateOrderStatus(orderId, newStatus);
    };

    const handleShipOrder = async (orderId) => {
        if(!confirm("Create shipment? This will generate an AWB.")) return;
        setLoadingAction({ id: orderId, type: 'ship' });
        const res = await shipOrder(orderId);
        setLoadingAction({ id: null, type: null });
        if (res.success) { alert(res.message); window.location.reload(); } 
        else { alert("Shipping Failed: " + res.error); }
    };

    const handleDownloadLabel = async (orderId) => {
        setLoadingAction({ id: orderId, type: 'label' });
        const res = await getLabelURL(orderId);
        setLoadingAction({ id: null, type: null });
        if (res.success) window.open(res.url, '_blank');
        else alert(res.error);
    };

    const handleCancelOrder = async (orderId) => {
        if(!confirm("Are you sure? This will cancel the shipment.")) return;
        setLoadingAction({ id: orderId, type: 'cancel' });
        await cancelOrderShipment(orderId);
        setLoadingAction({ id: null, type: null });
        window.location.reload();
    };

    const handleSync = async (orderId) => {
        setLoadingAction({ id: orderId, type: 'sync' });
        const res = await syncOrderStatus(orderId);
        setLoadingAction({ id: null, type: null });
        if (res.success) { 
            alert(res.message); 
            window.location.reload();
        } else {
            alert(res.error);
        }
    };

    return (
        <div className="space-y-4 pb-24 md:pb-0 w-full">
            {orders.map((order) => (
                <div key={order._id} className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
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
                            
                            <div className="flex gap-2">
                                {/* Ship Button */}
                                {!order.awbCode && order.status !== 'Cancelled' && (
                                    <button 
                                        onClick={() => handleShipOrder(order._id)}
                                        disabled={isLoading(order._id, 'ship')}
                                        className="flex items-center gap-1 bg-indigo-600 text-white px-3 py-1.5 rounded-md text-xs font-medium hover:bg-indigo-700 disabled:opacity-50 transition"
                                    >
                                        {isLoading(order._id, 'ship') ? <Loader2 size={14} className="animate-spin" /> : <Truck size={14} />}
                                        Ship
                                    </button>
                                )}

                                {/* Label Button */}
                                {order.awbCode && (
                                    <button 
                                        onClick={() => handleDownloadLabel(order._id)}
                                        disabled={isLoading(order._id, 'label')}
                                        className="flex items-center gap-1 bg-white border border-gray-300 text-gray-700 px-3 py-1.5 rounded-md text-xs font-medium hover:bg-gray-50 transition"
                                    >
                                        {isLoading(order._id, 'label') ? <Loader2 size={14} className="animate-spin" /> : <FileText size={14} />}
                                        Label
                                    </button>
                                )}

                                {/* Sync Button */}
                                {order.awbCode && (
                                    <button 
                                        onClick={() => handleSync(order._id)}
                                        disabled={isLoading(order._id, 'sync')}
                                        className="flex items-center gap-1 bg-white border border-gray-300 text-gray-700 px-2 py-1.5 rounded-md text-xs font-medium hover:bg-gray-50 transition"
                                        title="Sync Status from Shiprocket"
                                    >
                                        {isLoading(order._id, 'sync') ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                                    </button>
                                )}

                                {/* Track Button */}
                                {order.trackingUrl && (
                                    <Link href={order.trackingUrl} target="_blank">
                                        <button className="flex items-center gap-1 bg-blue-50 text-blue-600 px-3 py-1.5 rounded-md text-xs font-medium hover:bg-blue-100 transition border border-blue-200">
                                            <ExternalLink size={14} /> Track
                                        </button>
                                    </Link>
                                )}

                                {/* Cancel Button */}
                                {order.status !== 'Cancelled' && order.status !== 'Delivered' && (
                                    <button 
                                        onClick={() => handleCancelOrder(order._id)}
                                        disabled={isLoading(order._id, 'cancel')}
                                        className="flex items-center gap-1 text-red-600 px-2 py-1.5 rounded-md text-xs font-medium hover:bg-red-50 transition"
                                        title="Cancel Order"
                                    >
                                        {isLoading(order._id, 'cancel') ? <Loader2 size={14} className="animate-spin" /> : <Ban size={14} />}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="p-4 md:p-6 flex flex-col lg:flex-row gap-6">
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

                        <div className="lg:w-1/3 bg-gray-50 p-4 rounded text-sm border border-gray-100 h-fit">
                            <div className="flex justify-between items-start mb-3">
                                <p className="font-medium text-gray-900">Shipping To</p>
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-gray-200 text-gray-700">
                                    {order.status}
                                </span>
                            </div>
                            <div className="text-gray-600 space-y-0.5 mb-3">
                                <p>{order.shippingAddress?.street}</p>
                                <p>{order.shippingAddress?.city}, {order.shippingAddress?.state}</p>
                                <p>{order.shippingAddress?.zip}</p>
                                {order.shippingAddress?.phone && <p className="mt-1 font-mono text-xs">📞 {order.shippingAddress.phone}</p>}
                            </div>
                            
                            {order.courierName && (
                                <div className="pt-3 border-t border-gray-200">
                                    <p className="text-xs text-gray-500">Courier: <span className="font-medium text-gray-800">{order.courierName}</span></p>
                                    <p className="text-xs text-gray-500">AWB: <span className="font-mono text-gray-800">{order.awbCode}</span></p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}