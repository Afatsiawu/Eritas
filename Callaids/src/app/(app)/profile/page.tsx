'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { User, Bus, ScanLine, Waypoints, CreditCard } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';

import { useTrip } from '../layout';

export default function ProfilePage() {
  const driverPhoto = PlaceHolderImages.find((img) => img.id === 'driver-photo');
  const { driver } = useTrip();

  if (!driver) return <div className="p-8 text-center">Loading profile...</div>;

  const driverData = {
    name: driver.name || 'N/A',
    driverLicense: driver.driverLicense || 'N/A',
    ghanaCardNumber: driver.ghanaCardNumber || 'N/A',
    busName: driver.busName || 'N/A',
    busPlate: driver.busPlate || 'N/A',
    id: driver.id || 'N/A',
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold font-headline">Driver Profile</h1>
        <p className="text-muted-foreground">Your personal and vehicle information.</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <Avatar className="h-24 w-24 border-2 border-primary">
              {driverPhoto && <AvatarImage src={driverPhoto.imageUrl} alt={driverData.name} data-ai-hint={driverPhoto.imageHint} />}
              <AvatarFallback className="text-3xl">{driverData.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="text-center sm:text-left">
              <CardTitle className="text-3xl">{driverData.name}</CardTitle>
              <p className="text-muted-foreground">Driver ID: {driverData.id}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2"><User /> Personal Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm p-4 border rounded-lg bg-secondary/30">
              <div>
                <p className="text-muted-foreground">Driver's License</p>
                <p className="font-medium">{driverData.driverLicense}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Ghana Card Number</p>
                <p className="font-medium">{driverData.ghanaCardNumber}</p>
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2"><Bus /> Vehicle Assignment</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm p-4 border rounded-lg bg-secondary/30">
              <div>
                <p className="text-muted-foreground">Bus Model</p>
                <p className="font-medium">{driverData.busName}</p>
              </div>
              <div>
                <p className="text-muted-foreground">License Plate</p>
                <p className="font-medium">{driverData.busPlate}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
