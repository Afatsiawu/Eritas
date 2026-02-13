import { Router } from "express";
import { AdminController } from "../controllers/AdminController";

const router = Router();

router.get("/users", AdminController.listUsers);
router.get("/drivers", AdminController.listDrivers);
router.delete("/users/:id", AdminController.deleteUser); // Unified delete for user/driver
router.post("/drivers", AdminController.createDriver);
router.post("/make-admin", AdminController.makeAdmin);

export default router;
