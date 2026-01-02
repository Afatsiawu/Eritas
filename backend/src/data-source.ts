import "reflect-metadata";
import { DataSource } from "typeorm";
import { User, Ride, Playlist } from "./entities";


export const AppDataSource = new DataSource({
    type: "sqlite",
    database: "database.sqlite",
    synchronize: true,
    logging: false,
    entities: [User, Ride, Playlist],
    migrations: [],
    subscribers: [],
});
