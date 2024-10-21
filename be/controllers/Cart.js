import Cart from "../models/Cart.js";
import Product from "../models/ProductModel";
import { useParams } from "react-router-dom";

// Hàm thêm sản phẩm vào giỏ hàng và tính tổng số lượng, tổng tiền
export const addtoCart = async (req, res) => {
  try {
    const { userId, products } = req.body;

    if (!userId || !products || !products.length) {
      return res
        .status(400)
        .json({ message: "User ID and products are required." });
    }

    // Kiểm tra nếu giỏ hàng tồn tại
    let cart = await Cart.findOne({ userId });

    // Nếu giỏ hàng chưa tồn tại, tạo giỏ hàng mới
    if (!cart) {
      cart = new Cart({ userId, products });
    } else {
      // Nếu giỏ hàng đã tồn tại, cập nhật sản phẩm
      for (let product of products) {
        const existingProduct = cart.products.find(
          (p) => p.product.toString() === product.product
        );

        if (existingProduct) {
          existingProduct.quantity += product.quantity; // Tăng số lượng nếu sản phẩm đã có trong giỏ hàng
        } else {
          cart.products.push(product); // Thêm sản phẩm mới vào giỏ hàng
        }
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

export const removeFormCart = async (req, res, next) => {
  try {
    const { userId, idPro } = req.useParams;
    const cart = await Cart.findOne({ userId: userId });
    if (!cart) throw new MongoAPIError(404, "Cart Not Found");

    const newProductCart = cart.products.filter(
      (item) => item.product != idPro
    );
    const updateCart = await Cart.findByIdAndUpdate(
      cart.id,
      { products: newProductCart },
      { new: true }
    );
    if (!updateCart) throw new MongoAPIError(404, "Cart Not Found");
    return res.status(201).json({
      message: "Delete Product Cart Successfull",
      data : updateCart,
    });
  } catch (error) {
    return res.status(400).send(error.message);
  }
};
