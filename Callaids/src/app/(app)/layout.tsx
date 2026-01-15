'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  BarChart3,
  BusFront,
  LayoutDashboard,
  Map,
  Music,
  QrCode,
  ShieldHalf,
  UserCircle,
  LogOut,
} from 'lucide-react';
import { createContext, useContext, useState, useMemo, useEffect } from 'react';
import Image from 'next/image';

import AppLogo from '@/components/app-logo';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarInset,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Separator } from '@/components/ui/separator';
import type { Stop } from '@/components/stops-management';
import { ScrollArea } from '@/components/ui/scroll-area';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/trip', label: 'Live Trip', icon: Map },
  { href: '/boarding', label: 'Boarding', icon: QrCode },
  { href: '/earnings', label: 'Earnings', icon: BarChart3 },
  { href: '/bus-dj', label: 'Bus DJ', icon: Music },
  { href: '/support', label: 'Support & Safety', icon: ShieldHalf },
];

export type TripStatus = 'Not Started' | 'In Progress' | 'Ended';

// Haversine distance calculation
function getDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
}

export type ChecklistItem = {
  id: string;
  label: string;
  checked: boolean;
};

const initialChecklist: ChecklistItem[] = [
  { id: 'tires', label: 'Check tire pressure', checked: false },
  { id: 'brakes', label: 'Verify brake functionality', checked: false },
  { id: 'lights', label: 'Confirm all lights are working', checked: false },
  { id: 'leaks', label: 'Check for any fluid leaks', checked: false },
];


export type DiagnosticStatus = 'pending' | 'checking' | 'success' | 'error';
export type DiagnosticKey = 'gps' | 'network' | 'qrScanner' | 'aiService';
export type Diagnostics = Record<DiagnosticKey, DiagnosticStatus>;
export const initialDiagnostics: Diagnostics = {
  gps: 'pending',
  network: 'pending',
  qrScanner: 'pending',
  aiService: 'pending',
};

export type SpotifyCredentials = {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  playerName: string;
};


type TripContextType = {
  tripStatus: TripStatus;
  setTripStatus: (status: TripStatus) => void;
  selectedStops: Stop[];
  setSelectedStops: (stops: Stop[]) => void;
  routeStops: Stop[];
  checklist: ChecklistItem[];
  setChecklist: (checklist: ChecklistItem[]) => void;
  isChecklistComplete: boolean;
  diagnostics: Diagnostics;
  setDiagnostics: (diagnostics: Diagnostics) => void;
  areDiagnosticsComplete: boolean;
  spotifyCredentials: SpotifyCredentials;
  setSpotifyCredentials: (credentials: SpotifyCredentials) => void;
  passengerCount: number;
  setPassengerCount: (count: number) => void;
  seatCapacity: number;
};

const TripContext = createContext<TripContextType | null>(null);

