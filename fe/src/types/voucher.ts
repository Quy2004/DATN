import { Category } from "./category";
import { Product } from "./product";

export interface Voucher {
	_id: string;
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
	status: string;
}