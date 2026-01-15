import { Suspense } from 'react';
import { UserManagementTable, UserManagementTableSkeleton } from '@/components/admin/user-management-table';
import { DriverCreationForm } from '@/components/admin/driver-creation-form';
import { DriverManagementTable, DriverManagementTableSkeleton } from '@/components/admin/driver-management-table';

export default function AdminDashboardPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage users, drivers, and system settings.</p>
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
