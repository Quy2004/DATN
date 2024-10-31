import { Category } from "./category";
import { Product } from "./product";

export interface Voucher {
    name: string;
	code?: string;
	description?: string;
	discountPercentage: number;
	maxDiscount: number;
	quantity: number;
	minOrderDate: Date;
	maxOrderDate: Date;
	applicableProducts: Product[];
	applicableCategories: Category[];
}