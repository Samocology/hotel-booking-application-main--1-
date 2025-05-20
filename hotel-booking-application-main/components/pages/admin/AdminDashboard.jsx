"use client";

import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AdminDashboard() {
  const router = useRouter();

  const [dashboardData, setDashboardData] = useState({
    totalUsers: 0,
    totalVendors: 0,
    grossSales: 0,
    netProfit: 0,
    sales: [],
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/admin/metrics");
        if (!res.ok) throw new Error("Failed to fetch metrics");
        const data = await res.json();
        setDashboardData({
          totalUsers: data.totalUsers ?? 0,
          totalVendors: data.totalVendors ?? 0,
          grossSales: data.grossSales ?? 0,
          netProfit: data.netProfit ?? 0,
          sales: Array.isArray(data.sales) ? data.sales : [],
        });
      } catch (err) {
        console.error("Error loading dashboard data:", err);
      }
    }

    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    {
      title: "Manage Vendors",
      description: "Edit vendor details and commission rates.",
      route: "/admin/vendors",
    },
    {
      title: "View Users",
      description: "See all registered users and their details.",
      route: "/admin/users",
    },
    {
      title: "Manage Events",
      description: "Oversee user-created events and remove invalid ones.",
      route: "/admin/events",
    },
    {
      title: "View Financials",
      description: "Track real-time sales and revenue.",
      route: "/admin/financials",
    },
    {
      title: "View Bookings",
      description: "Inspect all platform reservations and activity.",
      route: "/admin/bookings",
    },
    {
      title: "Reports & Analytics",
      description: "Generate insightful reports from platform activity.",
      route: "/admin/reports",
    },
    {
      title: "Support Requests",
      description: "Assist with user and vendor inquiries.",
      route: "/admin/support",
    },
    {
      title: "Platform Settings",
      description: "Adjust system-wide preferences.",
      route: "/admin/settings",
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-4">
            <p className="text-gray-500">Total Users</p>
            <p className="text-2xl font-bold">{dashboardData.totalUsers}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-gray-500">Total Vendors</p>
            <p className="text-2xl font-bold">{dashboardData.totalVendors}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-gray-500">Gross Sales</p>
            <p className="text-2xl font-bold">₦{dashboardData.grossSales.toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-gray-500">Net Profit</p>
            <p className="text-2xl font-bold">₦{dashboardData.netProfit.toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">Sales Overview</h2>
        <div className="bg-white p-4 rounded-xl shadow">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dashboardData.sales} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="gross" fill="#1d4ed8" name="Gross Sales" />
              <Bar dataKey="net" fill="#10b981" name="Net Sales" />
              <Bar dataKey="cross" fill="#f59e0b" name="Cross Sales" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {navItems.map((item, idx) => (
          <Card key={idx}>
            <CardContent className="p-4">
              <h2 className="text-lg font-semibold mb-2">{item.title}</h2>
              <p className="mb-4 text-gray-600">{item.description}</p>
              <Button onClick={() => router.push(item.route)}>{item.title}</Button>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}
