import { Product } from "./product";

export interface CartItem{
    product : Product[],
    quantity : number
}
export interface Cart{
    _id?: string;
    userId: string;
    products : [CartItem],
    totalprice : number
}