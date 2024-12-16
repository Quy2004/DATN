import { Product } from "./product";

export interface CartItem{
    product_toppings: boolean;
    quantity : number
}
export interface Cart{
    _id?: string;
    userId: string;
    products : [Product],
    totalprice: number
    
}
export interface CartItem {
    product: Product;
    quantity: number;
}