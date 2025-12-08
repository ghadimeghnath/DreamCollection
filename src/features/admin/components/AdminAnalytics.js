"use client";
import { Users, ShoppingBag, DollarSign, PackageCheck } from "lucide-react";
import { motion } from "framer-motion";

export default function AdminAnalytics({ stats }) {
    const cards = [
        {
            label: "Total Revenue",
            value: `$${stats.totalRevenue.toLocaleString()}`,
            icon: <DollarSign className="text-emerald-600" size={20} />, // Slightly smaller icon
            bg: "bg-emerald-50",
            border: "border-emerald-100"
        },
        {
            label: "Total Orders",
            value: stats.totalOrders,
            icon: <ShoppingBag className="text-blue-600" size={20} />,
            bg: "bg-blue-50",
            border: "border-blue-100"
        },
        {
            label: "Total Customers",
            value: stats.totalUsers,
            icon: <Users className="text-purple-600" size={20} />,
            bg: "bg-purple-50",
            border: "border-purple-100"
        },
        {
            label: "Products In Stock",
            value: stats.activeProducts,
            icon: <PackageCheck className="text-orange-600" size={20} />,
            bg: "bg-orange-50",
            border: "border-orange-100"
        }
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            {cards.map((card, index) => (
                <motion.div 
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`
                        p-4 md:p-5 rounded-xl border ${card.border} ${card.bg} 
                        flex items-center justify-between shadow-sm hover:shadow-md transition-shadow
                    `}
                >
                    <div>
                        <p className="text-xs md:text-sm text-gray-600 font-medium mb-0.5">{card.label}</p>
                        <h3 className="text-xl md:text-2xl font-bold text-gray-900">{card.value}</h3>
                    </div>
                    <div className="p-2.5 bg-white rounded-lg shadow-sm border border-gray-100/50 shrink-0">
                        {card.icon}
                    </div>
                </motion.div>
            ))}
        </div>
    );
}