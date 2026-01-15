'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Phone,
  MessageCircle,
  FileUp,
  CheckSquare,
  AlertTriangle,
  ShieldHalf,
  Wrench,
  CheckCircle2,
  XCircle,
  Loader,
  Circle,
  KeyRound,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getTrafficAwareRouteSuggestions } from '@/ai/flows/traffic-aware-route-suggestions';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';
import { Network } from '@capacitor/network';
import { Camera } from '@capacitor/camera';
import { useToast } from '@/hooks/use-toast';
import { useTrip, type DiagnosticStatus, type DiagnosticKey, type Diagnostics, type SpotifyCredentials } from '../layout';

const statusIcons: Record<DiagnosticStatus, React.ReactNode> = {
  pending: <Circle className="h-5 w-5 text-muted-foreground" />,
  checking: <Loader className="h-5 w-5 text-amber-500 animate-spin" />,
  success: <CheckCircle2 className="h-5 w-5 text-green-500" />,
  error: <XCircle className="h-5 w-5 text-destructive" />,
};

const statusText: Record<DiagnosticStatus, string> = {
  pending: 'Pending',
  checking: 'Checking...',
  success: 'Operational',
  error: 'Error',
};

const errorDetails: Record<
  DiagnosticKey,
  { title: string; description: string }
> = {
  gps: {
    title: 'GPS Signal Error',
    description:
      "The application cannot access your device's location. Please ensure location services are enabled for your browser and this app, then try again.",
  },
  network: {
    title: 'Network Connection Error',
    description:
      'The application cannot connect to the internet. Please check your network connection and try again.',
  },
  qrScanner: {
    title: 'QR Scanner Access Error',
    description:
      "The application cannot access the camera. Please ensure you have granted camera permissions for this site in your browser's settings.",
  },
  aiService: {
    title: 'AI Service Error',
    description:
      'Could not connect to the AI routing service. This may be a temporary issue. Please check your network or try again later.',
  },
};

const DIAGNOSTIC_COOLDOWN_SECONDS = 60;

