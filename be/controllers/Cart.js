import Cart from "../models/Cart.js";
import Product from "../models/ProductModel";
import Size from "../models/Size.js";
import Topping from "../models/ToppingModel.js";
const calculateTotalPrice = async (cart) => {
  let totalPrice = 0;

  // Lấy tất cả các sản phẩm, kích thước và topping cùng một lúc
  const productIds = cart.products.map((item) => item.product);
  const sizeIds = cart.products
    .map((item) => item.product_sizes)
    .filter(Boolean);
  const toppingIds = cart.products
    .map((item) => item.product_toppings.map((t) => t.topping_id))
    .flat();

  // Thực hiện các truy vấn cần thiết
  const products = await Product.find({ _id: { $in: productIds } });
  const sizes = await Size.find({ _id: { $in: sizeIds } });
  const toppings = await Topping.find({ _id: { $in: toppingIds } });

  // Tạo map để dễ dàng truy xuất thông tin về sản phẩm, kích thước và topping
  const productMap = products.reduce((map, product) => {
    map[product._id.toString()] = product;
    return map;
  }, {});

  const sizeMap = sizes.reduce((map, size) => {
    map[size._id.toString()] = size;
    return map;
  }, {});

  const toppingMap = toppings.reduce((map, topping) => {
    map[topping._id.toString()] = topping;
    return map;
  }, {});

  // Tính tổng giá
  for (const item of cart.products) {
    const baseProduct = productMap[item.product.toString()];
    const size = sizeMap[item.product_sizes._id.toString()] || null;
    const toppingsPrice = item.product_toppings.reduce((sum, topping) => {
      const toppingData = toppingMap[topping.topping_id._id.toString()];
      return sum + (toppingData ? toppingData.priceTopping : 0);
    }, 0);

    const sizePrice = size ? size.priceSize : 0;
    const productPrice = baseProduct ? baseProduct.price : 0;

    totalPrice += (productPrice + sizePrice + toppingsPrice) * item.quantity;
  }

  return totalPrice;
};

export const addToCart = async (req, res) => {
  try {
    const { userId, productId, quantity, productSizes, productToppings } =
      req.body;

    if (!userId || !productId) {
      return res
        .status(400)
        .json({ message: "User ID and Product ID are required." });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res
        .status(404)
        .json({ message: `Product with ID ${productId} not found.` });
    }

    const sizeDetails = productSizes ? await Size.findById(productSizes) : null;
    const toppingsDetails = productToppings
      ? await Topping.find({ _id: { $in: productToppings } })
      : [];

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      // Nếu giỏ hàng chưa tồn tại, tạo mới giỏ hàng với sản phẩm
      cart = new Cart({
        userId,
        products: [
          {
            product: productId,
            quantity,
            product_sizes: productSizes,
product_toppings: toppingsDetails.map((t) => ({
              topping_id: t._id,
              priceTopping: t.price,
            })),
          },
        ],
      });
    } else {
      // Kiểm tra sản phẩm có sẵn trong giỏ hàng chưa
      const existingProduct = cart.products.find(
        (p) =>
          p.product.toString() === productId &&
          p.product_sizes?.toString() === productSizes
      );

      if (existingProduct) {
        // Nếu có, tăng giảm số lượng sản phẩm
        existingProduct.quantity += quantity;
        existingProduct.quantity = Math.max(1, existingProduct.quantity);

        // Kiểm tra và thêm topping mới nếu có
        const existingToppingIds = existingProduct.product_toppings.map((t) =>
          t.topping_id.toString()
        );
        const newToppings = productToppings.filter(
          (topping) => !existingToppingIds.includes(topping)
        );

        if (newToppings.length > 0) {
          const newToppingDetails = await Topping.find({
            _id: { $in: newToppings },
          });
          existingProduct.product_toppings.push(
            ...newToppingDetails.map((topping) => ({
              topping_id: topping._id,
              priceTopping: topping.price,
            }))
          );
        }
      } else {
        // Nếu chưa có, thêm mới sản phẩm vào giỏ
        cart.products.push({
          product: productId,
          quantity,
          product_sizes: productSizes,
          product_toppings: toppingsDetails.map((t) => ({
            topping_id: t._id,
            priceTopping: t.price,
          })),
        });
      }
    }

    // Tính tổng giá sau khi thay đổi
    cart.totalprice = await calculateTotalPrice(cart);
    await cart.save();

    return res
      .status(200)
      .json({ message: "Product added to cart successfully.", cart });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

export const getCart = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required." });
    }

    let cart = await Cart.findOne({ userId })
      .populate({
        path: "products.product",
        model: "Product",
        select: "name price sale_price image",
      })
      .populate({
        path: "products.product_sizes",
        model: "Size",
        select: "name priceSize",
      })
      .populate({
        path: "products.product_toppings.topping_id",
        model: "Topping",
        select: "nameTopping priceTopping",
      });

    if (!cart) {
      cart = new Cart({ userId, products: [], totalprice: 0 });
      await cart.save();
      return res.status(200).json({
        message: "Cart created successfully.",
        cart: cart.products,
        totalPrice: cart.totalprice,
      });
    }
