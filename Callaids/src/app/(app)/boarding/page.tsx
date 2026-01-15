'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  QrCode,
  UserCheck,
  Ticket,
  MapPin,
  AlertTriangle,
  VideoOff,
  UserX,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import ManualBoardingForm from '@/components/manual-boarding-form';

export type Passenger = {
  id: string;
  name: string;
  destination: string;
  status: string;
  statusColor: string;
} | null;

export default function BoardingPage() {
  const [hasCameraPermission, setHasCameraPermission] = useState<
    boolean | undefined
  >(undefined);
  const [scannedPassenger, setScannedPassenger] = useState<Passenger>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isManualAddOpen, setIsManualAddOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const { toast } = useToast();


  useEffect(() => {
    const getCameraPermission = async () => {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.error('Camera API is not supported in this browser.');
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Unsupported Browser',
          description:
            'Your browser does not support the necessary camera APIs.',
        });
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        setHasCameraPermission(true);
        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Camera Access Denied',
          description:
            'Please enable camera permissions in your browser settings to use the scanner.',
        });
      }
    };

    getCameraPermission();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [toast]);

  const handleScan = async () => {
    setIsScanning(true);
    setScannedPassenger(null);

    toast({
      title: 'Scanning...',
      description: 'Looking for a QR code. This is a simulation.',
    });
    
    // Simulate scanning a QR code
    setTimeout(() => {
      const isSuccess = Math.random() > 0.3; // 70% chance of success

      if(isSuccess) {
        setScannedPassenger({
            id: `TICKET_${Date.now()}`,
            name: 'Ama Serwaa',
            destination: 'Accra Mall',
            status: 'Paid & Reserved',
            statusColor: 'text-green-600 dark:text-green-400',
        });
        toast({
            title: 'Passenger Found',
            description: `Details for Ama Serwaa loaded.`
        });
      } else {
        setScannedPassenger({
            id: 'invalid',
            name: 'Unknown Passenger',
            destination: 'N/A',
            status: 'Invalid Ticket Scanned',
            statusColor: 'text-destructive',
        });
        toast({
            variant: 'destructive',
            title: 'Invalid Ticket',
            description: 'This QR code is not a valid ticket for this trip.',
        });
      }
      setIsScanning(false);
    }, 1500);

  };

  const handleConfirmBoarding = async () => {
    if (!scannedPassenger || scannedPassenger.statusColor === 'text-destructive') {
      toast({
        variant: 'destructive',
        title: 'Cannot Confirm',
        description: 'An invalid or unverified ticket cannot be confirmed.',
      });
      return;
    }

    toast({
      title: 'Boarding Confirmed',
      description: `${scannedPassenger.name} has been marked as boarded.`,
    });
    setScannedPassenger(null);
  };

  const handleCancel = () => {
    setScannedPassenger(null);
    toast({
      title: 'Boarding Canceled',
      description: 'Passenger details have been cleared.',
    });
  };
  
  const handleManualAdd = () => {
    setIsManualAddOpen(true);
  };

  const onManualPassengerAdd = (data: { name: string; destination: string; }) => {
    const newPassenger: Passenger = {
      id: `manual-${Date.now()}`,
      ...data,
      status: 'Manually Boarded',
      statusColor: 'text-green-600 dark:text-green-400',
    };
    setScannedPassenger(newPassenger);
    setIsManualAddOpen(false);
    toast({
      title: 'Passenger Manually Added',
      description: `Details for ${data.name} loaded. Ready for confirmation.`
    });
  };


  const isAuthentic = scannedPassenger && scannedPassenger.statusColor !== 'text-destructive';

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">
          Boarding & Verification
        </h1>
        <p className="text-muted-foreground">
          Scan passenger tickets to confirm boarding.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="flex flex-col items-center justify-center p-6 text-center">
          <CardHeader>
            <QrCode className="h-24 w-24 mx-auto text-primary" />
            <CardTitle className="mt-4">
              {isScanning ? 'Scanning...' : hasCameraPermission ? 'Ready to Scan' : 'Camera Inactive'}
            </CardTitle>
            <CardDescription>
              {hasCameraPermission
                ? "Position a QR code in the frame and press 'Start Scan'."
                : 'Camera access is required to scan tickets.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="w-full max-w-xs aspect-square border-4 border-dashed border-muted-foreground/50 rounded-lg flex items-center justify-center bg-black">
            {hasCameraPermission === false && (
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <VideoOff className="h-16 w-16" />
                <p>No camera feed</p>
              </div>
            )}
            <video
              ref={videoRef}
              className={`w-full aspect-video rounded-md ${hasCameraPermission ? 'block' : 'hidden'}`}
              autoPlay
              muted
              playsInline
            />
          </CardContent>
          <CardFooter className="w-full max-w-xs flex-col gap-2">
            <Button onClick={handleScan} disabled={isScanning || !hasCameraPermission} className="w-full">
              {isScanning ? 'Scanning...' : 'Start Scan'}
            </Button>
            {hasCameraPermission === false && (
              <Alert variant="destructive" className="text-left mt-2">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Camera Access Required</AlertTitle>
                <AlertDescription>
                  Please allow camera access in your browser to use this feature.
                </AlertDescription>
              </Alert>
            )}
          </CardFooter>
        </Card>

        <div className="space-y-6">
          {scannedPassenger ? (
            <Card className={isAuthentic ? "bg-green-500/10 border-green-500" : "bg-destructive/10 border-destructive"}>
              <CardHeader>
                <CardTitle className={isAuthentic ? "text-green-700 dark:text-green-400 flex items-center gap-2" : "text-destructive flex items-center gap-2"}>
                  {isAuthentic ? <UserCheck /> : <UserX />}
                  Last Scanned Passenger
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-lg">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground text-sm">Name</span>
                    <span className="font-bold">{scannedPassenger.name}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground text-sm flex items-center gap-1">
                      <MapPin className="h-4 w-4" /> Destination
                    </span>
                    <span className="font-medium">
                      {scannedPassenger.destination}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground text-sm flex items-center gap-1">
                      <Ticket className="h-4 w-4" /> Status
                    </span>
                    <span
                      className={`font-medium ${scannedPassenger.statusColor}`}
                    >
                      {scannedPassenger.status}
                    </span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col sm:flex-row gap-4">
                <Button
                  className="w-full text-lg py-6"
                  size="lg"
                  onClick={handleConfirmBoarding}
                  disabled={!isAuthentic}
                >
                  Confirm Boarding
                </Button>
                <Button variant="outline" className="w-full" onClick={handleCancel}>
                  Cancel
                </Button>
              </CardFooter>
            </Card>
          ) : (
             <Card className="flex flex-col items-center justify-center p-6 text-center h-full min-h-[300px]">
                <CardHeader>
                    <UserX className="h-16 w-16 mx-auto text-muted-foreground" />
                    <CardTitle className="mt-4 text-muted-foreground">No Passenger Scanned</CardTitle>
                </CardHeader>
                 <CardContent>
                    <p className="text-muted-foreground">Scan a passenger's QR code to see their details here.</p>
                 </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="text-amber-500" />
                Manual Override
              </CardTitle>
              <CardDescription>
                For network issues or passengers with special tickets.
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Button variant="secondary" className="w-full" onClick={handleManualAdd}>
                Manually Add Passenger
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
      
      <Dialog open={isManualAddOpen} onOpenChange={setIsManualAddOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Manual Passenger Boarding</DialogTitle>
                <DialogDescription>
                    Enter the passenger's details below to add them to the trip.
                </DialogDescription>
            </DialogHeader>
            <ManualBoardingForm onSubmit={onManualPassengerAdd} />
        </DialogContent>
      </Dialog>

    </div>
  );
}
