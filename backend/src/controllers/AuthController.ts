import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { User } from "../entities/User";
import * as bcrypt from "bcrypt";

export class AuthController {
    static async signup(req: Request, res: Response) {
        const { email, password, role, name } = req.body;
        const userRepository = AppDataSource.getRepository(User);

        try {

            const existing = await userRepository.findOne({ where: { email } });
            if (existing) {
                return res.status(400).json({ message: "User already exists" });
            }

            const user = new User();
            user.email = email;

            user.password = password;
            user.role = role || "passenger";
            user.name = name;

            await userRepository.save(user);

            return res.status(201).json({ message: "User created", userId: user.id });
        } catch (error) {
            return res.status(500).json({ message: "Error signing up", error });
        }
    }

    static async login(req: Request, res: Response) {
        const { email, password } = req.body;
        const userRepository = AppDataSource.getRepository(User);

        try {
            const user = await userRepository.findOne({ where: { email } });
            if (!user) {
                return res.status(401).json({ message: "Invalid credentials" });
            }


            const valid = user.password === password;

            if (!valid) {
                return res.status(401).json({ message: "Invalid credentials" });
            }


            return res.json({
                message: "Login successful",
                user: { id: user.id, email: user.email, role: user.role, name: user.name }
            });

        } catch (error) {
            return res.status(500).json({ message: "Error logging in", error });
        }
    }
}
