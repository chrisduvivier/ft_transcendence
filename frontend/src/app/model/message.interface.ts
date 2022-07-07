import { Meta } from "@angular/platform-browser";
import { RoomI } from "./room.interface";
import { UserI } from "./user.interface";

export interface MessageI {
    id?: number;
    text: string;
    user?: UserI;
    room: RoomI;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface messagePaginateI {
    items: MessageI[];
    meta: Meta;
}