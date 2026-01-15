import MusicPlayer from "@/components/music-player";

export default function BusDjPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Bus DJ</h1>
        <p className="text-muted-foreground">Manage the passenger playlist.</p>
      </div>
      <MusicPlayer />
    </div>
  );
}
