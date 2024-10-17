import { Category } from "./category";


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
    price: number
    category_id: Category[];
    image: string;
    thumbnail: string[];
    product_sizes: ProductSize[];
    product_toppings: ProductTopping[];
    slug: string;
    stock: number;
    discount: number;
    status: "available" | "unavailable";
    isDeleted: boolean;
}


// Định nghĩa ProductFormValues (cho form sản phẩm)

export interface Size {
    _id: string;
    name: string;
    priceSize?: number;
    isDeleted: boolean;
    category_id: string;
}
// Interface cho topping sản phẩm
export interface Topping {
    _id: string;
    nameTopping: string;
    priceTopping?: number;
}
// Interface cho kích thước của sản phẩm cụ thể (bao gồm size_id, price và stock)
export interface ProductSize {
    size_id: Size;
    status: "available" | "unavailable";
}
// Interface cho topping của sản phẩm cụ thể (bao gồm topping_id và stock)
export interface ProductTopping {
    topping_id: Topping;
    stock: number;
}
// Interface tổng hợp cho Product

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
export interface UploadFile {
    uid: string;
    name: string;
    status?: string;
    url?: string;
    thumbUrl?: string;

}