import { Category } from "./category";

export interface Topping {
    _id: string;
    nameTopping: string;
    priceTopping: number;
    statusTopping: string;
    isDeleted: boolean;
    category_id: Category;
    categoryTitle: string
}