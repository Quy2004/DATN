import { Category } from "./category";

export interface Size {
    _id: string;
    name: string;
    priceSize?: number;
    isDeleted: boolean;
    category_id: Category[];
}