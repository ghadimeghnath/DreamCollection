"use server";

import dbConnect from '@/lib/db';
import VisitorLog from './models/VisitorLog';

// --- 1. Track a Visit ---
export const trackVisit = async (path) => {
  try {
    await dbConnect();
    // Fire and forget - don't await this to keep UI fast
    VisitorLog.create({ page: path }); 
  } catch (error) {
    console.error("Tracking Error:", error);
  }
};

// --- 2. Get Dashboard Stats ---
export const getVisitorStats = async () => {
  await dbConnect();
  
  const now = new Date();
  
  // A. Active Users (Last 5 minutes)
  const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
  
  // B. Daily Visits (Since start of today)
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);

  // C. Hourly Traffic (Last 24 hours for Graph)
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  try {
    const [activeUsers, dailyVisits, hourlyData] = await Promise.all([
      // Count visits in last 5 mins
      VisitorLog.countDocuments({ timestamp: { $gte: fiveMinutesAgo } }),
      
      // Count visits today
      VisitorLog.countDocuments({ timestamp: { $gte: startOfDay } }),
      
      // Aggregate last 24h by hour
      VisitorLog.aggregate([
        { $match: { timestamp: { $gte: twentyFourHoursAgo } } },
        { 
          $group: { 
            _id: { $hour: "$timestamp" }, // Group by Hour (0-23)
            count: { $sum: 1 } 
          }
        },
        { $sort: { "_id": 1 } }
      ])
    ]);

    // Format Hourly Data for Chart (Fill missing hours with 0)
    const formattedHourly = Array.from({ length: 24 }, (_, i) => {
      const hourData = hourlyData.find(d => d._id === i);
      return { hour: `${i}:00`, visits: hourData ? hourData.count : 0 };
    });

    return {
      activeUsers,
      dailyVisits,
      hourlyTraffic: formattedHourly
    };

  } catch (error) {
    console.error("Analytics Stats Error:", error);
    return { activeUsers: 0, dailyVisits: 0, hourlyTraffic: [] };
  }
};