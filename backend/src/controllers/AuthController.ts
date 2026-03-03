import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { User, UserRole } from "../entities/User";
import * as bcrypt from "bcrypt";
import { OAuth2Client } from "google-auth-library";
import * as jwt from "jsonwebtoken";

export class AuthController {
    static async signup(req: Request, res: Response) {
        const { email, password, role, name, driverLicense, ghanaCardNumber, busName, busPlate } = req.body;
        const userRepository = AppDataSource.getRepository(User);

        try {

            const existing = await userRepository.findOne({ where: { email } });
            if (existing) {
                return res.status(400).json({ message: "User already exists" });
            }

            const user = new User();
            user.email = email;

            // Hash password before saving
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);

            user.role = role || UserRole.PASSENGER;
            user.name = name;
            user.driverLicense = driverLicense;
            user.ghanaCardNumber = ghanaCardNumber;
            user.busName = busName;
            user.busPlate = busPlate;
            user.onboarded = false;

            await userRepository.save(user);

            return res.status(201).json({ message: "User created", userId: user.id.toString(), onboarded: user.onboarded });
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
                return res.status(401).json({ message: "Invalid username or password" });
            }


            const valid = await bcrypt.compare(password, user.password);

            if (!valid) {
                return res.status(401).json({ message: "Invalid username or password" });
            }


            const token = jwt.sign(
                { id: user.id.toString(), role: user.role },
                process.env.JWT_SECRET || "super_secret_eritas_key_2024",
                { expiresIn: "7d" }
            );

            return res.json({
                message: "Login successful",
                token,
                user: {
                    id: user.id.toString(),
                    email: user.email,
                    role: user.role,
                    name: user.name,
                    driverLicense: user.driverLicense,
                    ghanaCardNumber: user.ghanaCardNumber,
                    busName: user.busName,
                    busPlate: user.busPlate,
                    onboarded: user.onboarded
                }
            });

        } catch (error) {
            return res.status(500).json({ message: "Error logging in", error });
        }
    }

    static async googleLogin(req: Request, res: Response) {
        const { email, name, picture, sub: googleId } = req.body;
        console.log("Google Login Body:", req.body);
        const userRepository = AppDataSource.getRepository(User);

        try {
            if (!email) {
                return res.status(400).json({ message: "Invalid Google data" });
            }

            let user = await userRepository.findOne({ where: { email } });

            if (!user) {
                // Create new user if they don't exist
                user = new User();
                user.email = email;
                user.name = name || email.split('@')[0];
                user.password = `google_${googleId}`; // Placeholder since it's OAuth
                user.role = UserRole.PASSENGER;
                user.onboarded = false;
                await userRepository.save(user);
            }

            return res.json({
                message: "Google login successful",
                user: {
                    id: user.id.toString(),
                    email: user.email,
                    role: user.role,
                    name: user.name,
                    photoURL: picture,
                    onboarded: user.onboarded
                }
            });

        } catch (error) {
            console.error("Google sync error:", error);
            return res.status(500).json({ message: "Error syncing Google user", error });
        }
    }

    static async updateOnboarding(req: Request, res: Response) {
        const { userId } = req.body;
        const userRepository = AppDataSource.getRepository(User);

        try {
            const user = await userRepository.findOne({ where: { id: userId } as any });
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }

            user.onboarded = true;
            await userRepository.save(user);

            return res.json({ message: "Onboarding completed" });
        } catch (error) {
            return res.status(500).json({ message: "Error updating onboarding status", error });
        }
    }
}
