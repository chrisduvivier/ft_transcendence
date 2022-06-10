import { UserEntity } from "src/user/model/user.entity";
import { Entity, PrimaryGeneratedColumn, Column, BeforeInsert, ManyToMany, JoinTable, CreateDateColumn } from "typeorm";

@Entity()
export class RoomEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;
    
    @Column({nullable: true})
    description: string;

    @Column({select: false})
    password: string;

    @ManyToMany(() => UserEntity)
    @JoinTable()
    users: UserEntity[]

    @CreateDateColumn()
    created_at: Date;
    
    @CreateDateColumn()
    updated_at: Date;
}