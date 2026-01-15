'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  FastForward,
  Pause,
  Play,
  ListMusic,
  User,
  Music,
  Volume2,
  Rewind,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { useTrip } from '@/app/(app)/layout';
import { ScrollArea } from './ui/scroll-area';
import { Slider } from './ui/slider';

type Song = {
  id: string;
  title: string;
  artist: string;
  albumArt: string;
  addedBy: string;
  imageHint: string;
};

const initialPlaylist: Song[] = [];


export default function MusicPlayer() {
  const albumArt = PlaceHolderImages.find((img) => img.id === 'album-art');
  const [isPlaying, setIsPlaying] = useState(true);
  const [isPlaylistOpen, setIsPlaylistOpen] = useState(false);
  const [volume, setVolume] = useState([50]);
  const { tripStatus, spotifyCredentials } = useTrip();
  const [playlist, setPlaylist] = useState<Song[]>(initialPlaylist);

  useEffect(() => {
    const fetchQueue = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
        const res = await fetch(`${apiUrl}/spotify/queue/bus-1`);
        if (res.ok) {
          const data = await res.json();
          // Map backend data to local Song type
          const mapped: Song[] = data.map((item: any) => ({
            id: item.id.toString(),
            title: item.trackName,
            artist: item.artistName,
            albumArt: "https://via.placeholder.com/150", // Placeholder or fetch from Spotify if backend provides
            addedBy: item.requestedBy?.name || "Passenger",
            imageHint: "song cover"
          }));
          setPlaylist(mapped);
        }
      } catch (e) {
        console.error("Failed to fetch queue", e);
      }
    };

    // Poll every 5 seconds for demo
    const interval = setInterval(fetchQueue, 5000);
    fetchQueue();

    return () => clearInterval(interval);
  }, []);

  const isTripActive = tripStatus === 'In Progress';
  const isApiConfigured = !!spotifyCredentials.clientId;

  return (
    <>
      <Card className="lg:col-span-2">
        <CardHeader className="flex flex-row items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <ListMusic />
              Passenger Playlist
            </CardTitle>
            <CardDescription>Powered by Spotify</CardDescription>
          </div>
          <Button variant="outline" onClick={() => setIsPlaylistOpen(true)} disabled={!isApiConfigured || !isTripActive}>
            View Playlist
          </Button>
        </CardHeader>

        {isApiConfigured ? (
          <CardContent className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-lg overflow-hidden shrink-0">
              {albumArt && (
                <Image
                  src={albumArt.imageUrl}
                  alt="Album art"
                  fill
                  className="object-cover"
                  data-ai-hint={albumArt.imageHint}
                />
              )}
            </div>
            <div className="w-full space-y-3 text-center sm:text-left">
              <div>
                <p className="text-2xl font-bold">As It Was</p>
                <p className="text-muted-foreground">Harry Styles</p>
              </div>
              <div className="space-y-1">
                <Progress value={35} className="h-2" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>1:02</span>
                  <span>2:47</span>
                </div>
              </div>
              <div className="flex items-center justify-center sm:justify-start gap-4">
                <Button variant="ghost" size="icon">
                  <Rewind className="h-6 w-6" />
                </Button>
                <Button size="icon" className="h-14 w-14" onClick={() => setIsPlaying(!isPlaying)}>
                  {isPlaying ? <Pause className="h-7 w-7" /> : <Play className="h-7 w-7" />}
                </Button>
                <Button variant="ghost" size="icon">
                  <FastForward className="h-6 w-6" />
                </Button>
                <div className="flex items-center gap-2 flex-1 max-w-[150px]">
                  <Volume2 className="h-5 w-5 text-muted-foreground" />
                  <Slider
                    defaultValue={[50]}
                    max={100}
                    step={1}
                    value={volume}
                    onValueChange={setVolume}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        ) : (
          <CardContent className="text-center py-10">
            <Music className="h-12 w-12 mx-auto text-muted-foreground" />
            <p className="mt-4 font-semibold">Spotify Credentials Required</p>
            <p className="text-muted-foreground text-sm">
              Please go to the{' '}
              <Button variant="link" className="p-0 h-auto" asChild>
                <Link href="/support">Support & Safety</Link>
              </Button>
              {' '}page to add your credentials.
            </p>
          </CardContent>
        )}
      </Card>
      <Dialog open={isPlaylistOpen} onOpenChange={setIsPlaylistOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Passenger Playlist Queue</DialogTitle>
            <DialogDescription>
              Songs added by passengers for this trip.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] -mx-6 px-6">
            {playlist.length > 0 ? (
              <ul className="space-y-4 py-2">
                {playlist.map(song => (
                  <li key={song.id} className="flex items-center gap-4">
                    <div className="relative w-16 h-16 rounded-md overflow-hidden shrink-0">
                      <Image src={song.albumArt} alt={`${song.title} album art`} fill className="object-cover" data-ai-hint={song.imageHint} />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">{song.title}</p>
                      <p className="text-sm text-muted-foreground">{song.artist}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1"><User className="h-3 w-3" /> Added by {song.addedBy}</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-10">
                <p className="text-muted-foreground">No songs have been added yet.</p>
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}
