import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConnectedUserEntity } from 'src/chat/model/connected-user.entity';
import { ConnectedUserI } from 'src/chat/model/connected-user.interface';
import { UserI } from 'src/user/model/user.interface';
import { Repository } from 'typeorm';

@Injectable()
export class ConnectedUserService {

    constructor(
        @InjectRepository(ConnectedUserEntity)
        private readonly connectedUserRepository: Repository<ConnectedUserEntity>
    ) {}


    async create(connectedUser: ConnectedUserI): Promise<ConnectedUserI> {
        return await this.connectedUserRepository.save(connectedUser);
    }
    
    async findByUser(user: UserI): Promise<ConnectedUserI[]> {
        return this.connectedUserRepository.find({user: user});   // TODO: had to put the socketId of interface to optional because of error here
    }

    async deleteBySocketId(socketId: string){
        return this.connectedUserRepository.delete({socketId: socketId});
    }

    async deleteAll() {
        await this.connectedUserRepository
        .createQueryBuilder()
        .delete()
        .execute();
    }
}
