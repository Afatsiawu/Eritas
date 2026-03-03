import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Ride } from "../entities/Ride";
import { Between } from "typeorm";

export class RideController {
    static async getStats(req: any, res: Response) {
        // Driver ID now comes from the verified JWT token
        const driverId = req.user?.id;

        if (!driverId) {
            return res.status(401).json({ message: "Driver identification failed" });
        }

        try {
            const rideRepo = AppDataSource.getRepository(Ride);

            const now = new Date();
            const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const startOfWeek = new Date(now);
            startOfWeek.setDate(now.getDate() - now.getDay());
            startOfWeek.setHours(0, 0, 0, 0);

            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

            const [daily, weekly, monthly, total] = await Promise.all([
                rideRepo.count({ where: { driverId, startTime: Between(startOfDay, now) } } as any),
                rideRepo.count({ where: { driverId, startTime: Between(startOfWeek, now) } } as any),
                rideRepo.count({ where: { driverId, startTime: Between(startOfMonth, now) } } as any),
                rideRepo.count({ where: { driverId } } as any)
            ]);

            return res.json({
                daily,
                weekly,
                monthly,
                total
            });
        } catch (error) {
            console.error("Error fetching trip stats:", error);
            return res.status(500).json({ message: "Error fetching trip stats", error });
        }
    }

    static async getAdminOverview(req: any, res: Response) {
        // Simple role check
        if (req.user?.role !== 'admin') {
            return res.status(403).json({ message: "Access denied. Admin only." });
        }

        try {
            const rideRepo = AppDataSource.getRepository(Ride);

            const now = new Date();
            const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const startOfWeek = new Date(now);
            startOfWeek.setDate(now.getDate() - now.getDay());
            startOfWeek.setHours(0, 0, 0, 0);

            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

            const [daily, weekly, monthly, total] = await Promise.all([
                rideRepo.count({ where: { startTime: Between(startOfDay, now) } } as any),
                rideRepo.count({ where: { startTime: Between(startOfWeek, now) } } as any),
                rideRepo.count({ where: { startTime: Between(startOfMonth, now) } } as any),
                rideRepo.count()
            ]);

            return res.json({
                daily,
                weekly,
                monthly,
                total
            });
        } catch (error) {
            console.error("Error fetching admin overview stats:", error);
            return res.status(500).json({ message: "Error fetching admin overview stats", error });
        }
    }
}
