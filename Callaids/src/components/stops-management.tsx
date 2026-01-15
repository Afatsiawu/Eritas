'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Waypoints, PlusCircle, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { ScrollArea } from './ui/scroll-area';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import AddStopForm from './add-stop-form';

// Hardcoded stops have been removed. The list now starts empty.
const initialStopsData: Stop[] = [];

export type Stop = {
  id: string;
  label: string;
  lat: number;
  lng: number;
  price: number | string;
};

type StopsManagementProps = {
    selectedStops: Stop[];
    onStopsChange: (stop: Stop, isChecked: boolean) => void;
    disabled?: boolean;
}

export default function StopsManagement({ selectedStops, onStopsChange, disabled }: StopsManagementProps) {
  const [stopsData, setStopsData] = useState(initialStopsData);
  const [isAddStopOpen, setIsAddStopOpen] = useState(false);

  const handlePriceChange = (stopId: string, newPriceString: string) => {
    // Allow the input to be empty or contain valid partial numbers (like "0.")
    if (newPriceString === '' || /^\d*\.?\d*$/.test(newPriceString)) {
        const newPrice = newPriceString === '' ? '' : newPriceString;
        setStopsData(stopsData.map(stop => 
          stop.id === stopId ? { ...stop, price: newPrice as any } : stop
        ));
    }
  };

  const handlePriceBlur = (stopId: string) => {
    const stopToUpdate = stopsData.find(s => s.id === stopId);
    if (stopToUpdate && (stopToUpdate.price === '' || isNaN(parseFloat(stopToUpdate.price as any)))) {
        setStopsData(stopsData.map(stop =>
            stop.id === stopId ? { ...stop, price: 0 } : stop
        ));
    }
  };
  
  const handleAddStop = (data: { label: string; price: number }) => {
    const newStop: Stop = {
        id: data.label.replace(/\s+/g, '-').toLowerCase(),
        label: data.label,
        price: data.price,
        // Approximate location for demo purposes.
        lat: 5.6 + Math.random() * 0.1,
        lng: -0.2 + Math.random() * 0.1,
    };
    setStopsData([...stopsData, newStop]);
    setIsAddStopOpen(false);
  }

  const handleRemoveStop = (stopToRemove: Stop) => {
    // If the stop is currently selected, uncheck it first
    if(selectedStops.some(s => s.id === stopToRemove.id)) {
        onStopsChange(stopToRemove, false);
    }
    // Then remove it from the list of available stops
    setStopsData(stopsData.filter(stop => stop.id !== stopToRemove.id));
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Waypoints className="h-5 w-5" />
          Stops Management
        </CardTitle>
        <CardDescription>Select the stops for your current trip and adjust fares.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <ScrollArea className="h-64">
          <div className="flex flex-col gap-1 pr-4">
            {stopsData.length > 0 ? stopsData.map((stop) => {
              const isPriceInvalid = !stop.price || parseFloat(stop.price as any) <= 0;
              return (
                  <div key={stop.id}>
                      <div  className="flex items-center gap-3 p-3 rounded-md bg-secondary">
                      <Checkbox 
                          id={stop.id}
                          checked={selectedStops.some(s => s.id === stop.id)}
                          onCheckedChange={(checked) => onStopsChange(stop, !!checked)}
                          disabled={disabled || isPriceInvalid}
                      />
                      <Label htmlFor={stop.id} className="font-medium flex-1">
                          {stop.label}
                      </Label>
                      <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">GH₵</span>
                          <Input
                              type="text"
                              value={stop.price}
                              onChange={(e) => handlePriceChange(stop.id, e.target.value)}
                              onBlur={() => handlePriceBlur(stop.id)}
                              className="w-24 h-8"
                              disabled={disabled}
                          />
                           <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-muted-foreground hover:text-destructive"
                              onClick={() => handleRemoveStop(stop)}
                              disabled={disabled}
                              aria-label={`Remove ${stop.label} stop`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                      </div>
                      </div>
                      {isPriceInvalid && !disabled && (
                          <p className="text-xs text-destructive text-right px-3 py-1">
                            Adjust from "0" before selecting this stop.
                          </p>
                      )}
                  </div>
              )
              }) : (
                <div className="text-center text-muted-foreground py-10">
                    <p>No stops added yet. Click below to add the first stop for your route.</p>
                </div>
              )
            }
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter>
          <Button variant="outline" className="w-full" onClick={() => setIsAddStopOpen(true)} disabled={disabled}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add New Stop
          </Button>
      </CardFooter>
      <Dialog open={isAddStopOpen} onOpenChange={setIsAddStopOpen}>
          <DialogContent>
              <DialogHeader>
                  <DialogTitle>Add New Stop</DialogTitle>
                  <DialogDescription>
                      Enter the details for the new stop below.
                  </DialogDescription>
              </DialogHeader>
              <AddStopForm onSubmit={handleAddStop} />
          </DialogContent>
      </Dialog>
    </Card>
  );
}
