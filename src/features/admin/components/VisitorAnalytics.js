"use client";

import { motion } from "framer-motion";
import { Users, Activity, Clock } from "lucide-react";
import { useState, useEffect } from "react";
import { getVisitorStats } from "@/features/analytics/actions";

export default function VisitorAnalytics({ stats: initialStats }) {
  const [stats, setStats] = useState(initialStats);

  // Poll for updates to ensure "Real-Time" data is accurate and not misleading
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const freshStats = await getVisitorStats();
        setStats(freshStats);
      } catch (err) {
        console.error("Analytics polling error:", err);
      }
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const activeUsers = stats?.activeUsers || 0;
  const dailyVisits = stats?.dailyVisits || 0;
  const data = stats?.hourlyTraffic || [];

  // Determine scaling factor
  const maxVisits = Math.max(...data.map(d => d.visits), 10);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
      
      {/* 1. Live Metrics Card */}
      <div className="bg-white p-4 md:p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between h-full">
        <div>
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-gray-500 font-medium text-xs uppercase tracking-wider">Real-Time</h3>
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                </span>
            </div>
            <div className="flex items-end gap-2 md:gap-3">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 transition-all duration-300">
                    {activeUsers}
                </h2>
                <p className="text-xs md:text-sm text-gray-500 mb-1.5 font-medium">Active Users</p>
            </div>
        </div>
        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center gap-2 text-xs md:text-sm text-gray-600">
            <Activity size={14} className="text-indigo-600" />
            <span>Browsing right now</span>
        </div>
      </div>

      {/* 2. Today's Traffic Card */}
      <div className="bg-white p-4 md:p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between h-full">
        <div>
            <h3 className="text-gray-500 font-medium text-xs uppercase tracking-wider mb-3">Today's Traffic</h3>
            <div className="flex items-end gap-2 md:gap-3">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 transition-all duration-300">
                    {dailyVisits}
                </h2>
                <p className="text-xs md:text-sm text-gray-500 mb-1.5 font-medium">Total Visits</p>
            </div>
        </div>
        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center gap-2 text-xs md:text-sm text-gray-600">
            <Users size={14} className="text-blue-600" />
            <span>Unique sessions today</span>
        </div>
      </div>

      {/* 3. Hourly Trends Chart */}
      <div className="bg-white p-4 md:p-6 rounded-xl border border-gray-200 shadow-sm lg:row-span-2 lg:col-span-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-2">
            <div>
                <h3 className="text-base md:text-lg font-bold text-gray-900">Traffic Trends</h3>
                <p className="text-xs md:text-sm text-gray-500">Visitor activity over the last 24 hours</p>
            </div>
            <div className="self-start sm:self-auto flex items-center gap-2 px-2 py-1 bg-gray-50 rounded-full border border-gray-200 text-[10px] md:text-xs font-medium text-gray-600">
                <Clock size={12} /> 24 Hour View
            </div>
        </div>

        {/* Custom Responsive Bar Chart Container */}
        <div className="h-32 md:h-48 w-full flex items-end gap-0.5 sm:gap-2">
            {data.map((point, i) => {
                const heightPercent = (point.visits / maxVisits) * 100;
                return (
                    <div key={i} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                        {/* Tooltip (Hidden on small touch devices mostly) */}
                        <div className="hidden sm:block absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                            {point.visits} visits at {point.hour}
                        </div>
                        
                        {/* Bar */}
                        <motion.div 
                            initial={{ height: 0 }}
                            animate={{ height: `${heightPercent}%` }}
                            transition={{ duration: 0.5, delay: i * 0.02 }}
                            className={`
                                w-full max-w-[20px] sm:max-w-[30px] rounded-t-sm min-h-[4px] transition-colors
                                ${heightPercent > 80 ? 'bg-indigo-600' : 'bg-indigo-200 group-hover:bg-indigo-400'}
                            `}
                        />
                        
                        {/* Label (Sparse labeling for mobile) */}
                        {i % 4 === 0 && (
                            <span className="text-[9px] md:text-[10px] text-gray-400 mt-1 absolute -bottom-5 md:-bottom-6">{point.hour}</span>
                        )}
                    </div>
                );
            })}
        </div>
        {/* Spacer for bottom labels */}
        <div className="h-4 md:h-6" />
      </div>
    </div>
  );
}