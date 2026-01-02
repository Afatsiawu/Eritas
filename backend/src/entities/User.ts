import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";

export enum UserRole {
    PASSENGER = "passenger",
    DRIVER = "driver"
}

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id!: number;

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

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
