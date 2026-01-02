import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { User, UserRole } from "../entities/User";

export class AdminController {
    static async listUsers(req: Request, res: Response) {
        try {
            const userRepo = AppDataSource.getRepository(User);
            const users = await userRepo.find({
                order: { createdAt: "DESC" }
            });
            return res.json(users);
        } catch (error) {
            return res.status(500).json({ message: "Error fetching users", error });
        }
    }

    static async listDrivers(req: Request, res: Response) {
        try {
            const userRepo = AppDataSource.getRepository(User);
            const drivers = await userRepo.find({
                where: { role: UserRole.DRIVER },
                order: { createdAt: "DESC" }
            });
            return res.json(drivers);
        } catch (error) {
            return res.status(500).json({ message: "Error fetching drivers", error });
        }
    }

    static async deleteUser(req: Request, res: Response) {
        const { id } = req.params;
        try {
            const userRepo = AppDataSource.getRepository(User);
            const result = await userRepo.delete(id);
            if (result.affected === 0) {
                return res.status(404).json({ message: "User not found" });
            }
            return res.json({ message: "User deleted" });
        } catch (error) {
            return res.status(500).json({ message: "Error deleting user", error });
        }
    }

    static async createDriver(req: Request, res: Response) {
        
        const { email, password, name, licenseNumber, busPlate } = req.body;

        try {
            const userRepo = AppDataSource.getRepository(User);
            const existing = await userRepo.findOne({ where: { email } });
            if (existing) return res.status(400).json({ message: "User exists" });

            const driver = new User();
            driver.email = email;
            driver.password = password || "driver123"; // Default or generated
            driver.name = name;
            driver.role = UserRole.DRIVER;
           

            await userRepo.save(driver);
            return res.status(201).json({ message: "Driver created", driver });

        } catch (error) {
            return res.status(500).json({ message: "Error creating driver", error });
        }
    }
}
