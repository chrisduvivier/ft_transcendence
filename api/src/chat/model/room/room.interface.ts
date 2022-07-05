import { UserI } from "src/user/model/user.interface";

export interface RoomI {
    id?: number;
    name?: string;
    description?: string;
    password?: string;
    users?: UserI[];
    created_at?: Date;
    updated_at?: Date;
}