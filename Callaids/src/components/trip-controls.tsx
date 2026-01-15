'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { PlayCircle, Square, Flag } from 'lucide-react';
import type { TripStatus } from '@/app/(app)/layout';

type TripControlsProps = {
    status: TripStatus;
    setStatus: (status: TripStatus) => void;
    startDisabled?: boolean;
}

export default function TripControls({ status, setStatus, startDisabled = false }: TripControlsProps) {
  const handleToggleTrip = () => {
    if (status === 'Not Started' && !startDisabled) {
      setStatus('In Progress');
    } else if (status === 'In Progress') {
      setStatus('Ended');
    } else {
        setStatus('Not Started');
    }
  };

  const getButtonText = () => {
    if (status === 'Not Started') return 'Start Trip';
    if (status === 'In Progress') return 'End Trip';
    return 'Start New Trip';
  };

  const getButtonIcon = () => {
    if (status === 'Not Started') return <PlayCircle className="mr-2 h-5 w-5" />;
    if (status === 'In Progress') return <Square className="mr-2 h-5 w-5" />;
    return <Flag className="mr-2 h-5 w-5" />;
  };

  const getBadgeVariant = (): 'default' | 'secondary' | 'destructive' | 'outline' => {
      if (status === 'In Progress') return 'default';
      if (status === 'Not Started') return 'outline';
      return 'secondary';
  }

  const isStartButtonDisabled = status === 'Not Started' && startDisabled;

  const StartButton = (
    <Button 
      onClick={handleToggleTrip} 
      className="w-full sm:w-auto text-base py-5" 
      size="lg" 
      variant={status === 'In Progress' ? 'destructive' : 'default'}
      disabled={isStartButtonDisabled}
    >
      {getButtonIcon()}
      {getButtonText()}
    </Button>
  );

  return (
    <Card>
      <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium">Trip Status:</span>
          <Badge variant={getBadgeVariant()} className="text-sm">{status}</Badge>
        </div>
        {isStartButtonDisabled ? (
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        {/* The div is necessary for the tooltip to work on a disabled button */}
                        <div className="w-full sm:w-auto">{StartButton}</div>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Complete safety checklist, system diagnostics, and select stops.</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        ) : StartButton}
      </CardContent>
    </Card>
  );
}
