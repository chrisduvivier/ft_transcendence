import { Meta } from "./meta.interface";
import { UserI } from "./user.interface";

export interface RoomI {
    id?: number;
    name?: string;
    description?: string;
    password?: string;
    users?: UserI[];
    created_at?: Date;
    updated_at?: Date;
}

export interface RoomPaginatedI {
    items: RoomI[];
    meta: Meta;
}