import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { OnModuleInit, UnauthorizedException } from '@nestjs/common';
import { Socket, Server } from 'socket.io'
import { stringify } from 'querystring';
import { AuthService } from 'src/auth/service/auth.service';
import { UserService } from 'src/user/service/user-service/user.service';
import { RoomService } from '../service/room-service/room.service';
import { ConnectedUserService } from '../service/connected-user/connected-user.service';
import { JoinedRoomService } from '../service/joined-room/joined-room.service';
import { UserI } from 'src/user/model/user.interface';
import { RoomI } from '../model/room/room.interface';
import { PageI } from '../model/page.interface';
import { ConnectedUserI } from '../model/connected-user/connected-user.interface';
import { MessageService } from '../service/message/message.service';
import { MessageI } from '../model/message/message.interface';
import { JoinedRoomI } from '../model/joined-room/joined-room.interface';

@WebSocketGateway({cors: { origin: ['https://hoppscotch.io', 'http://localhost:3000', 'http://localhost:4200'] }})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect, OnModuleInit {

  @WebSocketServer()
  server: Server; 

  constructor(
    private authService: AuthService, 
    private userService: UserService, 
    private roomService: RoomService,
    private connectedUserService: ConnectedUserService,
    private joinedRoomService: JoinedRoomService,
    private messageService: MessageService,
    ) { }
    
  async onModuleInit() {
    /* clean connectedUser at start on module */
    await this.connectedUserService.deleteAll();
    await this.joinedRoomService.deleteAll();
  }

  async handleConnection(socket: Socket) {
    
    try {
      const decodedToken = await this.authService.verifyJwt(socket.handshake.headers.authorization);
      const user: UserI = await this.userService.getOne(decodedToken.user.id)
      if (!user) {
        console.log("Error in handleConnection: User not found");
        return this.disconnect(socket);
      } else {
        // store the user data in the socket, so we can use them for onCreateRoom() for ex.
        socket.data.user = user;
        const rooms = await this.roomService.getRoomsForUser(user.id, { page: 1, limit: 10 });
        // starts from 1 with Angular, from 0 with JS. -> substract 1 to match the Angular Material Paginator.
        rooms.meta.currentPage = rooms.meta.currentPage - 1;
        
        // save connection to database
        await this.connectedUserService.create({ socketId: socket.id, user: user });

        // only emit rooms to the specific connected client
        return this.server.to(socket.id).emit('rooms', rooms);
      }
    } catch(e) {
      let result = e.message; // error under useUnknownInCatchVariables
      console.log("Error in handleConnection")
      if (typeof e === "string") {
        console.log(e.toUpperCase()) // works, `e` narrowed to string
      } else if (e instanceof Error) {
          console.log(e.message) // works, `e` narrowed to Error
      }
      return this.disconnect(socket);
    }
  }

  async handleDisconnect(socket: Socket) {

    // remove connection from database
    console.log("Disconnect User")
    this.connectedUserService.deleteBySocketId(socket.id);
    socket.disconnect();
  }

  private disconnect(socket: Socket) {
    socket.emit('Error', new UnauthorizedException());
    socket.disconnect();
  }

  @SubscribeMessage('createRoom')
  async onCreateRoom(socket: Socket, room: RoomI) {
    const createdRoom: RoomI = await this.roomService.createRoom(room, socket.data.user);
    
    // Amoung all users in the created chatroom, check if users are connected
    for (const user of createdRoom.users) {
      const connections: ConnectedUserI[] = await this.connectedUserService.findByUser(user);
      const rooms = await this.roomService.getRoomsForUser(user.id, {page: 1, limit: 10 });
      
      // -substract page -1 to match the angular material paginator
      rooms.meta.currentPage = rooms.meta.currentPage - 1;

      for (const connection of connections) {
        await this.server.to(connection.socketId).emit('rooms', rooms);
      }
    }
  }

  @SubscribeMessage('paginateRooms')
  async onPaginateRoom(socket: Socket, page: PageI) {
    const rooms = await this.roomService.getRoomsForUser(socket.data.user.id, this.handleIncomingPageRequest(page));
    // substract 1 to match the Angular Material Paginator.
    rooms.meta.currentPage = rooms.meta.currentPage - 1;
    return this.server.to(socket.id).emit('rooms', rooms);
  }

  @SubscribeMessage('joinRoom')
  async onJoinRoom(socket: Socket, room: RoomI) {
    const messages = await this.messageService.findMessagesForRoom(room, {limit: 10, page: 1});
    
    // reshift value to match
    messages.meta.currentPage = messages.meta.currentPage - 1;

    // save connection to room (database)
    const joinedRoom = {
      socketId: socket.id,
      user: socket.data.user,
      room: room
    }
    await this.joinedRoomService.create(joinedRoom);

    //send last messages from Room to User
    await this.server.to(socket.id).emit('messages', messages);
  }

  @SubscribeMessage('leaveRoom')
  async onLeaveRoom(socket: Socket) {
    // remove connection from JoinedRooms
    await this.joinedRoomService.deleteBySocketId(socket.id);
  }

  @SubscribeMessage('addMessage')
  async onAddMessage(socket: Socket, message: MessageI) {
    // add `user` to the object message (using spread operator)
    const createdMessage: MessageI = await this.messageService.create({...message, user: socket.data.user});
    const room: RoomI = await this.roomService.getRoom(createdMessage.room.id);
    const joinedUsers: JoinedRoomI[] = await this.joinedRoomService.findByRoom(room);
    
    // TODO: send new Message to all joined users of the room (currently online)
    for (const user of joinedUsers) {
      await this.server.to(user.socketId).emit('messageAdded', createdMessage);
    }

  }

  private handleIncomingPageRequest(page: PageI) {
    page.limit = page.limit > 100 ? 100 : page.limit;
    // add +1 to match Angular Material Paginator
    page.page = page.page + 1;
    return page
  }
}
