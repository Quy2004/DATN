import { Category } from "./category";
export interface Product {
    _id: string;
    name: string;
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
export interface Size {
    _id: string;
    name: string;
    priceSize?: number;
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
    price: number;
    stock: number;
}
// Interface cho topping của sản phẩm cụ thể (bao gồm topping_id và stock)
export interface ProductTopping {
    topping_id: Topping;
    stock: number;
}
// Interface tổng hợp cho Product
export interface ProductFormValues {
    name: string;
    category_id: string;
    product_sizes: ProductSize[];
    product_toppings: ProductTopping[];
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