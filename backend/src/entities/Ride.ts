import { Entity, ObjectIdColumn, ObjectId, Column, ManyToOne, CreateDateColumn } from "typeorm";
import { User } from "./User";

@Entity()
export class Ride {
    @ObjectIdColumn()
    id!: ObjectId;

    @Column()
    driverId!: string;

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
