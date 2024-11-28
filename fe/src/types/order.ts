import { Product } from "./product";

export type OrderStatus =
    | "pending"
    | "confirmed"
    | "shipping"
    | "delivered"
    | "completed"
    | "canceled";

export interface CustomerInfo {
    name: string;
    address: string;
    phone: string;
    email: string;
}

export interface OrderDetail {
    _id: string;
    product: Product;
    quantity: number;
    price: number;
    sale_price: number;
    image?: string; // Nếu cần hiển thị hình ảnh sản phẩm trong đơn hàng
    createdAt?: Date;
    updatedAt?: Date;
}

export interface Order {
    _id: string;
    user_id: string;
    customerInfo: CustomerInfo;
    totalPrice: number | { $numberDecimal: string };
    orderStatus: OrderStatus;
    orderDetail_id: Array<{
        product_id: Product;
        _id: string;
        product: Product;
        quantity: number;
        price: number;
        sale_price: number;
    }>;
    paymentMethod: "bank transfer" | "cash on delivery";
    orderNumber?: string;
    note?: string;
    cancellationReason?: string;
    createdAt: Date;
    updatedAt: Date;
}
