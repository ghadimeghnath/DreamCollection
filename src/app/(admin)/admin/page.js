import React from 'react';
import { getDashboardStats } from '@/features/admin/actions';
import { getVisitorStats } from '@/features/analytics/actions';
import AdminAnalytics from '@/features/admin/components/AdminAnalytics';
import VisitorAnalytics from '@/features/admin/components/VisitorAnalytics';

export const metadata = {
  title: "Admin Dashboard | Dream Collection",
};

export default async function AdminDashboard() {
  // Parallel data fetching
  const [stats, visitorStats] = await Promise.all([
    getDashboardStats(),
    getVisitorStats()
  ]);

  return (
    // Added 'pb-24' for mobile nav clearance and responsive padding
    <div className='p-4 md:p-6 max-w-7xl mx-auto pb-24 md:pb-8'>
      <div className="flex flex-col mb-6 md:mb-8">
         <h1 className="text-xl md:text-2xl font-bold text-gray-800">Dashboard</h1>
         <p className="text-xs md:text-sm text-gray-500">Overview of your store performance</p>
      </div>
      
      <div className="space-y-6">
        {/* 1. Store KPI Cards */}
        <section>
           <AdminAnalytics stats={stats} />
        </section>

        {/* 2. Visitor Analytics Charts */}
        <section>
           <VisitorAnalytics stats={visitorStats} />
        </section>
      </div>
    </div>
  );
}