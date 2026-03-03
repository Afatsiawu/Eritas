import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Playlist } from "../entities/Playlist";
import { User } from "../entities/User";
import { spotifyService } from "../services/SpotifyService";

export class SpotifyController {
    static async search(req: Request, res: Response) {
        const { query } = req.query;
        if (!query || typeof query !== 'string') {
            return res.status(400).json({ message: "Query is required" });
        }

        try {
            const tracks = await spotifyService.searchTracks(query);
            return res.json(tracks);
        } catch (error) {
            console.error("Spotify Search Error:", error);
            return res.status(500).json({ message: "Error searching Spotify", error: error instanceof Error ? error.message : error });
        }
    }

    static async searchArtists(req: Request, res: Response) {
        const { query } = req.query;
        if (!query || typeof query !== 'string') {
            return res.status(400).json({ message: "Query is required" });
        }

        try {
            const artists = await spotifyService.searchArtists(query);
            return res.json(artists);
        } catch (error) {
            console.error("Spotify Artist Search Error:", error);
            return res.status(500).json({ message: "Error searching artists", error: error instanceof Error ? error.message : error });
        }
    }

    static async getArtist(req: Request, res: Response) {
        const { id } = req.params;
        try {
            const artist = await spotifyService.getArtist(id);
            return res.json(artist);
        } catch (error) {
            return res.status(500).json({ message: "Error fetching artist" });
        }
    }

    static async getArtistAlbums(req: Request, res: Response) {
        const { id } = req.params;
        const { limit } = req.query;
        try {
            const albums = await spotifyService.getArtistAlbums(id, limit ? parseInt(limit as string) : 20);
            return res.json(albums);
        } catch (error) {
            return res.status(500).json({ message: "Error fetching albums" });
        }
    }

    static async getAlbumTracks(req: Request, res: Response) {
        const { id } = req.params;
        try {
            const tracks = await spotifyService.getAlbumTracks(id);
            return res.json(tracks);
        } catch (error) {
            return res.status(500).json({ message: "Error fetching album tracks" });
        }
    }

    static async addToQueue(req: Request, res: Response) {
        const { busId, trackUri, userId } = req.body;

        try {
            const playlistRepo = AppDataSource.getRepository(Playlist);
            const userRepo = AppDataSource.getRepository(User);

            const user = await userRepo.findOne({ where: { id: userId } });
            if (!user) return res.status(404).json({ message: "User not found" });

            const trackId = trackUri.split(":").pop();
            const trackInfo = await spotifyService.getTrack(trackId);

            const item = new Playlist();
            item.busId = busId;
            item.spotifyUri = trackUri;
            item.trackName = trackInfo.name;
            item.artistName = trackInfo.artists.map((a: { name: string }) => a.name).join(", ");
            item.requestedById = user.id.toString();

            await playlistRepo.save(item);

            return res.status(201).json({ message: "Track added to queue", item });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Error adding track", error });
        }
    }

    static async getQueue(req: Request, res: Response) {
        const { busId } = req.params;
        const playlistRepo = AppDataSource.getRepository(Playlist);

        try {
            const queue = await playlistRepo.find({
                where: { busId, played: false },
                order: { addedAt: "ASC" }
            });

            return res.json(queue);
        } catch (error) {
            return res.status(500).json({ message: "Error fetching queue", error });
        }
    }

    static async markPlayed(req: Request, res: Response) {
        const { id } = req.params;
        const playlistRepo = AppDataSource.getRepository(Playlist);

        try {
            const item = await playlistRepo.findOne({ where: { id: id as any } });
            if (!item) return res.status(404).json({ message: "Item not found" });

            item.played = true;
            await playlistRepo.save(item);

            return res.json({ message: "Marked as played" });
        } catch (error) {
            return res.status(500).json({ message: "Error updating item", error });
        }
    }
}
