import "reflect-metadata";
import { DataSource } from "typeorm";
import { User, Ride, Playlist } from "./entities";

export const AppDataSource = new DataSource({
    type: "postgres",
    url: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_SSL === "false"
        ? false
        : process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("localhost")
          ? { rejectUnauthorized: false }
          : process.env.DATABASE_SSL === "true",
    extra: {
        family: 4,
    },
    synchronize: true,
    logging: true,
    entities: [User, Ride, Playlist],
    migrations: [],
    subscribers: [],
});
