
import { Category } from "./category";
import { Size } from "./size";
import { Topping } from "./topping";

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
