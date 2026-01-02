import { Router } from "express";
import { SpotifyController } from "../controllers/SpotifyController";

const router = Router();

router.get("/search", SpotifyController.search);
router.post("/queue", SpotifyController.addToQueue);
router.get("/queue/:busId", SpotifyController.getQueue);
router.patch("/queue/:id/played", SpotifyController.markPlayed);

export default router;
