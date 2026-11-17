import express, { Request, Response } from "express";
import { lastFmService } from "../services/LastFmService";

const router = express.Router();

// GET /lastfm/search/tracks?query=...
router.get("/search/tracks", async (req: Request, res: Response) => {
    try {
        const query = req.query.query as string;
        if (!query) {
            return res.status(400).json({ message: "Query parameter is required" });
        }
        const results = await lastFmService.searchTracks(query);
        res.json(results);
    } catch (error) {
        console.error("Error searching tracks:", error);
        res.status(500).json({ message: "Failed to search tracks" });
    }
});

// GET /lastfm/search/artists?query=...
router.get("/search/artists", async (req: Request, res: Response) => {
    try {
        const query = req.query.query as string;
        if (!query) {
            return res.status(400).json({ message: "Query parameter is required" });
        }
        const results = await lastFmService.searchArtists(query);
        res.json(results);
    } catch (error) {
        console.error("Error searching artists:", error);
        res.status(500).json({ message: "Failed to search artists" });
    }
});

// GET /lastfm/artist/top-tracks?artist=...
router.get("/artist/top-tracks", async (req: Request, res: Response) => {
    try {
        const artistName = req.query.artist as string;
        if (!artistName) {
            return res.status(400).json({ message: "Artist parameter is required" });
        }
        const results = await lastFmService.getArtistTopTracks(artistName);
        res.json(results);
    } catch (error) {
        console.error("Error getting artist top tracks:", error);
        res.status(500).json({ message: "Failed to get artist top tracks" });
    }
});

// GET /lastfm/track/info?track=...&artist=...
router.get("/track/info", async (req: Request, res: Response) => {
    try {
        const trackName = req.query.track as string;
        const artistName = req.query.artist as string;
        if (!trackName) {
            return res.status(400).json({ message: "Track parameter is required" });
        }
        const results = await lastFmService.getTrackInfo(trackName, artistName);
        res.json(results);
    } catch (error) {
        console.error("Error getting track info:", error);
        res.status(500).json({ message: "Failed to get track info" });
    }
});

export default router;
