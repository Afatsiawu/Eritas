import { Entity, ObjectIdColumn, ObjectId, Column, ManyToOne, CreateDateColumn } from "typeorm";
import { User } from "./User";

@Entity()
export class Playlist {
    @ObjectIdColumn()
    id!: ObjectId;

    @Column()
    busId!: string;

    @Column()
    spotifyUri!: string;

    @Column()
    trackName!: string;

    @Column()
    artistName!: string;

    @Column()
    requestedById!: string;

    @Column({ default: false })
    played!: boolean;

    @CreateDateColumn()
    addedAt!: Date;
}
