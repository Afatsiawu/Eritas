
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
import { GoogleIcon } from './icons/google';
import { Loader2 } from 'lucide-react';
import { Separator } from './ui/separator';
import { useLanguage } from '@/context/language-context';

import { useUser } from '@/context/user-context';
import { GoogleAuthVisualizer } from './google-auth-visualizer';
import { API_BASE_URL } from '@/lib/api-config';

const signInSchema = z.object({
  email: z.string().email('Please enter a valid email.'),
  password: z.string().min(8, 'Password must be at least 8 characters.'),
});

const signUpSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Please enter a valid email.'),
  password: z.string().min(8, 'Password must be at least 8 characters.'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type AuthFormProps = {
  mode: 'signin' | 'signup';
  onSignInSuccess: () => void;
  onSignUpSuccess: () => void;
};

type FormValues = {
  firstName?: string;
  lastName?: string;
  email: string;
  password: string;
  confirmPassword?: string;
};

export function AuthForm({ mode, onSignInSuccess, onSignUpSuccess }: AuthFormProps) {
  const { toast } = useToast();
  const { t } = useLanguage();
  const { loginWithGoogle } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [isSocialLoading, setIsSocialLoading] = useState<null | 'google'>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(mode === 'signin' ? signInSchema : signUpSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const handleSubmit = (values: z.infer<typeof signInSchema> | z.infer<typeof signUpSchema>) => {
    if (mode === 'signin') {
      handleSignIn(values as z.infer<typeof signInSchema>);
    } else {
      handleSignUp(values as z.infer<typeof signUpSchema>);
    }
  };

  // Real sign-in function calling backend
  const handleSignIn = async (values: z.infer<typeof signInSchema>) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (!response.ok) {
        toast({
          variant: 'destructive',
          title: 'Login Failed',
          description: data.message || 'Invalid username or password',
        });
        setIsLoading(false);
        return;
      }

      // Update User Context with data from backend
      loginWithGoogle({
        uid: String(data.user.id),
        displayName: data.user.name || data.user.email.split('@')[0],
        email: data.user.email,
        photoURL: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=1000'
      });

      setIsLoading(false);
      toast({
        title: t('signInSuccessfulToastTitle'),
        description: t('signInSuccessfulToastDescription'),
      });
      onSignInSuccess();
    } catch (error) {
      setIsLoading(false);
      toast({
        variant: 'destructive',
        title: 'Connection Error',
        description: 'Could not connect to the authentication server.',
      });
    }
  };

  // Real sign-up function calling backend
  const handleSignUp = async (values: z.infer<typeof signUpSchema>) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: values.email,
          password: values.password,
          name: `${values.firstName} ${values.lastName}`,
          role: 'passenger'
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast({
          variant: 'destructive',
          title: 'Sign Up Failed',
          description: data.message || 'Could not create account',
        });
        setIsLoading(false);
        return;
      }

      setIsLoading(false);
      toast({
        title: t('signUpSuccessfulToastTitle'),
        description: 'Account created successfully! Please log in.',
      });

      onSignUpSuccess();
    } catch (error) {
      setIsLoading(false);
      toast({
        variant: 'destructive',
        title: 'Connection Error',
        description: 'Could not connect to the authentication server.',
      });
    }
  };

  // Social sign-in triggered
  const handleSocialSignIn = (provider: 'google') => {
    setIsSocialLoading(provider);
  };

  const handleGoogleComplete = (userData: { displayName: string, email: string, photoURL: string }) => {
    loginWithGoogle({
      uid: 'google-user-id',
      ...userData
    });

    setIsSocialLoading(null);
    toast({
      title: t('socialSignInToastTitle', { provider: 'Google' }),
      description: t('welcome'),
    });
    onSignInSuccess();
  };

  if (isSocialLoading === 'google') {
    return <GoogleAuthVisualizer onComplete={handleGoogleComplete} />;
  }

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          {mode === 'signup' && (
            <div className='grid grid-cols-2 gap-4'>
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('firstNameLabel')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('firstNamePlaceholder')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('lastNameLabel')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('lastNamePlaceholder')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('emailAddressLabel')}</FormLabel>
                <FormControl>
                  <Input placeholder={t('emailAddressPlaceholder')} {...field} />
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
                <FormLabel>{t('passwordLabel')}</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {mode === 'signup' && (
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('confirmPasswordLabel')}</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {mode === 'signin' ? t('signIn') : t('signUp')}
          </Button>
        </form>
      </Form>
      <div className="relative my-4">
        <Separator />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-xs text-muted-foreground">
          {t('orContinueWith')}
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4">
        <Button variant="outline" onClick={() => handleSocialSignIn('google')} disabled={!!isSocialLoading}>
          {isSocialLoading === 'google' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <GoogleIcon className="mr-2 h-4 w-4" />}
          Google
        </Button>
      </div>
    </>
  );
}