export default function SupportPage() {
  const { checklist, setChecklist, diagnostics, setDiagnostics, spotifyCredentials, setSpotifyCredentials } = useTrip();
  const [isChecking, setIsChecking] = useState(false);
  const [selectedError, setSelectedError] = useState<DiagnosticKey | null>(
    null
  );
  const [cooldown, setCooldown] = useState(0);
  const [keyInputValues, setKeyInputValues] = useState<SpotifyCredentials>(spotifyCredentials);
  const { toast } = useToast();

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleChecklistChange = (id: string, checked: boolean) => {
    setChecklist(
      checklist.map((item) => (item.id === id ? { ...item, checked } : item))
    );
  };

  const handleSaveApiKeys = () => {
    setSpotifyCredentials(keyInputValues);
    toast({ title: 'Spotify Credentials Saved', description: 'Your Spotify credentials have been securely stored for this session.' });
  }

  const handleKeyInputChange = (field: keyof SpotifyCredentials, value: string) => {
    setKeyInputValues(prev => ({ ...prev, [field]: value }));
  };

  const checkGps = async (): Promise<DiagnosticStatus> => {
    if (!Capacitor.isNativePlatform()) {
      return new Promise((resolve) => {
        if (!navigator.geolocation) {
          resolve('error');
          return;
        }
        navigator.geolocation.getCurrentPosition(
          () => resolve('success'),
          () => resolve('error'),
          { timeout: 5000 }
        );
      });
    }

    try {
      // First, check permissions
      const permissions = await Geolocation.checkPermissions();
      if (permissions.location !== 'granted') {
        const request = await Geolocation.requestPermissions();
        if (request.location !== 'granted') {
          return 'error';
        }
      }
      // If permission is granted, try to get position
      await Geolocation.getCurrentPosition({ timeout: 5000 });
      return 'success';
    } catch (error) {
      console.error("Capacitor GPS check failed", error);
      return 'error';
    }
  };

  const checkNetwork = async (): Promise<DiagnosticStatus> => {
    if (!Capacitor.isNativePlatform()) {
      return navigator.onLine ? 'success' : 'error';
    }

    const status = await Network.getStatus();
    return status.connected ? 'success' : 'error';
  };

  const checkQrScanner = async (): Promise<DiagnosticStatus> => {
    if (!Capacitor.isNativePlatform()) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        stream.getTracks().forEach((track) => track.stop());
        return 'success';
      } catch (error) {
        return 'error';
      }
    }

    try {
      const permissions = await Camera.checkPermissions();
      if (permissions.camera !== 'granted') {
        const request = await Camera.requestPermissions();
        if (request.camera !== 'granted') {
          return 'error';
        }
      }
      return 'success';
    } catch (error) {
      console.error("Capacitor Camera permission check failed", error);
      return 'error';
    }
  };

  const checkAiService = async (): Promise<DiagnosticStatus> => {
    try {
      await getTrafficAwareRouteSuggestions({
        currentBusLocation: 'test',
        upcomingStops: ['test'],
      });
      return 'success';
    } catch (error) {
      return 'error';
    }
  };

  const diagnosticFunctions: Record<DiagnosticKey, () => Promise<DiagnosticStatus>> = {
    gps: checkGps,
    network: checkNetwork,
    qrScanner: checkQrScanner,
    aiService: checkAiService,
  };

  const playBeep = () => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) {
        console.warn("Browser does not support AudioContext");
        return;
      }
      const audioCtx = new AudioContext();

      let beepCount = 0;
      const interval = setInterval(() => {
        if (beepCount >= 5) {
          clearInterval(interval);
          return;
        }

        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(440, audioCtx.currentTime);
        gainNode.gain.setValueAtTime(1.0, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.1);

        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.1);

        beepCount++;
      }, 300);

    } catch (e) {
      console.error("Could not play beep sound", e);
    }
  };

  const runDiagnostics = async () => {
    if (isChecking || cooldown > 0) return;
    setIsChecking(true);
    setCooldown(DIAGNOSTIC_COOLDOWN_SECONDS);
    setDiagnostics({
      gps: 'checking',
      network: 'checking',
      qrScanner: 'checking',
      aiService: 'checking',
    });

    const checkPromises = [
      checkGps(),
      checkNetwork(),
      checkQrScanner(),
      checkAiService(),
    ];

    const [gps, network, qrScanner, aiService] = await Promise.all(checkPromises);
    const results = { gps, network, qrScanner, aiService };

    setIsChecking(false);
    setDiagnostics(results);

    playBeep();
  };

  const handleItemClick = (key: DiagnosticKey) => {
    if (diagnostics[key] === 'error') {
      setSelectedError(key);
    }
  }

  const handleRetryCheck = async () => {
    if (!selectedError) return;

    const keyToRetry = selectedError;
    setDiagnostics(prev => ({ ...prev, [keyToRetry]: 'checking' }));
    setSelectedError(null);

    const result = await diagnosticFunctions[keyToRetry]();
    setDiagnostics(prev => ({ ...prev, [keyToRetry]: result }));
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Support & Safety</h1>
        <p className="text-muted-foreground">
          Tools for incident reporting, diagnostics, and emergency contact.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-6 w-6 text-destructive" />
                Emergency Contact
              </CardTitle>
              <CardDescription>
                Immediately alert the control center in an emergency.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="destructive"
                className="w-full text-lg py-8"
                size="lg"
              >
                <Phone className="mr-2 h-6 w-6" />
                Contact Control Center
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <KeyRound className="h-6 w-6 text-primary" />
                Spotify Credentials
              </CardTitle>
              <CardDescription>
                Enter your Spotify Web Playback SDK credentials here.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="spotify-client-id">Client ID</Label>
                <Input
                  id="spotify-client-id"
                  type="text"
                  placeholder="Enter your Spotify Client ID"
                  value={keyInputValues.clientId}
                  onChange={(e) => handleKeyInputChange('clientId', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="spotify-client-secret">Client Secret</Label>
                <Input
                  id="spotify-client-secret"
                  type="password"
                  placeholder="Enter your Spotify Client Secret"
                  value={keyInputValues.clientSecret}
                  onChange={(e) => handleKeyInputChange('clientSecret', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="spotify-redirect-uri">Redirect URI</Label>
                <Input
                  id="spotify-redirect-uri"
                  type="text"
                  placeholder="e.g., https://your-app.onrender.com/callback"
                  value={keyInputValues.redirectUri}
                  onChange={(e) => handleKeyInputChange('redirectUri', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="spotify-player-name">Player Name</Label>
                <Input
                  id="spotify-player-name"
                  type="text"
                  placeholder="e.g., TransitPro Player"
                  value={keyInputValues.playerName}
                  onChange={(e) => handleKeyInputChange('playerName', e.target.value)}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveApiKeys}>
                Save Credentials
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckSquare className="h-6 w-6 text-primary" />
                Safety Checklist
              </CardTitle>
              <CardDescription>
                Quick reminders for pre-trip safety checks.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {checklist.map((item) => (
                <div key={item.id} className="flex items-center space-x-3 p-2 rounded-md hover:bg-secondary">
                  <Checkbox
                    id={item.id}
                    checked={item.checked}
                    onCheckedChange={(checked) =>
                      handleChecklistChange(item.id, !!checked)
                    }
                  />
                  <Label
                    htmlFor={item.id}
                    className={cn(
                      'text-sm font-medium leading-none cursor-pointer',
                      item.checked && 'line-through text-muted-foreground'
                    )}
                  >
                    {item.label}
                  </Label>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="h-6 w-6 text-primary" />
                System Diagnostics
              </CardTitle>
              <CardDescription>
                Check the status of key application services.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {(Object.keys(diagnostics) as DiagnosticKey[]).map((key) => (
                  <li
                    key={key}
                    onClick={() => handleItemClick(key)}
                    className={cn(
                      'flex items-center justify-between p-3 rounded-lg bg-secondary',
                      diagnostics[key] === 'error' && 'cursor-pointer hover:bg-destructive/10'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      {statusIcons[diagnostics[key]]}
                      <span className="font-medium capitalize">{key.replace('qr', 'QR ').replace('ai', 'AI ')}</span>
                    </div>
                    <span className={cn(
                      'text-sm font-medium',
                      diagnostics[key] === 'success' && 'text-green-600',
                      diagnostics[key] === 'error' && 'text-destructive',
                      diagnostics[key] === 'checking' && 'text-amber-600',
                      diagnostics[key] === 'pending' && 'text-muted-foreground',
                    )}>
                      {statusText[diagnostics[key]]}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter className="flex-col gap-2">
              <Button
                onClick={runDiagnostics}
                className="w-full"
                disabled={isChecking || cooldown > 0}
              >
                {isChecking ? 'Running...' : cooldown > 0 ? `Wait ${cooldown}s` : 'Run Diagnostics'}
              </Button>
              {isChecking && (
                <p className="text-xs text-muted-foreground">This may take up to 30 seconds.</p>
              )}
            </CardFooter>
          </Card>
        </div>
      </div>

      <Dialog open={!!selectedError} onOpenChange={(isOpen) => !isOpen && setSelectedError(null)}>
        <DialogContent>
          {selectedError && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2"><AlertTriangle className="text-destructive" /> {errorDetails[selectedError].title}</DialogTitle>
                <DialogDescription>
                  {errorDetails[selectedError].description}
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setSelectedError(null)}>Close</Button>
                <Button onClick={handleRetryCheck}>Retry Check</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

    </div>
  );
}
