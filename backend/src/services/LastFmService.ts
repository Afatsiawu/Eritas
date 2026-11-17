import dotenv from "dotenv";
dotenv.config();

const API_KEY = process.env.LAST_FM_API_KEY || "";
const SHARED_SECRET = process.env.LAST_FM_SHARED_SECRET || "";

if (!API_KEY) {
    console.warn("[lastfm] LAST_FM_API_KEY not set; last.fm calls will fail.");
}

export interface LastFmTrack {
    name: string;
    artist: { name: string };
    url: string;
    image?: { size: string; "#text": string }[];
    duration?: number;
    streamable?: { fulltrack?: string };
    listeners?: number;
    playcount?: number;
}

export interface LastFmArtist {
    name: string;
    url: string;
    image?: { size: string; "#text": string }[];
    listeners?: number;
    playcount?: number;
}

export class LastFmService {
    private baseUrl = "https://ws.audioscrobbler.com/2.0/";

    private async request(method: string, params: Record<string, string>): Promise<any> {
        const url = new URL(this.baseUrl);
        url.searchParams.set("method", method);
        url.searchParams.set("api_key", API_KEY);
        url.searchParams.set("format", "json");

        for (const [key, value] of Object.entries(params)) {
            url.searchParams.set(key, value);
        }

        const res = await fetch(url.toString());
        if (!res.ok) {
            throw new Error(`Last.fm API error ${res.status}`);
        }
        return res.json();
    }

    async searchTracks(query: string, limit: number = 10): Promise<LastFmTrack[]> {
        const data = await this.request("track.search", {
            track: query,
            limit: String(limit),
        });
        if (!data || !data.results || !data.results.trackmatches) return [];
        return data.results.trackmatches.track.map((t: any) => ({
            name: t.name,
            artist: { name: t.artist.name },
            url: t.url,
            image: t.image,
        }));
    }

    async searchArtists(query: string, limit: number = 20): Promise<LastFmArtist[]> {
        const data = await this.request("artist.search", {
            artist: query,
            limit: String(limit),
        });
        if (!data || !data.results || !data.artistmatches) return [];
        return data.results.artistmatches.artist.map((a: any) => ({
            name: a.name,
            url: a.url,
            image: a.image,
        }));
    }

    async getTopTracks(artist: string, limit: number = 10): Promise<LastFmTrack[]> {
        const data = await this.request("artist.gettoptracks", {
            artist,
            limit: String(limit),
        });
        if (!data || !data.toptracks || !data.toptracks.track) return [];
        return data.toptracks.track.map((t: any) => ({
            name: t.name,
            artist: { name: t.artist.name },
            url: t.url,
            image: t.image,
            duration: t.duration,
            streamable: t.streamable,
        }));
    }

    async getTrackInfo(track: string, artist: string): Promise<LastFmTrack | null> {
        const data = await this.request("track.getInfo", {
            track,
            artist,
        });
        if (!data || !data.track) return null;
        return {
            name: data.track.name,
            artist: { name: data.track.artist.name },
            url: data.track.url,
            image: data.track.image,
            duration: data.track.duration,
            streamable: data.track.streamable,
        };
    }
}
