import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from "typeorm";
import { User } from "./User";

@Entity()
export class Playlist {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    busId!: string; 

    @Column()
    spotifyUri!: string;

    @Column()
    trackName!: string;

    @Column()
    artistName!: string;

    @ManyToOne(() => User, (user) => user.id)
    requestedBy!: User;

    @Column({ default: false })
    played!: boolean;

    @CreateDateColumn()
    addedAt!: Date;
}
