import Link from 'next/link';
import AppLogo from '@/components/app-logo';
import SignupForm from '@/components/signup-form';
import { Button } from '@/components/ui/button';

export default function SignupPage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-background p-4 md:p-8">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <AppLogo />
        </div>
        <SignupForm />
        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{' '}
            <Button variant="link" asChild className="p-0 h-auto">
              <Link href="/">Login here</Link>
            </Button>
          </p>
        </div>
      </div>
    </main>
  );
}
