
'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { AuthForm } from '@/components/auth-form';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { SignupSlideshow } from '@/components/signup-slideshow';
import { IconMosaicBackground } from '@/components/icon-mosaic-background';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLanguage } from '@/context/language-context';
import { useUser } from '@/context/user-context';

export default function LoginPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const { user, setUser } = useUser();
  const [activeTab, setActiveTab] = useState('signin');
  const [showSlideshow, setShowSlideshow] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  useEffect(() => {
    if (user && user.onboarded === false) {
      setShowSlideshow(true);
    }
  }, [user]);

  const handleSignInSuccess = () => {
    // If not onboarded, the other useEffect will catch it
    if (user && user.onboarded === true) {
      router.push('/home');
    }
  }

  const handleSignUpSuccess = () => {
    setActiveTab('signin');
  }

  const handleFinishSlideshow = async () => {
    if (user) {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/auth/onboarding`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.uid }),
        });

        // Update local user state
        setUser({ ...user, onboarded: true });
        localStorage.setItem('studio_user', JSON.stringify({ ...user, onboarded: true }));
      } catch (error) {
        console.error('Failed to update onboarding status:', error);
      }
    }
    router.push('/home');
  }

  if (showSlideshow) {
    return <SignupSlideshow onFinish={handleFinishSlideshow} />;
  }

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }


  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background p-4 overflow-hidden">
      <IconMosaicBackground />
      <div className="w-full max-w-md space-y-6 z-10">
        <div className="text-center">
          <Image
            src="https://i.postimg.cc/htqrt1Dn/Screenshot-2025-11-06-192038-removebg-preview-(1).png"
            alt="Eritas Transport Company Logo"
            width={150}
            height={75}
            priority
            className="mx-auto object-contain"
          />
          <h1 className="text-2xl font-bold mt-4">Welcome Back</h1>
          <p className="text-muted-foreground">
            Sign in or create an account to continue
          </p>
        </div>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">{t('signIn')}</TabsTrigger>
            <TabsTrigger value="signup">{t('signUp')}</TabsTrigger>
          </TabsList>
          <TabsContent value="signin">
            <div className="rounded-lg border bg-background/80 backdrop-blur-sm p-6 shadow-sm mt-4">
              <AuthForm mode="signin" onSignInSuccess={handleSignInSuccess} onSignUpSuccess={handleSignUpSuccess} />
            </div>
          </TabsContent>
          <TabsContent value="signup">
            <div className="rounded-lg border bg-background/80 backdrop-blur-sm p-6 shadow-sm mt-4">
              <AuthForm mode="signup" onSignInSuccess={handleSignInSuccess} onSignUpSuccess={handleSignUpSuccess} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
