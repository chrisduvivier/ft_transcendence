import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { AuthService } from 'src/auth/service/auth.service';
import { Socket, Server } from 'socket.io'
import { UserService } from 'src/user/service/user-service/user.service';
import { UserI } from 'src/user/model/user.interface';
import { UnauthorizedException } from '@nestjs/common';
import { RoomService } from '../service/room-service/room/room.service';
import { RoomI } from '../model/room.interface';
import { PageI } from '../model/page.interface';

@WebSocketGateway({cors: { origin: ['https://hoppscotch.io', 'http://localhost:3000', 'http://localhost:4200'] }})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {

  @WebSocketServer()
  server: Server;

  constructor(
    private authService: AuthService, 
    private userService: UserService, 
    private roomService: RoomService
    ) {}

  async handleConnection(socket: Socket) {
    
    try {
      const decodedToken = await this.authService.verifyJwt(socket.handshake.headers.authorization);
      const user: UserI = await this.userService.getOne(decodedToken.user.id)
      if (!user) {
        return this.disconnect(socket);
      } else {
        // store the user data in the socket, so we can use them for onCreateRoom() for ex.
        socket.data.user = user;
        const rooms = await this.roomService.getRoomsForUser(user.id, { page: 1, limit: 10 });
        // starts from 1 with Angular, from 0 with JS. -> substract 1 to match the Angular Material Paginator.
        rooms.meta.currentPage = rooms.meta.currentPage - 1;
        // only emit rooms to the specific connected client
        return this.server.to(socket.id).emit('rooms', rooms);
      }
    } catch {
      return this.disconnect(socket);
    }
  }

  handleDisconnect(socket: Socket) {
    console.log('On Disconnect');
    socket.disconnect();
  }

  private disconnect(socket: Socket) {
    socket.emit('Error', new UnauthorizedException());
    socket.disconnect();
  }

  @SubscribeMessage('createRoom')
  async onCreateRoom(socket: Socket, room: RoomI): Promise<RoomI> {
    return this.roomService.createRoom(room, socket.data.user);
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
