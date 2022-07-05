import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { messagePaginateI } from 'src/app/model/message.interface';
import { RoomI } from 'src/app/model/room.interface';
import { ChatService } from '../../services/chat-service/chat.service';

@Component({
  selector: 'app-chat-room',
  templateUrl: './chat-room.component.html',
  styleUrls: ['./chat-room.component.scss']
})
export class ChatRoomComponent implements OnInit, OnChanges, OnDestroy {

  @Input() chatRoom: RoomI;

  /* Content of the chatroom*/
  messages$: Observable<messagePaginateI> = this.chatService.getMessages();

  /* Where the user writes message to chat and submit */
  chatMessage: FormControl = new FormControl(null, [Validators.required]);

  constructor(private readonly chatService: ChatService) { }

  ngOnInit(): void {
  }

  /* */
  ngOnChanges(changes: SimpleChanges): void {
    this.chatService.leaveRoom(changes['chatRoom'].previousValue);
    if (this.chatRoom) {
      this.chatService.joinRoom(this.chatRoom);
    }
  }
  
  /* */
  ngOnDestroy(): void {
    this.chatService.leaveRoom(this.chatRoom);
  }

  /* Access Message object value from FormControl (data from Submit) */
  sendMessage() {
    this.chatService.sendMessage({text: this.chatMessage.value, room: this.chatRoom});
    this.chatMessage.reset();
  }
}