'use client';

import { useEffect, useState } from 'react';
import { useTrip } from '../layout';
import { Clock, Users, Wallet, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import TripControls from '@/components/trip-controls';
import StopsManagement, { type Stop } from '@/components/stops-management';
import { cn } from '@/lib/utils';


type Metric = {
    title: string;
    icon: React.ElementType;
    value: string;
    progress?: number;
    footer: string;
};

export default function DashboardPage() {
  const { tripStatus, setTripStatus, selectedStops, setSelectedStops, routeStops, isChecklistComplete, areDiagnosticsComplete, passengerCount, seatCapacity } = useTrip();
  const [metrics, setMetrics] = useState<Metric[]>([]);
  
  useEffect(() => {
    const isTripActive = tripStatus === 'In Progress';
    
    setMetrics([
      {
        title: 'Passenger Load',
        icon: Users,
        value: `${passengerCount} / ${seatCapacity}`,
        progress: (passengerCount / seatCapacity) * 100,
        footer: `${seatCapacity - passengerCount} seats available`,
      },
      {
        title: "Today's Earnings",
        icon: Wallet,
        value: isTripActive ? `GH₵ 150.00` : `GH₵ 0.00`,
        footer: isTripActive ? `Based on 2 trips` : 'No trips yet today',
      },
      {
        title: 'Next Stop ETA',
        icon: Clock,
        value: isTripActive ? '6 min' : 'N/A',
        footer: isTripActive ? 'Accra Mall' : 'Trip not started',
      },
    ]);
  }, [tripStatus, passengerCount, seatCapacity]);


  const handleStopsChange = (stop: Stop, isChecked: boolean) => {
    setSelectedStops(
      isChecked
        ? [...selectedStops, stop] // Add to the end to preserve selection order
        : selectedStops.filter((s) => s.id !== stop.id)
    );
  };
  
  const isTripActive = tripStatus === 'In Progress' && selectedStops.length > 0;
  
  const canStartTrip = isChecklistComplete && areDiagnosticsComplete && selectedStops.length > 0;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
            <h1 className="text-3xl font-bold font-headline">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, John. Here's your overview.</p>
        </div>
        <div className="md:w-auto w-full">
            <TripControls 
                status={tripStatus} 
                setStatus={setTripStatus} 
                startDisabled={!canStartTrip}
            />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {metrics.length > 0 ? metrics.map((metric) => (
          <Card key={metric.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-medium">
                {metric.title}
              </CardTitle>
              <metric.icon className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{metric.value}</div>
              <p className="text-xs text-muted-foreground pt-1">{metric.footer}</p>
              {metric.progress !== undefined && (
                <Progress value={metric.progress} className="mt-4 h-2" />
              )}
            </CardContent>
          </Card>
        )) : (
            // Skeleton loaders
            Array.from({length: 3}).map((_, i) => (
                <Card key={i}><CardHeader><CardTitle>Loading...</CardTitle></CardHeader><CardContent><Progress/></CardContent></Card>
            ))
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className={cn("transition-all duration-300", !isTripActive && "bg-card/50")}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Current Route Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isTripActive ? (
                <>
                    <div className="flex justify-between items-center p-3 rounded-lg bg-secondary">
                        <span className="font-semibold text-primary">Final Destination</span>
                        <span className="font-bold">{routeStops[routeStops.length - 1]?.label}</span>
                    </div>
                    <div>
                        <h4 className="font-medium mb-2">Upcoming Stops</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground list-disc list-inside">
                           {routeStops.slice(0, -1).map(stop => <li key={stop.id}>{stop.label}</li>).slice(0,3) }
                           {routeStops.length - 1 > 3 && <li>...and {routeStops.length - 4} more.</li>}
                           {routeStops.length <= 1 && <li>No intermediate stops selected.</li>}
                        </ul>
                    </div>
                </>
            ) : (
                <div className="text-center text-muted-foreground py-10">
                    <p>Select stops and start a trip to see route details.</p>
                </div>
            )}
          </CardContent>
        </Card>
        <StopsManagement 
            selectedStops={selectedStops}
            onStopsChange={handleStopsChange}
            disabled={tripStatus === 'In Progress'}
        />
      </div>
    </div>
  );
}
