import SpotifyWebApi from "spotify-web-api-node";
import dotenv from "dotenv";

dotenv.config();

class SpotifyService {
    private spotifyApi: SpotifyWebApi;
    private tokenExpiration: number = 0;

    constructor() {
        this.spotifyApi = new SpotifyWebApi({
            clientId: process.env.SPOTIFY_CLIENT_ID,
            clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
        });
    }

    private async ensureToken() {
        if (Date.now() < this.tokenExpiration) return;

        try {
            const data = await this.spotifyApi.clientCredentialsGrant();
            this.spotifyApi.setAccessToken(data.body['access_token']);
            // Expires in is in seconds, convert to ms, subtract buffer
            this.tokenExpiration = Date.now() + (data.body['expires_in'] * 1000) - 60000;
            console.log("Spotify access token refreshed");
        } catch (error) {
            console.error("Error refreshing Spotify token", error);
            throw new Error("Failed to authenticate with Spotify");
        }
    }

    async searchTracks(query: string) {
        await this.ensureToken();
        const result = await this.spotifyApi.searchTracks(query);
        return result.body.tracks?.items || [];
    }

    async searchArtists(query: string) {
        await this.ensureToken();
        const result = await this.spotifyApi.searchArtists(query);
        return result.body.artists?.items || [];
    }

    async getArtist(artistId: string) {
        await this.ensureToken();
        const result = await this.spotifyApi.getArtist(artistId);
        return result.body;
    }

    async getArtistAlbums(artistId: string, limit: number = 20) {
        await this.ensureToken();
        const result = await this.spotifyApi.getArtistAlbums(artistId, { limit });
        return result.body.items;
    }

    async getAlbumTracks(albumId: string) {
        await this.ensureToken();
        const result = await this.spotifyApi.getAlbumTracks(albumId);
        return result.body.items;
    }

    async getTrack(trackId: string) {
        await this.ensureToken();
        const result = await this.spotifyApi.getTrack(trackId);
        return result.body;
    }
}

export const spotifyService = new SpotifyService();
