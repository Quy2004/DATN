import Cart from '../models/Cart.js';        
import Product from '../models/ProductModel';


// Hàm thêm sản phẩm vào giỏ hàng và tính tổng số lượng, tổng tiền
export const addtoCart = async (req, res) => {
  try {
    const { userId, products } = req.body;

    if (!userId || !products || !products.length) {
      return res.status(400).json({ message: "User ID and products are required." });
    }

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};