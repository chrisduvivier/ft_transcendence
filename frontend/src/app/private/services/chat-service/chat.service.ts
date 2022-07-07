import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Socket } from 'ngx-socket-io';
import { map, Observable } from 'rxjs';
import { RoomI, RoomPaginatedI } from 'src/app/model/room.interface';
import { UserI } from 'src/app/model/user.interface';
import { MessageI, messagePaginateI } from 'src/app/model/message.interface';
import { CustomSocket } from '../../sockets/custom-socket';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  constructor(private socket: CustomSocket, private snackbar: MatSnackBar) { }

  sendMessage(message: MessageI) {
    this.socket.emit('addMessage', message);
  }

  
  joinRoom(room: RoomI) {
    this.socket.emit('joinRoom', room);
  }
  
  leaveRoom(room: RoomI) {
    this.socket.emit('leaveRoom', room);
  }
  
  getMessages(): Observable<messagePaginateI> {
    return this.socket.fromEvent<messagePaginateI>('messages');
  }
  
  getAddedMessage(): Observable<MessageI> {
    return this.socket.fromEvent<MessageI>('messageAdded');
  }

  getMyRooms(): Observable<RoomPaginatedI> {
    return this.socket.fromEvent<RoomPaginatedI>('rooms')
  }

  emitPaginateRooms(limit: number, page: number) {
    this.socket.emit('paginateRooms', {limit, page}); //correspond to api's chatgateway (@SubscribeMessage)
  }

  createRoom(room: RoomI) {
    this.socket.emit('createRoom', room);
    this.snackbar.open(`Room ${room.name} created successfully`, 'Close', {
      duration: 2000, horizontalPosition: 'right', verticalPosition: 'top'
    });
  }
}
