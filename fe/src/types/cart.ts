import { Product } from "./product";

export interface CartItem{
    quantity : number
}
export interface Cart{
    _id?: string;
    userId: string;
    products : [Product],
    totalprice : number
}