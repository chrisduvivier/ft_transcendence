import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { AuthService } from 'src/auth/service/auth.service';
import { Socket, Server } from 'socket.io'
import { UserService } from 'src/user/service/user-service/user.service';
import { UserI } from 'src/user/model/user.interface';
import { OnModuleInit, UnauthorizedException } from '@nestjs/common';
import { RoomService } from '../service/room-service/room.service';
import { RoomI } from '../model/room.interface';
import { PageI } from '../model/page.interface';
import { ConnectedUserService } from '../service/connected-user/connected-user.service';
import { stringify } from 'querystring';
import { ConnectedUserI } from '../model/connected-user.interface';

@WebSocketGateway({cors: { origin: ['https://hoppscotch.io', 'http://localhost:3000', 'http://localhost:4200'] }})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect, OnModuleInit {

  @WebSocketServer()
  server: Server; 

  constructor(
    private authService: AuthService, 
    private userService: UserService, 
    private roomService: RoomService,
    private connectedUserService: ConnectedUserService) { }
    
  async onModuleInit() {
    /* clean connectedUser at start on module */
    await this.connectedUserService.deleteAll();
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
      for (const connection of connections) {
        await this.server.to(connection.socketId).emit('rooms', rooms);
      }
    }
  }

  @SubscribeMessage('paginateRooms')
  async onPaginateRoom(socket: Socket, page: PageI) {
    page.limit = page.limit > 100 ? 100 : page.limit;
    // add +1 to match Angular Material Paginator
    page.page = page.page + 1;
    const rooms = await this.roomService.getRoomsForUser(socket.data.user.id, page);
    // substract 1 to match the Angular Material Paginator.
    rooms.meta.currentPage = rooms.meta.currentPage - 1;
    return this.server.to(socket.id).emit('rooms', rooms);
  }
}
