'use client';

import { Suspense, useEffect, useState } from 'react';
import { UserManagementTable, UserManagementTableSkeleton } from '@/components/admin/user-management-table';
import { DriverCreationForm } from '@/components/admin/driver-creation-form';
import { DriverManagementTable, DriverManagementTableSkeleton } from '@/components/admin/driver-management-table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, TrendingUp, Calendar, Hash } from 'lucide-react';

type TripStats = {
  daily: number;
  weekly: number;
  monthly: number;
  total: number;
};

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<TripStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const session = localStorage.getItem('admin_session');
      const token = session ? JSON.parse(session).token : null;

      if (!token) {
        console.warn("No admin token found in localStorage");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/rides/admin/overview`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error("Failed to fetch admin stats:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage users, drivers, and system settings.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Daily Trips</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : stats?.daily}</div>
            <p className="text-xs text-muted-foreground">Trips made today</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Weekly Trips</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : stats?.weekly}</div>
            <p className="text-xs text-muted-foreground">Trips made this week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Trips</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : stats?.monthly}</div>
            <p className="text-xs text-muted-foreground">Trips made this month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Trips</CardTitle>
            <Hash className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : stats?.total}</div>
            <p className="text-xs text-muted-foreground">Total historic platform trips</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <DriverCreationForm />
        </div>
        <div className="lg:col-span-2">
          <Suspense fallback={<UserManagementTableSkeleton />}>
            <UserManagementTable />
          </Suspense>
        </div>
      </div>

      <div>
        <Suspense fallback={<DriverManagementTableSkeleton />}>
          <DriverManagementTable />
        </Suspense>
      </div>
    </div>
  );
}
