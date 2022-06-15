import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { map } from 'rxjs';
import { RoomI, RoomPaginatedI } from 'src/app/model/room.interface';
import { UserI } from 'src/app/model/user.interface';
import { CustomSocket } from '../../sockets/custom-socket';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  constructor(private socket: CustomSocket) { }

  sendMessage(msg: string) {
    this.socket.emit('message', msg);
  }

  getMessage() {
    return this.socket.fromEvent('message');
  }

  getMyRooms() {
    return this.socket.fromEvent<RoomPaginatedI>('rooms')
  }

  emitPaginateRooms(limit: number, page: number) {
    this.socket.emit('paginateRooms', {limit, page}); //correspond to api's chatgateway (@SubscribeMessage)
  }

  createRoom() {
    // this.socket.emit('createRoom', room);
  }
}
