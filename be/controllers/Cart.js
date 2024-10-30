import Cart from "../models/Cart.js";
import Product from "../models/ProductModel.js";

export const addtoCart = async (req, res) => {
  try {
    const { userId, productId, quantity } = req.body;

    if (!userId || !productId || !quantity) {
      return res
        .status(400)
        .json({ message: "User ID, product ID, and quantity are required." });
    }

    // Tìm hoặc tạo giỏ hàng mới cho người dùng
    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({ userId, products: [{ product: productId, quantity }] });
    } else {
      // Tìm sản phẩm trong giỏ hàng nếu đã tồn tại
      const existingProductIndex = cart.products.findIndex(
        (item) => item.product.toString() === productId
      );

      if (existingProductIndex > -1) {
        // Nếu sản phẩm đã tồn tại, tăng số lượng
        cart.products[existingProductIndex].quantity += quantity;
      } else {
        // Nếu sản phẩm chưa tồn tại, thêm vào giỏ hàng
        cart.products.push({ product: productId, quantity });
      }
    }

    // Tính tổng số lượng và tổng tiền
    let totalQuantity = 0;
    let totalprice = 0;

    for (let item of cart.products) {
      const productDetails = await Product.findById(item.product);
      if (!productDetails) {
        return res
          .status(404)
          .json({ message: `Product with ID ${item.product} not found` });
      }
      totalQuantity += item.quantity;
      totalprice += productDetails.price * item.quantity;
    }

    cart.total = totalQuantity;
    cart.totalprice = totalprice;

    // Lưu lại giỏ hàng sau khi tính toán
    await cart.save();

    return res.status(200).json({
      message: "Products added/updated successfully",
      cart,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};
