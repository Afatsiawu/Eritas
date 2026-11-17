import dotenv from "dotenv";

dotenv.config();

const API_KEY = process.env.LAST_FM_API_KEY;
const SHARED_SECRET = process.env.LAST_FM_SHARED_SECRET;

if (!API_KEY) {
    console.warn("LAST_FM_API_KEY not set in environment variables");
}

if (!SHARED_SECRET) {
    console.warn("LAST_FM_SHARED_SECRET not set in environment variables");
}

/**
 * Last.fm API wrapper service.
 * 
 * Endpoints used:
 * - track.search: search for tracks
 * - artist.search: search for artists
 * - artist.getTopTracks: get top tracks for an artist
 * - track.getInfo: get info for a track
 */

export class LastFmService {
    private baseUrl = "https://ws.audioscrobbler.com/2.0/";

    async searchTracks(query: string) {
        const response = await fetch(
            `${this.baseUrl}?method=track.search&track=${encodeURIComponent(query)}&api_key=${API_KEY}&format=json`
        );
        const data: any = await response.json();
        return data.results?.tracks?.track || [];
    }

    async searchArtists(query: string) {
        const response = await fetch(
            `${this.baseUrl}?method=artist.search&artist=${encodeURIComponent(query)}&api_key=${API_KEY}&format=json`
        );
        const data: any = await response.json();
        return data.results?.artist || [];
    }

    async getArtistTopTracks(artistName: string) {
        const response = await fetch(
            `${this.baseUrl}?method=artist.getTopTracks&artist=${encodeURIComponent(artistName)}&api_key=${API_KEY}&format=json`
        );
        const data: any = await response.json();
        return data.toptracks?.track || [];
    }

    async getTrackInfo(trackName: string, artistName: string) {
        const response = await fetch(
            `${this.baseUrl}?method=track.getInfo&track=${encodeURIComponent(trackName)}&artist=${encodeURIComponent(artistName)}&api_key=${API_KEY}&format=json`
        );
        const data: any = await response.json();
        return data.track;
    }
}

export const lastFmService = new LastFmService();
