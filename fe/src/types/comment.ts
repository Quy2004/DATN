import { Product } from "./product";
import { User } from "./user";

export interface Comment {
    _id: string;
    content: string;
    image: string[];
    status: "active" | "inactive";
    product_id: Product;
    user_id: User;
    userName: string;
    name: string;
    isDeleted: boolean;
    parent_id: { content: string, _id:string } | null;
}