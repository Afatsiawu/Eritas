import "reflect-metadata";
import { DataSource } from "typeorm";
import { User, Ride, Playlist } from "./entities";


export const AppDataSource = new DataSource({
    type: "mongodb",
    url: process.env.MONGODB_URI,
    synchronize: true,
    logging: true,
    entities: [User, Ride, Playlist],
    migrations: [],
    subscribers: [],
});
