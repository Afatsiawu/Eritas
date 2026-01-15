'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

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
import { useToast } from '@/hooks/use-toast';
import { Loader2, ClipboardCopy } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { generateDriverCode } from '@/lib/mock-api';
import type { GenerateDriverCodeInput } from '@/lib/definitions';

const formSchema = z.object({
  fullName: z.string().min(3, 'Full name must be at least 3 characters.'),
  email: z.string().email('Please enter a valid email.'),
  licenseNumber: z.string().min(1, 'License number is required.'),
  ghanaCardNumber: z.string().min(1, 'Ghana card number is required.'),
  busPlateNumber: z.string().min(1, 'Bus plate number is required.'),
});

type FormValues = z.infer<typeof formSchema>;

export function DriverCreationForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: '',
      email: '',
      licenseNumber: '',
      ghanaCardNumber: '',
      busPlateNumber: '',
    },
  });

  const onSubmit = async (values: GenerateDriverCodeInput) => {
    setIsLoading(true);
    setGeneratedCode(null);
    try {
      const result = await generateDriverCode(values);
      if (result.registrationCode) {
        setGeneratedCode(result.registrationCode);
        toast({
          title: 'Registration Code Generated',
          description: `The code for ${values.fullName} is ${result.registrationCode}.`,
        });
        form.reset();
      } else {
        throw new Error("Failed to get registration code from backend.");
      }
      
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'An error occurred.',
        description: error.message || 'Failed to generate driver registration code.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!generatedCode) return;
    navigator.clipboard.writeText(generatedCode);
    toast({ title: 'Copied to clipboard!' });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Driver</CardTitle>
        <CardDescription>Generate a one-time registration code for a new driver.</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
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
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="driver@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="licenseNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>License Number</FormLabel>
                  <FormControl>
                    <Input placeholder="B123456" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="ghanaCardNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ghana Card Number</FormLabel>
                  <FormControl>
                    <Input placeholder="GHA-123456789-0" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="busPlateNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bus Plate Number</FormLabel>
                  <FormControl>
                    <Input placeholder="GT-1234-22" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex-col items-start gap-4">
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Generate Code
            </Button>
            {generatedCode && (
              <div className="flex w-full items-center gap-2 rounded-md border bg-muted p-3">
                <span className="flex-1 font-mono text-center text-lg tracking-widest">{generatedCode}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={copyToClipboard}
                  aria-label="Copy code"
                >
                  <ClipboardCopy className="h-5 w-5" />
                </Button>
              </div>
            )}
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
