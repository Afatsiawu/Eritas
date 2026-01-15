'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Car, Home, Shield, LogOut } from 'lucide-react';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { UserAvatar } from '../auth/user-avatar';
import { cn } from '@/lib/utils';
import { useAuth } from '../auth/auth-provider';
import { Button } from '../ui/button';
import { useToast } from '@/hooks/use-toast';


export function AdminSidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();
  const { toast } = useToast();

  const isActive = (path: string) => {
    return pathname === path;
  };

  const handleLogout = () => {
    logout();
    toast({ title: 'Logged out successfully.' });
  };

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <Link href="/home" className="flex items-center gap-2">
             <Car className="h-6 w-6 text-primary" />
             <span className="font-semibold text-lg">AdminPowerPanel</span>
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton href="/admin" isActive={isActive('/admin')}>
                <Home />
                Dashboard
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton href="/admin/make-admin" isActive={isActive('/admin/make-admin')}>
                <Shield />
                Make Admin
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="flex flex-col gap-2">
            <UserAvatar />
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Log Out
            </Button>
        </SidebarFooter>
      </Sidebar>
    </SidebarProvider>
  );
}
