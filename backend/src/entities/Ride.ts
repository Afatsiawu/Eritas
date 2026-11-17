import { Entity, Column, ManyToOne, CreateDateColumn, BeforeInsert } from "typeorm";
import { User } from "./User";
import { randomUUID } from "crypto";

@Entity()
export class Ride {
    @Column({ type: "uuid", primary: true, default: "gen_random_uuid()" })
    id!: string;

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

    @BeforeInsert()
    setId() {
        if (!this.id) {
            this.id = randomUUID();
        }
    }
}
