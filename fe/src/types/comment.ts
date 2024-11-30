import { Product } from "./product";
import { User } from "./user";

export interface Comment {
  _id: string;
  content: string;
  image: string[];
  status: "active" | "inactive";
  product_id: Product; // Thông tin sản phẩm
  user_id: User;  // Thông tin người dùng
  productId: string; // ID sản phẩm (chỉ số)
  userId: string;    // ID người dùng (chỉ số)
  userName: string;
  name: string;
  isDeleted: boolean;
  parent_id: { content: string; _id: string } | null;
  createdAt: Date; // Thời gian tạo
  updatedAt: Date; // Thời gian cập nhật
//   id: string;
}
