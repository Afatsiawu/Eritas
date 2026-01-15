
'use client';
import { useState, useEffect } from 'react';
import { MoreHorizontal, Trash2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Skeleton } from '../ui/skeleton';
import { Driver } from '@/lib/definitions';
import { listDrivers, deleteDriver as deleteDriverAction } from '@/lib/mock-api';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export function DriverManagementTable() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [driverToDelete, setDriverToDelete] = useState<Driver | null>(null);
  const { toast } = useToast();

  const fetchDrivers = async () => {
    try {
      setLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
      const output = await fetch(`${apiUrl}/admin/drivers`);
      if (!output.ok) throw new Error("Failed to fetch drivers");
      const data = await output.json();

      const mappedDrivers: Driver[] = data.map((u: any) => ({
        id: u.id.toString(),
        fullName: u.name,
        email: u.email,
        licenseNumber: "N/A", // Placeholder until backend supports it
        ghanaCardNumber: "N/A",
        busPlateNumber: "N/A",
        registrationCode: "N/A"
      }));

      setDrivers(mappedDrivers);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch drivers.');
      toast({
        variant: 'destructive',
        title: 'Error fetching drivers',
        description: err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  const handleDeleteClick = (driver: Driver) => {
    setDriverToDelete(driver);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!driverToDelete) return;
    try {
      // await deleteDriverAction({ driverId: driverToDelete.id });
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
      await fetch(`${apiUrl}/admin/users/${driverToDelete.id}`, { method: 'DELETE' });

      toast({
        title: 'Driver Deleted',
        description: `Driver ${driverToDelete.fullName} has been successfully deleted.`,
      });
      await fetchDrivers(); // Refresh the driver list
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Error deleting driver',
        description: err.message || 'An unknown error occurred.',
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setDriverToDelete(null);
    }
  };

  if (loading) {
    return <DriverManagementTableSkeleton />;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Driver Management</CardTitle>
          <CardDescription>View and manage all registered drivers.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Full Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>License Number</TableHead>
                <TableHead>Ghana Card</TableHead>
                <TableHead>Bus Plate</TableHead>
                <TableHead>Registration Code</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {drivers.map((driver) => (
                <TableRow key={driver.id}>
                  <TableCell className="font-medium">{driver.fullName}</TableCell>
                  <TableCell>{driver.email}</TableCell>
                  <TableCell>{driver.licenseNumber}</TableCell>
                  <TableCell>{driver.ghanaCardNumber}</TableCell>
                  <TableCell>{driver.busPlateNumber}</TableCell>
                  <TableCell className='font-mono'>{driver.registrationCode}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          className="text-red-500 focus:text-red-500"
                          onClick={() => handleDeleteClick(driver)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Driver
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {drivers.length === 0 && (
            <div className="text-center p-8 text-muted-foreground">
              No drivers found.
            </div>
          )}
        </CardContent>
      </Card>
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will permanently delete the driver <span className='font-bold'>{driverToDelete?.fullName}</span>. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export function DriverManagementTableSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Driver Management</CardTitle>
        <CardDescription>View and manage all registered drivers.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Full Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>License Number</TableHead>
              <TableHead>Ghana Card</TableHead>
              <TableHead>Bus Plate</TableHead>
              <TableHead>Registration Code</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(3)].map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
