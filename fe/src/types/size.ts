import { Category } from "./category";

export interface Size {
    _id: string;
    name: string;
    priceSize?: number;
    status: string;
    isDeleted: boolean;
    category_id: Category[];
}