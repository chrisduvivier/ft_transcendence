import { UserI } from "src/user/model/user.interface";

export interface RoomI {
    id?: number;
    name?: string;
    description?: string;
    type?: string;
    password?: string;
    adminUsers?: UserI[];
    users?: UserI[];
    createdAt?: Date;
    updatedAt?: Date;
    createdBy?: UserI;
}