'use client';

import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell, Users, Map } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import TrafficSuggestions from '@/components/traffic-suggestions';
import { useTrip } from '../layout';
import LiveMap from '@/components/live-map';

export default function TripPage() {
  const mapImage = PlaceHolderImages.find((img) => img.id === 'live-trip-map');
  const { tripStatus, routeStops, passengerCount, seatCapacity } = useTrip();
  const stopLabels = routeStops.map(stop => stop.label);
  const isTripActive = tripStatus === 'In Progress';

  return (
    <div className="space-y-6">
       <div>
        <h1 className="text-3xl font-bold font-headline">Live Trip</h1>
        <p className="text-muted-foreground">Real-time updates and route assistance.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-0 relative h-[60vh] min-h-[400px] lg:min-h-0">
              <LiveMap />
              <div className="absolute top-4 right-4 bg-background/80 backdrop-blur-sm p-3 rounded-lg shadow-lg">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  <span className="text-lg font-bold">{passengerCount} / {seatCapacity}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Boarding Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isTripActive ? (
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-secondary rounded-lg">
                    <Users className="h-5 w-5 text-primary mt-1" />
                    <div>
                      <p className="font-semibold">2 passengers reserved seats</p>
                      <p className="text-sm text-muted-foreground">@ UPSA Gate</p>
                    </div>
                  </div>
                   <div className="flex items-start gap-3 p-3 bg-secondary/50 rounded-lg">
                    <Users className="h-5 w-5 text-muted-foreground mt-1" />
                    <div>
                      <p className="font-semibold">1 passenger waiting</p>
                      <p className="text-sm text-muted-foreground">@ Accra Mall</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-10">
                  <p>Start a trip to see live boarding alerts.</p>
                </div>
              )}
            </CardContent>
          </Card>
          
          <TrafficSuggestions tripStatus={tripStatus} stops={stopLabels} />

        </div>
      </div>
    </div>
  );
}
