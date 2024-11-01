import Cart from '../models/Cart.js';        
import Product from '../models/ProductModel';


// Hàm thêm sản phẩm vào giỏ hàng và tính tổng số lượng, tổng tiền
export const addtoCart = async (req, res) => {
  try {
    const { userId, productId ,quantity} = req.body;
    
    
    if (!userId) {
      return res.status(400).json({ message: "User ID  are required." });
    }
    if (!productId) {
      return res.status(400).json({ message: "User ID  are required." });
    }

    // Kiểm tra nếu giỏ hàng tồn tại
    let cart = await Cart.findOne({ userId});
    var product = await Product.findOne({_id: productId})
    
    // Nếu giỏ hàng chưa tồn tại, tạo giỏ hàng mới
    if (!cart) {
      cart = new Cart({
        userId,
        products: [{ product: productId, quantity  }]
      });
    } else {
      // Tìm sản phẩm trong giỏ hàng
      const existingProduct = cart.products.find(p => p.product.toString() === productId);

      if (existingProduct) {
        existingProduct.quantity += quantity; // Tăng số lượng nếu sản phẩm đã có trong giỏ hàng
      } else {
        cart.products.push({ product: productId, quantity }); // Thêm sản phẩm mới vào giỏ hàng
      }
    }

    // Tính tổng số lượng và tổng tiền
    let totalQuantity = 0;
    let totalprice = 0;

    // for (let item of cart.products) {
      const productDetails = await Product.findById(productId);
      if (!productDetails) {
        return res.status(404).json({ message: `Product with ID ${productId} not found` });
      }
      totalQuantity += quantity;
      totalprice += productDetails.price * quantity;
    // }

    cart.total = totalQuantity;
    cart.totalprice = totalprice;

    // Lưu lại giỏ hàng sau khi tính toán
    await cart.save();

    return res.status(200).json({
      message: "Products added/updated successfully",
      cart
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};


export const getCart = async (req, res) => {
  try {
    const { userId } = req.params; // Lấy userId từ params

    if (!userId) {
      return res.status(400).json({ message: "User ID is required." });
    }

    // Tìm giỏ hàng theo userId
    let cart = await Cart.findOne({ userId }).populate({
      path: "products.product",
      model: "Product"
    });

    // Nếu giỏ hàng không tồn tại, tạo giỏ hàng mới và trả về giỏ hàng trống
    if (!cart) {
      cart = new Cart({
        userId,
        products: [],
        total: 0,
        totalprice: 0
      });
      await cart.save();
      return res.status(200).json({
        message: "Cart created successfully",
        cart: cart.products,
        totalQuantity: cart.total,
        totalPrice: cart.totalprice
      });
    }

    // Trả về giỏ hàng với danh sách sản phẩm và các thông tin chi tiết
    return res.status(200).json({
      message: "Cart retrieved successfully",
      cart: cart.products,
      totalQuantity: cart.total,
      totalPrice: cart.totalprice
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};