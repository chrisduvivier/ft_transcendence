import { UserEntity } from "src/user/model/user.entity";
import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable, CreateDateColumn, OneToMany, UpdateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { JoinedRoomEntity } from "../joined-room/joined-room.entity";
import { MessageEntity } from "../message/message.entity";

@Entity()
export class RoomEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;
    
    @Column({nullable: true})
    description: string;

    @Column({default: "public"})
    type: string;

    @Column({select: false})
    password: string;

    @ManyToMany(() => UserEntity, user => user.id)
    @JoinTable()
    adminUsers: UserEntity[]

    @ManyToMany(() => UserEntity)
    @JoinTable()
    users: UserEntity[]

    @OneToMany(() => JoinedRoomEntity, joinedRoom => joinedRoom.room)
    joinedUsers: JoinedRoomEntity[];

    @OneToMany(() => MessageEntity, message => message.room)
    messages: MessageEntity[];

    @ManyToOne(() => UserEntity, user => user.id)
    @JoinColumn()
    createdBy: UserEntity;
    
    @CreateDateColumn()
    createdAt: Date;
    
    @UpdateDateColumn()
    updatedAt: Date;
}