import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JoinedRoomEntity } from 'src/chat/model/joined-room/joined-room.entity';
import { JoinedRoomI } from 'src/chat/model/joined-room/joined-room.interface';
import { RoomI } from 'src/chat/model/room/room.interface';
import { UserI } from 'src/user/model/user.interface';
import { Repository } from 'typeorm';

@Injectable()
export class JoinedRoomService {

    constructor(
        @InjectRepository(JoinedRoomEntity)
        private readonly joinedRoomRepository: Repository<JoinedRoomEntity>
    ) {}

    async create(joinedRoomUser: JoinedRoomI): Promise<JoinedRoomI> {
        return this.joinedRoomRepository.save(joinedRoomUser);
    }

    /* */
    async findByUser(user: UserI): Promise<JoinedRoomI[]> {
        return this.joinedRoomRepository.find({user});
    }

    /* A user joins and write in a chatroom -> find all user of that room to send notif */
    async findByRoom(room: RoomI): Promise<JoinedRoomI[]> {
        return this.joinedRoomRepository.find({room});
    }

    /* */
    async deleteBySocketId(socketId: string) {
        return this.joinedRoomRepository.delete({socketId: socketId});
    }

    async deleteAll() {
        await this.joinedRoomRepository
        .createQueryBuilder()
        .delete()
        .execute();
    }
}
