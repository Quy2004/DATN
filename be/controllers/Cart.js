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
        .json({ message: "Cần cung cấp ID người dùng và ID sản phẩm." });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res
        .status(404)
        .json({ message: `Không tìm thấy sản phẩm với ID ${productId}.` });
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
          p.product_sizes?.toString() === productSizes &&
          p.product_toppings.every((topping) =>
            productToppings.includes(topping.topping_id.toString())
          )
      );

      if (existingProduct) {
        // Nếu có, tăng số lượng sản phẩm
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

    return res.status(200).json({
      message: "Sản phẩm đã được thêm vào giỏ hàng thành công.",
      cart,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Lỗi máy chủ", error: error.message });
  }
};

export const getCart = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ message: "ID người dùng là bắt buộc." });
    }

    let cart = await Cart.findOne({ userId })
      .populate({
        path: "products.product",
        model: "Product",
        select: "name price sale_price image discount",
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
        message: "Giỏ hàng đã được tạo thành công.",
        cart: cart.products,
        totalPrice: cart.totalprice,
      });
    }

    // Xử lý giỏ hàng để kết hợp các sản phẩm có cùng tên, size và topping
   const combinedProducts = [];

   cart.products.forEach((item) => {
     // So sánh chi tiết hơn với sản phẩm, size và topping
     const existingProduct = combinedProducts.find(
       (product) =>
         product.product._id.toString() === item.product._id.toString() &&
         product.product_sizes._id.toString() ===
           item.product_sizes._id.toString() &&
         // So sánh toàn bộ danh sách topping đã sắp xếp
         JSON.stringify(
           product.product_toppings
             .map((topping) => topping.topping_id._id.toString())
             .sort()
         ) ===
           JSON.stringify(
             item.product_toppings
               .map((topping) => topping.topping_id._id.toString())
               .sort()
           )
     );

     if (existingProduct) {
       existingProduct.quantity += item.quantity;
     } else {
       combinedProducts.push(item);
     }
   });
    // Tính lại tổng giá trị
    const totalPrice = combinedProducts.reduce((total, item) => {
      const product = item.product;

      // Giá cơ bản ưu tiên sale_price
      let basePrice = product.price || product.sale_price || 0;

      // Áp dụng giảm giá phần trăm nếu có
      if (product.discount > 0) {
        basePrice = basePrice * (1 - product.discount / 100);
      }

      // Giá size
      const sizePrice = item.product_sizes?.priceSize || 0;

      // Giá topping
      const toppingsPrice = item.product_toppings.reduce((acc, topping) => {
        return acc + (topping.topping_id?.priceTopping || 0);
      }, 0);

      // Tổng giá cho sản phẩm này
      const itemTotal = (basePrice + sizePrice + toppingsPrice) * item.quantity;

      return total + itemTotal;
    }, 0);

    // Cập nhật tổng giá trị giỏ hàng
    cart.products = combinedProducts;
    cart.totalprice = Math.round(totalPrice * 100) / 100;
    await cart.save();
return res.status(200).json({
      message: "Giỏ hàng đã được lấy thành công.",
      cart: cart.products,
      totalPrice: cart.totalprice,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Lỗi máy chủ", error: error.message });
  }
};
// 1. Xóa một sản phẩm khỏi giỏ hàng
export const removeCartItem = async (req, res) => {
  try {
    const { cartItemId } = req.params;

    // Kiểm tra cartItemId hợp lệ
    if (!cartItemId) {
      return res.status(400).json({ message: "ID sản phẩm không hợp lệ" });
    }

    // Cập nhật giỏ hàng bằng cách xóa sản phẩm
    const cart = await Cart.findOneAndUpdate(
      { "products._id": cartItemId },
      { $pull: { products: { _id: cartItemId } } },
      { new: true }
    )
      .populate("products.product")
      .populate("products.product_sizes")
      .populate("products.product_toppings.topping_id");

    if (!cart) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy sản phẩm trong giỏ hàng" });
    }

    // Tính lại tổng giá
    cart.totalprice = cart.products.reduce((total, item) => {
      const price = item.product?.price || 0;
      const quantity = item.quantity || 1;
      return total + price * quantity;
    }, 0);

    await cart.save();

    return res.status(200).json({
      message: "Xóa sản phẩm thành công",
      cart,
    });
  } catch (error) {
    console.error("Error in removeCartItem:", error);
    return res.status(500).json({ message: error.message });
  }
};

