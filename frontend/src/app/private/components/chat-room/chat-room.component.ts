import { Component, ElementRef, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { combineLatest, map, Observable, startWith, tap } from 'rxjs';
import { messagePaginateI } from 'src/app/model/message.interface';
import { RoomI } from 'src/app/model/room.interface';
import { ChatService } from '../../services/chat-service/chat.service';

@Component({
  selector: 'app-chat-room',
  templateUrl: './chat-room.component.html',
  styleUrls: ['./chat-room.component.scss']
})
export class ChatRoomComponent implements OnChanges, OnDestroy {

  @Input() chatRoom: RoomI;
  /* Watch #messages div for changes */
  @ViewChild('messages') private messageScroller: ElementRef;

  // when either `messageAdded` or `messages` gets trigger, emit the latest values from each as an array
  messagesPaginate$: Observable<messagePaginateI> = combineLatest(
    [this.chatService.getMessages(), this.chatService.getAddedMessage().pipe(startWith(null))]
    ).pipe(
    /* Content of the chatroom. map to apply sorting order */
    map(([messagePaginate, message]) => {
      if (message && message.room.id === this.chatRoom.id && 
        !messagePaginate.items.some(m => m.id === message.id)) {  // check if message already existing
        messagePaginate.items.push(message);
      }
      const items = messagePaginate.items.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      messagePaginate.items = items;
      return messagePaginate;
    }),
    tap(() => this.scrollToBottom())
  )

  /* Where the user writes message to chat and submit */
  chatMessage: FormControl = new FormControl(null, [Validators.required]);

  constructor(private readonly chatService: ChatService) { }

  /* */
  ngOnChanges(changes: SimpleChanges): void {
    this.chatService.leaveRoom(changes['chatRoom'].previousValue);
    if (this.chatRoom) {
      this.chatService.joinRoom(this.chatRoom);
    }
  }
  
  ngAfterViewInit() {
    this.scrollToBottom();
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

  /* Scroll screen to bottom after new chat message gets added */
  scrollToBottom(): void {
    setTimeout(() => {this.messageScroller.nativeElement.scrollTop = this.messageScroller.nativeElement.scrollHeight}, 1);
  }
}
