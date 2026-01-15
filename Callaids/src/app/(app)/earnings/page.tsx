'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import EarningsChart from '@/components/earnings-chart';
import { TrendingUp, Users, Star, BarChart } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

type SummaryMetric = {
    title: string;
    value: string;
    icon: React.ElementType;
    change: string;
    changeType: 'increase' | 'decrease' | 'neutral';
};

type TripLog = {
    id: string;
    name: string;
    timeRange: string;
    earnings: number;
};

export default function EarningsPage() {
  const [summaryData, setSummaryData] = useState<SummaryMetric[]>([]);
  const [tripLogs, setTripLogs] = useState<TripLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching data
    setLoading(true);
    setTimeout(() => {
      setSummaryData([
          {
              title: "Total Earnings (Today)",
              value: `GH₵ 0.00`,
              icon: TrendingUp,
              change: "0%",
              changeType: "neutral",
          },
          {
              title: "Passengers Served",
              value: `0`,
              icon: Users,
              change: "0",
              changeType: "neutral",
          },
          {
              title: "Driver Rating",
              value: `N/A`,
              icon: Star,
              change: "0",
              changeType: "neutral",
          },
          {
              title: "Trips Completed",
              value: `0`,
              icon: BarChart,
              change: "No trips yet",
              changeType: "neutral",
          },
      ]);
      setTripLogs([]);
      setLoading(false);
    }, 1000);
  }, []);


  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Earnings & Performance</h1>
        <p className="text-muted-foreground">Review your daily and weekly performance.</p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {loading ? Array.from({length: 4}).map((_, i) => (
             <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <Skeleton className="h-4 w-2/3" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-8 w-1/2 mb-2" />
                    <Skeleton className="h-3 w-1/3" />
                </CardContent>
            </Card>
        )) : summaryData.map(metric => (
            <Card key={metric.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>

                    <metric.icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{metric.value}</div>
                    <p className={`text-xs ${metric.changeType === 'increase' ? 'text-green-600' : metric.changeType === 'decrease' ? 'text-red-600' : 'text-muted-foreground'}`}>
                        {metric.change} vs yesterday
                    </p>
                </CardContent>
            </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Weekly Performance</CardTitle>
            <p className="text-sm text-muted-foreground">
                Your earnings trend for the last 7 days.
            </p>
          </CardHeader>
          <CardContent>
            <EarningsChart empty={tripLogs.length === 0} />
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
            <CardHeader>
                <CardTitle>Daily Trip Summary</CardTitle>
            </CardHeader>
            <CardContent>
                {loading ? <p>Loading trips...</p> : tripLogs.length > 0 ? (
                    <ul className="space-y-4">
                        {tripLogs.map(trip => (
                            <li key={trip.id} className="flex justify-between items-center p-3 bg-secondary rounded-lg">
                                <div>
                                    <p className="font-semibold">{trip.name}</p>
                                    <p className="text-xs text-muted-foreground">{trip.timeRange}</p>
                                </div>
                                <p className="font-bold text-lg">GH₵ {trip.earnings.toFixed(2)}</p>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-sm text-muted-foreground text-center py-8">No trips recorded today.</p>
                )}
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
