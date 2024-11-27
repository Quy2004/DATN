import {
  addToCart,
  changeProductQuantity,
  clearCart,
  getCart,
  removeCartItem,
  removeSelectedItems,
} from "../controllers/Cart";
import express from "express";
const RouterCart = express.Router();
// Thêm giỏ hàng
RouterCart.post("/", addToCart);
// Lấy giỏ hàng theo User
RouterCart.get("/:userId", getCart);
// Xóa một sản phẩm
RouterCart.delete("/item/:cartItemId", removeCartItem);
// Xóa nhiều sản phẩm được chọn
RouterCart.delete("/selected", removeSelectedItems);
// Xóa toàn bộ giỏ hàng
RouterCart.delete("/clear", clearCart);
// Tăng giảm số lượng
RouterCart.patch("/:userId/item/:cartItemId/quantity", changeProductQuantity);
export default RouterCart;

