import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PrivateRoutingModule } from './private-routing.module';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { MatListModule } from '@angular/material/list';

import { MatPaginatorModule } from '@angular/material/paginator';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { CreateRoomComponent } from './components/create-room/create-room.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatChipsModule } from '@angular/material/chips';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { SelectUsersComponent } from './components/select-users/select-users.component';
import { MatIconModule } from '@angular/material/icon';
import { ChatRoomComponent } from './components/chat-room/chat-room.component';
import { ChatMessageComponent } from './components/chat-message/chat-message.component';


@NgModule({
  declarations: [
    DashboardComponent,
    CreateRoomComponent,
    SelectUsersComponent,
    ChatRoomComponent,
    ChatMessageComponent
  ],
  imports: [
    CommonModule,
    PrivateRoutingModule,
    MatListModule,
    MatPaginatorModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatChipsModule,
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatIconModule
  ]
})
export class PrivateModule { }
