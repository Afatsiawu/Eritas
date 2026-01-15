import Link from 'next/link';
import { Car } from 'lucide-react';
import { UserAvatar } from '../auth/user-avatar';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex items-center">
          <Link href="/home" className="flex items-center gap-2">
            <Car className="h-6 w-6 text-primary" />
            <span className="font-bold">AdminPowerPanel</span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <UserAvatar />
        </div>
      </div>
    </header>
  );
}
