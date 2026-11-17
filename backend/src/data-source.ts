import "reflect-metadata";
import { DataSource } from "typeorm";
import { User, Ride, Playlist } from "./entities";

export const AppDataSource = new DataSource({
    type: "pg",
    url: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_SSL === "true",
    synchronize: true,
    logging: true,
    entities: [User, Ride, Playlist],
    migrations: [],
    subscribers: [],
});
