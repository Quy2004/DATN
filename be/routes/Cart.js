import {
    addToCart,
    changeProductQuantity,
    clearCart,
    deleteCartItem,
    getCart,
    updateProductQuantity,
  } from "../controllers/Cart";
  import express from "express";
  const RouterCart = express.Router();
  RouterCart.post("/", addToCart);
  RouterCart.get("/:userId", getCart);
  
  // Cập nhật số lượng sản phẩm trong giỏ hàng
  RouterCart.patch("/:userId/product/:productId/quantity", updateProductQuantity);
  
  // Thay đổi số lượng sản phẩm trong giỏ hàng (tăng hoặc giảm)
  RouterCart.patch(
    "/:userId/product/:productId/quantity/change",
    changeProductQuantity
  );
  RouterCart.patch("/:cartId/:productId/delete", deleteCartItem);
  RouterCart.delete("/:cartId/delete-all", clearCart);
  export default RouterCart;
