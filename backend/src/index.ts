import "reflect-metadata";
import express, { Request, Response } from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import { AppDataSource } from "./data-source";

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "*", // Allow all for dev
        methods: ["GET", "POST"]
    }
});

import authRoutes from "./routes/auth";
import spotifyRoutes from "./routes/spotify";
import adminRoutes from "./routes/admin";

app.use(cors());
app.use(express.json());

// Routes
app.use("/auth", authRoutes);
app.use("/spotify", spotifyRoutes);
app.use("/admin", adminRoutes);

app.get("/", (req: Request, res: Response) => {
    res.send("SenatorBronxx Backend is running");
});

// Socket.io connection
io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);

    // Join a bus room
    socket.on("joinBus", (busId) => {
        socket.join(busId);
        console.log(`Socket ${socket.id} joined bus ${busId}`);
    });

    // Driver updates location
    socket.on("locationUpdate", (data) => {
        // data: { busId, lat, lng }
        io.to(data.busId).emit("busLocation", data);
    });

    socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id);
    });
});

const PORT = process.env.PORT || 3000;

AppDataSource.initialize()
    .then(() => {
        console.log("Database connected");
        httpServer.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch((error) => console.log(error));