export const useTrip = () => {
  const context = useContext(TripContext);
  if (!context) {
    throw new Error('useTrip must be used within a TripProvider');
  }
  return context;
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const driverPhoto = PlaceHolderImages.find((img) => img.id === 'driver-photo');

  const [tripStatus, setTripStatus] = useState<TripStatus>('Not Started');
  const [selectedStops, setSelectedStops] = useState<Stop[]>([]);
  const [checklist, setChecklist] = useState<ChecklistItem[]>(initialChecklist);
  const [diagnostics, setDiagnostics] = useState<Diagnostics>(initialDiagnostics);
  const [spotifyCredentials, setSpotifyCredentials] = useState<SpotifyCredentials>({
    clientId: '',
    clientSecret: '',
    redirectUri: '',
    playerName: 'TransitPro Player',
  });
  const [passengerCount, setPassengerCount] = useState(0);
  const seatCapacity = 22;
  
  // Simulate the bus's current location (e.g., near Kaneshie Market)
  const busLocation = { lat: 5.555, lng: -0.245 };

  useEffect(() => {
    if (tripStatus === 'In Progress') {
      // Simulate initial passenger count when trip starts
      setPassengerCount(18); 
    } else {
      setPassengerCount(0);
    }
  }, [tripStatus]);
  
  const routeStops = useMemo(() => {
    if (selectedStops.length === 0) {
      return [];
    }
    
    // The first selected stop is the destination.
    const destination = selectedStops[0];
    
    // All other stops are intermediate.
    const intermediateStops = selectedStops.slice(1);

    // Sort intermediate stops by distance from the bus.
    const sortedIntermediateStops = [...intermediateStops].sort((a, b) => {
      const distanceA = getDistance(busLocation.lat, busLocation.lng, a.lat, a.lng);
      const distanceB = getDistance(busLocation.lat, busLocation.lng, b.lat, b.lng);
      return distanceA - distanceB;
    });

    // The final route is the sorted intermediate stops followed by the destination.
    return [...sortedIntermediateStops, destination];
  }, [selectedStops, busLocation.lat, busLocation.lng]);

  const isChecklistComplete = useMemo(() => checklist.every(item => item.checked), [checklist]);
  
  const areDiagnosticsComplete = useMemo(() => {
    return (Object.values(diagnostics) as DiagnosticStatus[]).every(status => status === 'success');
  }, [diagnostics]);


  const tripContextValue = {
    tripStatus,
    setTripStatus,
    selectedStops,
    setSelectedStops,
    routeStops,
    checklist,
    setChecklist,
    isChecklistComplete,
    diagnostics,
    setDiagnostics,
    areDiagnosticsComplete,
    spotifyCredentials,
    setSpotifyCredentials,
    passengerCount,
    setPassengerCount,
    seatCapacity,
  };
  
  const handleLogout = async () => {
    router.push('/');
  }

  return (
    <TripContext.Provider value={tripContextValue}>
      <SidebarProvider>
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center">
              <div className="group-data-[collapsible=icon]:hidden">
                <AppLogo />
              </div>
               <BusFront className="h-7 w-7 text-primary hidden group-data-[collapsible=icon]:block" />
            </div>
          </SidebarHeader>

          <SidebarContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname.startsWith(item.href)}
                    tooltip={item.label}
                    size="lg"
                  >
                    <Link href={item.href}>
                      <item.icon />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>

          <SidebarFooter className="group-data-[collapsible=icon]:p-0">
            <Separator className="my-2" />
             <SidebarMenu>
                 <SidebarMenuItem>
                    <SidebarMenuButton
                        onClick={handleLogout}
                        tooltip="Logout"
                        size="lg"
                        className="text-red-500 hover:bg-red-500/10 hover:text-red-500"
                    >
                        <LogOut />
                        <span>Logout</span>
                    </SidebarMenuButton>
                 </SidebarMenuItem>
             </SidebarMenu>
            <Separator className="mt-2 group-data-[collapsible=icon]:hidden" />
            <div className="flex items-center gap-3 p-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:py-2">
              <Avatar className="h-10 w-10">
                {driverPhoto && <AvatarImage src={driverPhoto.imageUrl} alt="Driver" data-ai-hint={driverPhoto.imageHint} />}
                <AvatarFallback>{'D'}</AvatarFallback>
              </Avatar>
              <div className="group-data-[collapsible=icon]:hidden">
                <p className="font-semibold">Driver</p>
                <p className="text-xs text-muted-foreground">123456</p>
              </div>
            </div>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset>
          <header className="flex items-center justify-between p-4 border-b bg-card sticky top-0 z-10">
            {/* Mobile Sidebar Trigger */}
            <div className="md:hidden">
              <SidebarTrigger />
            </div>

            {/* Spacer for desktop to balance the header */}
            <div className="hidden md:block w-7 h-7"></div>

            {/* Centered Logo */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
               <Image src="https://i.postimg.cc/Dz9gmQvm/Screenshot-2025-10-29-154152-removebg-preview-removebg-preview.png" alt="Header Logo" width={100} height={30} />
            </div>

            {/* Profile Button */}
            <Button variant="ghost" size="icon" asChild>
              <Link href="/profile">
                <UserCircle className="h-6 w-6" />
                <span className="sr-only">Profile</span>
              </Link>
            </Button>
          </header>
          <ScrollArea className="flex-1 h-[calc(100vh-65px)]">
            <main className="p-4 sm:p-6 lg:p-8">
                {children}
            </main>
          </ScrollArea>
        </SidebarInset>
      </SidebarProvider>
    </TripContext.Provider>
  );
}
