import { Product } from "./product";


export interface User {
    userName: string;
    email: string
}

export interface Order {
    method: string;
    $numberDecimal: number;
    userName: string;
    _id: string;
    product_id: Product
    address_id: string;
    user_id: User;
    totalPrice: { $numberDecimal: string } | number;
    orderStatus: string
    orderDetail_id: string[];
    payment_id?: { method?: string };
    orderNumber?: string;
    note?: string;
    createdAt: Date,
    updatedAt: Date
}
export interface OrderDetail {
    order_id: Order;
    product_id: Product;
    quantity: number;
    price: number;
    image?: string;
    createdAt?: Date;
    updatedAt?: Date;
}