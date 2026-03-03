import { Router } from "express";
import { SpotifyController } from "../controllers/SpotifyController";

const router = Router();

router.get("/search", SpotifyController.search);
router.get("/artists", SpotifyController.searchArtists);
router.get("/artist/:id", SpotifyController.getArtist);
router.get("/artist/:id/albums", SpotifyController.getArtistAlbums);
router.get("/album/:id/tracks", SpotifyController.getAlbumTracks);
router.post("/queue", SpotifyController.addToQueue);
router.get("/queue/:busId", SpotifyController.getQueue);
router.patch("/queue/:id/played", SpotifyController.markPlayed);

export default router;
