import { User } from "./user";

export interface Address{
    _id?: string;
    user_id: [User];
    name : string,
    phone : number,
    address : string;
    status : string,
    isDelete: boolean,
}