import { Entity, Column, ManyToOne, CreateDateColumn } from "typeorm";
import { User } from "./User";

@Entity()
export class Playlist {
    @Column({ type: "uuid", primary: true, default: "gen_random_uuid()" })
    id!: string;

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
