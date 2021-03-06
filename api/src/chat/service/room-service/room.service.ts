import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IPaginationOptions, paginate, Pagination } from 'nestjs-typeorm-paginate';
import { RoomEntity } from 'src/chat/model/room/room.entity';
import { RoomI } from 'src/chat/model/room/room.interface';
import { UserI } from 'src/user/model/user.interface';
import { Repository } from 'typeorm';

@Injectable()
export class RoomService {

    constructor(
		@InjectRepository(RoomEntity)
		private readonly roomRepository: Repository<RoomEntity>,
	) {}

	async createRoom(room: RoomI, creator: UserI): Promise<RoomI> {
		const newRoom = await this.addCreatorToRoom(room, creator);
		//set default value for now
		newRoom.password = ''
		return this.roomRepository.save(newRoom);
	}

	async getRoom(roomId: number): Promise<RoomI> {
		return this.roomRepository.findOne(roomId, {
			relations: ['users']	//only return users???? 
		});
	}

	async getRoomsForUser(userId: number, options: IPaginationOptions): Promise<Pagination<RoomI>> {
		const query = this.roomRepository
		.createQueryBuilder('room')
		.leftJoin('room.users', 'user')	//many to many relationship
		.where('user.id = :userId', {userId})
		.leftJoinAndSelect('room.users', 'all_users')
		.orderBy('room.updatedAt', 'DESC')

		return paginate(query, options);
	  }

	async addCreatorToRoom(room: RoomI, creator: UserI): Promise<RoomI> {
		room.users.push(creator);
		room.createdBy = creator;
		room.adminUsers = [];
		room.adminUsers.push(creator);
		return room;
	}
}
