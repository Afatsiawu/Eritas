'use client';

import { useState } from 'react';
import { BrainCircuit } from 'lucide-react';
import { getTrafficAwareRouteSuggestions, TrafficAwareRouteSuggestionsOutput } from '@/ai/flows/traffic-aware-route-suggestions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from './ui/skeleton';
import { type TripStatus } from '@/app/(app)/layout';

type TrafficSuggestionsProps = {
  tripStatus: TripStatus;
  stops: string[];
};


export default function TrafficSuggestions({ tripStatus, stops }: TrafficSuggestionsProps) {
  const [suggestion, setSuggestion] = useState<TrafficAwareRouteSuggestionsOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const isTripActive = tripStatus === 'In Progress';

  const handleGetSuggestion = async () => {
    setIsLoading(true);
    setSuggestion(null);
    try {
      const result = await getTrafficAwareRouteSuggestions({
        currentBusLocation: "Kaneshie Market, Accra",
        upcomingStops: stops,
      });
      setSuggestion(result);
    } catch (error: any) {
      console.error(error);
      const description = error.message?.includes('429') 
        ? 'AI service is busy. Please try again in a moment.'
        : 'Could not fetch traffic suggestion. Please try again.';
      toast({
        variant: "destructive",
        title: "AI Error",
        description: description,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BrainCircuit className="h-5 w-5 text-primary" />
          AI Route Suggestions
        </CardTitle>
        <CardDescription>Get real-time, traffic-aware route advice.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading && (
          <div className="space-y-3">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </div>
        )}
        {suggestion && (
          <div className="space-y-3 text-sm">
            <div>
              <h4 className="font-semibold">Suggested Route:</h4>
              <p className="text-muted-foreground">{suggestion.suggestedRoute}</p>
            </div>
            <div>
              <h4 className="font-semibold">Estimated Time:</h4>
              <p className="text-muted-foreground">{suggestion.estimatedTravelTime}</p>
            </div>
            <div>
              <h4 className="font-semibold">Reasoning:</h4>
              <p className="text-muted-foreground">{suggestion.reasoning}</p>
            </div>
          </div>
        )}
        {!isLoading && !suggestion && (
          <p className="text-sm text-center text-muted-foreground py-4">
            {isTripActive ? 'Click below to get the latest route suggestion.' : 'Start your trip to enable route suggestions.'}
            </p>
        )}
        <Button onClick={handleGetSuggestion} disabled={isLoading || !isTripActive} className="w-full" variant="outline">
          {isLoading ? 'Analyzing Traffic...' : 'Get Route Suggestion'}
        </Button>
      </CardContent>
    </Card>
  );
}
