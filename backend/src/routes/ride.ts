import { Router } from "express";
import { RideController } from "../controllers/RideController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

router.get("/stats", authMiddleware, RideController.getStats);
router.get("/admin/overview", authMiddleware, RideController.getAdminOverview);

export default router;
