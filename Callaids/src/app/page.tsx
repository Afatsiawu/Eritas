import Link from 'next/link';
import AppLogo from '@/components/app-logo';
import LoginForm from '@/components/login-form';
import { Button } from '@/components/ui/button';
import { Bus, Check, Flag, MapPin, Ticket } from 'lucide-react';

export default function LoginPage() {
  return (
    <main className="relative flex flex-col items-center justify-center min-h-screen bg-background p-4 md:p-8 overflow-hidden">
      <div className="absolute inset-0 z-0 opacity-10 dark:opacity-20">
        {/* Many, smaller, scattered, and visible icons */}
        <MapPin className="absolute top-[20%] right-[10%] h-20 w-20 text-primary/50 rotate-6 animate-pulse" />
        <Flag className="absolute bottom-[15%] left-[20%] h-14 w-14 text-primary/50 rotate-12 animate-pulse delay-500" />
        <Bus className="absolute bottom-[45%] left-[5%] h-24 w-24 text-primary/50 -rotate-6 animate-pulse delay-200" />
        <Ticket className="absolute bottom-[10%] right-[15%] h-16 w-16 text-primary/50 -rotate-12 animate-pulse delay-700" />
        <Check className="absolute top-[50%] right-[40%] h-14 w-14 text-primary/50 rotate-6 animate-pulse" />

        {/* Extra smaller icons */}
        <Bus className="absolute top-[5%] right-[35%] h-12 w-12 text-primary/50 rotate-12 animate-pulse delay-300" />
        <Ticket className="absolute top-[60%] left-[30%] h-10 w-10 text-primary/50 -rotate-6 animate-pulse delay-600" />
        <MapPin className="absolute bottom-[5%] left-[45%] h-16 w-16 text-primary/50 rotate-3 animate-pulse delay-900" />
        <Flag className="absolute top-[75%] right-[25%] h-12 w-12 text-primary/50 rotate-12 animate-pulse" />
        <Check className="absolute top-[5%] left-[5%] h-20 w-20 text-primary/50 rotate-6 animate-pulse delay-1200" />
        
        {/* More icons */}
        <Ticket className="absolute top-[35%] left-[40%] h-12 w-12 text-primary/50 rotate-12 animate-pulse delay-100" />
        <Bus className="absolute bottom-[25%] right-[30%] h-16 w-16 text-primary/50 -rotate-12 animate-pulse delay-400" />
        <MapPin className="absolute top-[80%] left-[10%] h-14 w-14 text-primary/50 rotate-6 animate-pulse delay-800" />
      </div>

      <div className="relative z-10 w-full max-w-sm">
        <div className="mb-8 text-center">
          <AppLogo />
        </div>
        <LoginForm />
        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Button variant="link" asChild className="p-0 h-auto">
              <Link href="/signup">Use your enrollment code</Link>
            </Button>
          </p>
        </div>
      </div>
    </main>
  );
}
