export interface Notification {
    _id?: string;
    title: string;
    message: string;
    user_Id?: string;
    order_Id?: string;
    product_Id?: string;
    type: string;
    isRead: boolean;
    isGlobal: boolean;
    status: string
}