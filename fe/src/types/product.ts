// Định nghĩa Category (Danh mục)
import { Category } from "./category";

// Định nghĩa Size (Kích thước sản phẩm)
export interface Size {
    _id: string;
    name: string;
    priceSize?: number;
    isDeleted: boolean;
    category_id: string;
}

// Định nghĩa Topping (Topping sản phẩm)
export interface Topping {
    _id: string;
    nameTopping: string;
    priceTopping?: number;
    statusTopping: "available" | "unavailable";
}

// Định nghĩa ProductSize (Kích thước của sản phẩm cụ thể)
export interface ProductSize {
    size_id: Size;
    status: "available" | "unavailable";
    priceSize?: number;  // Giá riêng cho size nếu có
}

// Định nghĩa ProductTopping (Topping của sản phẩm cụ thể)
export interface ProductTopping {
    topping_id: Topping;
    stock: number;
    priceTopping?: number; // Giá riêng cho topping nếu có
}

// Định nghĩa Product (Sản phẩm)
export interface Product {
    [x: string]: any;
    _id: string;
    name: string;
    price: number;
    sale_price: number;
    category_id: Category[];  // Một sản phẩm có thể thuộc nhiều danh mục
    image: string;
    thumbnail: string[];
    description: string;
    product_sizes: ProductSize[];
    product_toppings: ProductTopping[];
    slug: string;
    stock: number;
    discount: number;
    status: "available" | "unavailable";
    isDeleted: boolean;
}

// Định nghĩa ProductFormValues (Giá trị của form sản phẩm khi thêm/sửa sản phẩm)
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

// Định nghĩa cho file upload
export interface UploadFile {
    uid: string;
    name: string;
    status?: string;
    url?: string;
    thumbUrl?: string;
}