// 2. Xóa nhiều sản phẩm được chọn
export const removeSelectedItems = async (req, res) => {
  try {
    const { itemIds } = req.body;
    const { userId } = req.params;

    if (!itemIds || !Array.isArray(itemIds) || itemIds.length === 0) {
      return res
        .status(400)
        .json({ message: "Vui lòng chọn sản phẩm cần xóa" });
    }

    // Tìm giỏ hàng của người dùng
    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({ message: "Không tìm thấy giỏ hàng" });
    }

    // Kiểm tra và xóa các sản phẩm được chọn
    const updatedCart = await Cart.findOneAndUpdate(
      { userId, "products._id": { $in: itemIds } },
      { $pull: { products: { _id: { $in: itemIds } } } },
      { new: true }
    )
      .populate("products.product")
      .populate("products.product_sizes")
      .populate("products.product_toppings.topping_id");

    // Nếu không tìm thấy giỏ hàng đã cập nhật
    if (!updatedCart) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy sản phẩm trong giỏ hàng" });
    }

    // Tính lại tổng giá
    updatedCart.totalprice = updatedCart.products.reduce((total, item) => {
      const productPrice = item.product.sale_price || item.product.price;
      const sizePrice = item.product_sizes?.priceSize || 0;
      const toppingPrice = item.product_toppings.reduce(
        (sum, topping) => sum + (topping.topping_id?.priceTopping || 0),
        0
      );
      return total + (productPrice + sizePrice + toppingPrice) * item.quantity;
    }, 0);

    await updatedCart.save();

    return res.status(200).json({
      message: "Xóa các sản phẩm đã chọn thành công",
      cart: updatedCart,
    });
  } catch (error) {
    console.error("Lỗi:", error);
    return res.status(500).json({ message: error.message });
  }
};

// 3. Xóa toàn bộ giỏ hàng
export const clearCart = async (req, res) => {
  try {
    // Lấy userId từ request parameters
    const { userId } = req.params;

    // Xóa toàn bộ sản phẩm trong giỏ hàng
    const cart = await Cart.findOneAndUpdate(
      { userId: userId },
      { $set: { products: [], totalprice: 0 } },
      { new: true }
    );

    if (!cart) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy giỏ hàng của người dùng" });
    }

    return res.status(200).json({
      message: "Xóa toàn bộ giỏ hàng thành công",
      cart,
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      message: "Đã xảy ra lỗi khi xóa giỏ hàng",
      error: error.message,
    });
  }
};

export const changeProductQuantity = async (req, res) => {
  try {
    const { userId, cartItemId } = req.params;
    const { increase } = req.body; // `true` để tăng số lượng, `false` để giảm

    // Tìm giỏ hàng
    const cart = await Cart.findOne({
      userId,
      "products._id": cartItemId,
      "products.isDeleted": false,
    }).populate(
      "products.product products.product_sizes products.product_toppings"
    );

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy giỏ hàng hoặc sản phẩm",
      });
    }

    // Tìm sản phẩm trong giỏ hàng
    const product = cart.products.find(
      (item) => item._id.toString() === cartItemId
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy sản phẩm trong giỏ hàng",
      });
    }

    // Thay đổi số lượng
    if (increase) {
      product.quantity += 1;
    } else {
      if (product.quantity === 1) {
        return res
          .status(400)
          .json({ success: false, message: "Không thể giảm số lượng dưới 1" });
      }
      product.quantity -= 1;
    }

    // Tính toán lại tổng giá tiền
    const totalPrice = cart.products.reduce((total, item) => {
      // Giá sản phẩm (ưu tiên giá khuyến mãi nếu có)
      const productPrice =
        item.product.sale_price !== undefined
          ? item.product.sale_price
          : item.product.price;

      // Giá kích cỡ (nếu có)
      const sizePrice = item.product_sizes?.priceSize || 0;

      // Tổng giá topping
      const toppingPrice = item.product_toppings.reduce(
        (sum, topping) => sum + topping.price,
        0
      );

      // Tính giá tổng của sản phẩm hiện tại
      const itemTotal =
        (productPrice + sizePrice + toppingPrice) * item.quantity;

      // Cộng vào tổng giá giỏ hàng
      return total + itemTotal;
    }, 0);

    // Lưu thay đổi
    await cart.save();

    return res.status(200).json({
      success: true,
      message: "Đã cập nhật số lượng thành công",
      cart: cart.products,
      totalPrice,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

