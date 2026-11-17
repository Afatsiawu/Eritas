import { Router } from "express";
import { lastFmService } from "../services/LastFmService";

const router = Router();

router.get("/search/tracks", async (req, res) => {
    const { query } = req.query;
    if (!query || typeof query !== "string") {
        return res.status(400).json({ message: "Query is required" });
    }

    try {
        const tracks = await lastFmService.searchTracks(String(query));
        return res.json(tracks);
    } catch (error) {
        console.error("Last.fm Search Error:", error);
        return res.status(500).json({ message: "Error searching Last.fm", error: error instanceof Error ? error.message : error });
    }
});

router.get("/search/artists", async (req, res) => {
    const { query } = req.query;
    if (!query || typeof query !== "string") {
        return res.status(400).json({ message: "Query is required" });
    }

    try {
        const artists = await lastFmService.searchArtists(String(query));
        return res.json(artists);
    } catch (error) {
        console.error("Last.fm Artist Search Error:", error);
        return res.status(500).json({ message: "Error searching Last.fm artists", error: error instanceof Error ? error.message : error });
    }
});

router.get("/artist/top-tracks", async (req, res) => {
    const { artist } = req.query;
    if (!artist || typeof artist !== "string") {
        return res.status(400).json({ message: "Artist is required" });
    }

    try {
        const tracks = await lastFmService.getTopTracks(String(artist));
        return res.json(tracks);
    } catch (error) {
        console.error("Last.fm Top Tracks Error:", error);
        return res.status(500).json({ message: "Error fetching Last.fm top tracks", error: error instanceof Error ? error.message : error });
    }
});

router.get("/track/info", async (req, res) => {
    const { track, artist } = req.query;
    if (!track || !artist || typeof track !== "string" || typeof artist !== "string") {
        return res.status(400).json({ message: "Track and artist are required" });
    }

    try {
        const trackInfo = await lastFmService.getTrackInfo(String(track), String(artist));
        if (!trackInfo) {
            return res.status(404).json({ message: "Track not found" });
        }
        return res.json(trackInfo);
    } catch (error) {
        console.error("Last.fm Track Info Error:", error);
        return res.status(500).json({ message: "Error fetching Last.fm track info", error: error instanceof Error ? error.message : error });
    }
});

export default router;