// Tính toán giá tổng sau khi lấy tất cả thông tin sản phẩm
    const totalPrice = cart.products.reduce((total, item) => {
      const product = item.product;

      // Giá cơ bản sản phẩm
      const basePrice = product.sale_price || product.price || 0;

      // Giá size
      const sizePrice = item.product_sizes?.priceSize || 0;

      // Tổng giá topping
      const toppingsPrice = item.product_toppings.reduce((acc, topping) => {
        return acc + (topping.topping_id?.priceTopping || 0);
      }, 0);

      // Tổng giá 1 sản phẩm = (giá cơ bản + size + topping) × số lượng
      const itemTotal = (basePrice + sizePrice + toppingsPrice) * item.quantity;

      return total + itemTotal;
    }, 0);

    // Làm tròn totalPrice đến 2 chữ số thập phân
    const roundedTotalPrice = Math.round(totalPrice * 100) / 100;

    return res.status(200).json({
      message: "Cart retrieved successfully.",
      cart: cart.products,
      totalPrice: roundedTotalPrice,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

// Xóa một sản phẩm trong giỏ hàng
export const deleteCartItem = async (req, res) => {
  try {
    const { cartId, productId } = req.params;

    // Validate input
    if (!cartId || !productId) {
      return res.status(400).json({
        success: false,
        message: "Cart ID and Product ID are required.",
      });
    }

    // Find and update cart in single database operation
    const cart = await Cart.findByIdAndUpdate(
      cartId,
      {
        $pull: { products: { product: productId } },
        $inc: { totalprice: -(await calculateItemPrice(cartId, productId)) },
      },
      { new: true }
    );

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product deleted from cart successfully.",
      data: {
        products: cart.products,
        totalPrice: cart.totalprice,
      },
    });
  } catch (error) {
    console.error("Delete cart item error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
// Xóa tất cả
export const clearCart = async (req, res) => {
  try {
    const { cartId } = req.params;

    if (!cartId) {
      return res.status(400).json({
        success: false,
        message: "Cart ID is required.",
      });
    }

    // Update cart in single operation
    const cart = await Cart.findByIdAndUpdate(
      cartId,
      {
        products: [],
        totalprice: 0,
      },
      { new: true }
    );

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found.",
      });
    }
return res.status(200).json({
      success: true,
      message: "All products deleted from cart successfully.",
      data: {
        products: cart.products,
        totalPrice: cart.totalprice,
      },
    });
  } catch (error) {
    console.error("Clear cart error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const updateProductQuantity = async (req, res) => {
  const { userId, productId, quantity } = req.body;
  try {
    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ error: "Cart not found" });

    const product = cart.products.find(
      (p) => p.product.toString() === productId
    );
    if (!product) return res.status(404).json({ error: "Product not found" });

    product.quantity = quantity;
    cart.totalprice = await calculateTotalPrice(cart);
    await cart.save();

    return res.status(200).json({ cart });
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const changeProductQuantity = async (req, res) => {
  const { userId, productId, increase } = req.body;
  try {
    // Tìm giỏ hàng của người dùng
    let cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    // Tìm sản phẩm trong giỏ hàng
    const product = cart.products.find(
      (item) => item.product.toString() === productId
    );
    if (!product) return res.status(404).json({ message: "Product not found" });

    // Kiểm tra điều kiện increase và xử lý tăng/giảm
    if (increase) {
      product.quantity++; // Tăng số lượng sản phẩm
    } else {
      // Giảm số lượng nếu > 1 (hoặc điều kiện khác)
      if (product.quantity > 1) {
        product.quantity--; // Giảm số lượng sản phẩm
      } else {
        return res
          .status(400)
          .json({ message: "Cannot reduce quantity below 1" });
      }
    }

    // Tính lại tổng giá trị giỏ hàng
    cart.totalprice = await calculateTotalPrice(cart);

    // Lưu lại giỏ hàng với số lượng mới
    await cart.save();

    return res.status(200).json({ cart });
  } catch (error) {
    console.error("Error in updating quantity:", error);
    return res.status(500).json({ message: error.message });
  }
};