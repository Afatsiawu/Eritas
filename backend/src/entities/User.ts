import { Entity, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";

export enum UserRole {
    PASSENGER = "passenger",
    DRIVER = "driver",
    ADMIN = "admin"
}

@Entity()
export class User {
    @Column({ type: "uuid", primary: true, default: "gen_random_uuid()" })
    id!: string;

    @Column()
    email!: string;

    @Column()
    password!: string;

    @Column({
        type: "simple-enum",
        enum: UserRole,
        default: UserRole.PASSENGER
    })
    role!: UserRole;

    @Column({ nullable: true })
    name!: string;

    @Column({ nullable: true })
    driverLicense!: string;

    @Column({ nullable: true })
    ghanaCardNumber!: string;

    @Column({ nullable: true })
    busName!: string;

    @Column({ nullable: true })
    busPlate!: string;

    @Column({ default: false })
    onboarded!: boolean;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
