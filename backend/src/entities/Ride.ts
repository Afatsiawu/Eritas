import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from "typeorm";
import { User } from "./User";

@Entity()
export class Ride {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => User, (user) => user.id)
    driver!: User;

    @Column()
    origin!: string;

    @Column()
    destination!: string;

    @Column()
    status!: string; 

    @CreateDateColumn()
    startTime!: Date;

    @Column({ nullable: true })
    endTime!: Date;
}
