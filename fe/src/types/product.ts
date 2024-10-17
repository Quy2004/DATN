
import { Category } from "./category";

export interface Size {
    _id: string;
    name: string;
    priceSize?: number;
    isDeleted: boolean;
    category_id: Category[];
}

// Định nghĩa Topping
export interface Topping {
    _id: string;
    nameTopping: string;
    priceTopping?: number;
    statusTopping: string;
}

// Định nghĩa ProductSize (kích thước của sản phẩm cụ thể)
export interface ProductSize {
    size_id: Size;
    status: "available" | "unavailable";
}

// Định nghĩa ProductTopping (topping của sản phẩm cụ thể)
export interface ProductTopping {
    topping_id: Topping;
    stock: number;
}

// Định nghĩa Product (sản phẩm)
export interface Product {
    _id: string;
    name: string;
    price: number;
    image: string;
    thumbnail: string[];
    category_id: Category[];
    product_sizes: ProductSize[];
    product_toppings: ProductTopping[];
    description: string;
    stock: number;
    discount: number;
    status: "available" | "unavailable";
    isDeleted: boolean;
}

// Định nghĩa ProductFormValues (cho form sản phẩm)
export interface ProductFormValues {
    name: string;
    price: number;
    category_id: string;
    product_sizes: ProductSize[];
    product_toppings: ProductTopping[];
    description: string;
    stock: number;
    discount: number;
    status: "available" | "unavailable";
}

// Định nghĩa UploadFile (dùng cho upload hình ảnh)
export interface UploadFile {
    uid: string;
    name: string;
    status?: string;
    url?: string;
    thumbUrl?: string;
}
