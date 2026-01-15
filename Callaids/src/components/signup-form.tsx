'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Bus, CheckCircle, ChevronRight, User, Waypoints } from 'lucide-react';

import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';

const FormSchema = z.object({
  code: z
    .string()
    .min(6, { message: 'Enrollment code must be at least 6 characters.' }),
  email: z.string().email(),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.'}),
});

type DriverData = {
  name: string;
  busPlate: string;
  busModel: string;
  seatCapacity: number;
};

export default function SignupForm() {
  const [driverData, setDriverData] = useState<DriverData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  const router = useRouter();
  const driverPhoto = PlaceHolderImages.find(
    (img) => img.id === 'driver-photo'
  );

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      code: '',
      email: '',
      password: '',
    },
  });

  async function onVerifyCode(data: z.infer<typeof FormSchema>) {
    setIsLoading(true);
    // Simulate API call to verify enrollment code
    setTimeout(() => {
        if(data.code.toUpperCase() === 'TRANSITPRO24') {
            setDriverData({
                name: 'John Doe',
                busPlate: 'GT 1234-24',
                busModel: 'Toyota Coaster',
                seatCapacity: 22,
            });
            setStep(2);
        } else {
            form.setError('code', {
              type: 'manual',
              message: 'Invalid or already used enrollment code.',
            });
        }
        setIsLoading(false);
    }, 1000);
  }

  async function handleConfirm() {
    setIsLoading(true);
    // Simulate account creation and login
    setTimeout(() => {
        router.push('/dashboard');
        setIsLoading(false);
    }, 1000);
  }

  if (step === 2 && driverData) {
    return (
      <Card>
        <CardHeader className="items-center text-center">
          <CheckCircle className="h-12 w-12 text-green-500 mb-2" />
          <CardTitle className="text-2xl">Enrollment Confirmed</CardTitle>
          <CardDescription>
            You are assigned to Bus {driverData.busPlate}.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4 p-4 rounded-lg border bg-secondary/50">
            <Avatar className="h-16 w-16">
              {driverPhoto && <AvatarImage src={driverPhoto.imageUrl} alt={driverData.name} data-ai-hint={driverPhoto.imageHint} />}
              <AvatarFallback>{driverData.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-bold text-lg">{driverData.name}</p>
              <Badge variant="outline">Driver</Badge>
            </div>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground flex items-center gap-2"><Bus className="h-4 w-4" />Bus Details</span>
              <span className="font-medium">{driverData.busModel} ({driverData.busPlate})</span>
            </div>
            <Separator />
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground flex items-center gap-2"><User className="h-4 w-4" />Seat Capacity</span>
              <span className="font-medium">{driverData.seatCapacity} seats</span>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleConfirm} className="w-full text-lg py-6" size="lg" disabled={isLoading}>
            {isLoading ? 'Finalizing...' : 'Create Account & Proceed'} <ChevronRight className="ml-2 h-5 w-5" />
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Driver Enrollment</CardTitle>
        <CardDescription>
          Enter your unique enrollment code and account details to get started.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onVerifyCode)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Enrollment Code</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., TRANSITPRO24"
                      {...field}
                      className="text-lg"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      {...field}
                      className="text-lg"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Choose a Password / PIN</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Choose a secure password or PIN"
                      {...field}
                      className="text-lg"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             {form.formState.errors.root && <FormMessage>{form.formState.errors.root.message}</FormMessage>}
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full text-lg py-6" size="lg" disabled={isLoading}>
              {isLoading ? 'Verifying...' : 'Verify Code & Create Account'}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
