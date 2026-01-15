import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

export default function AccessDeniedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle className="mt-4 text-2xl font-bold">Access Denied</CardTitle>
          <CardDescription>
            You do not have the required permissions to view this page.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Please contact an administrator if you believe this is a mistake.
          </p>
          <Button asChild className="mt-6">
            <Link href="/home">Go to Home</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
