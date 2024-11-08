import { Product } from "./product"; 

export interface Order {
    user_id: string;
    customerInfo: {
        name: string;
        address: string;
        phone: string;
        email: string;
    };
    totalPrice: number | { $numberDecimal: string };
    orderStatus: "pending" | "confirmed" | "preparing" | "shipping" | "delivered" | "completed" | "canceled";
    orderDetail_id: string[];
    paymentMethod: "bank transfer" | "cash on delivery";
    orderNumber?: string;
    note?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface OrderDetail {
    order_id: string;  
    product_id: Product;  
    quantity: number;
    price: number;
    image?: string;
    createdAt?: Date;
    updatedAt?: Date;
}
