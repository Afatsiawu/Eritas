'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { KeyRound } from 'lucide-react';

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
import { useToast } from '@/hooks/use-toast';

const FormSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email.' }),
  pin: z.string().length(6, { message: 'Your PIN must be 6 digits.' }),
});

export default function LoginForm() {
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: '',
      pin: '',
    },
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.email, password: data.pin }),
      });

      const result = await response.json();

      if (!response.ok) {
        toast({
          title: 'Login Failed',
          description: result.message || 'Check your credentials.',
          variant: 'destructive'
        });
        return;
      }

      // Save user session
      localStorage.setItem('driver_session', JSON.stringify(result.user));

      toast({ title: 'Login Successful', description: 'Redirecting to dashboard...' });
      router.push('/dashboard');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Could not connect to the authentication server.',
        variant: 'destructive'
      });
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Driver Login</CardTitle>
        <CardDescription>Enter your 6-digit PIN to continue.</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input placeholder="driver@eritas.app" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="pin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Secure PIN (as Password)</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input
                        type="password"
                        inputMode="numeric"
                        maxLength={6}
                        placeholder="••••••"
                        className="pl-10 text-lg tracking-[0.5em]"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex-col gap-4">
            <Button type="submit" className="w-full text-lg py-6" size="lg">
              Login
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
