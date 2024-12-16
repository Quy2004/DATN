import { Link } from "react-router-dom";
import instance from "../../services/api";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import { ArrowLeftOutlined } from "@ant-design/icons";
import Swal from "sweetalert2";
import { ProductTopping } from "../../types/product";
const CartPage: React.FC<{
  idcart: number;
}> = ({ idcart }) => {
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;
  const [cart, setCart] = useState<any>([]);
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [selectedItems, setSelectedItems] = useState<string[]>([]); 

  // Fetch cart data and calculate total price
  const fetchCart = async () => {
    try {
      const { data } = await instance.get(`/cart/${user._id}`);
      const mergedCart = data.cart.reduce((acc: any[], item: any) => {
      // Tạo ID duy nhất cho từng sản phẩm trong giỏ hàng
        const itemId = `${item.product?._id || "invalid"}-${
          item.product_sizes?._id || "invalid"
        }-${item.product_toppings
          ?.map((topping: any) => topping.topping_id?._id || "invalid")
          .join(",")}`;
         // Kiểm tra sản phẩm có hợp lệ không
        const isValidProduct =
          item.product && item.product_sizes && item.product_toppings;
  
        if (!isValidProduct) {
          console.warn("Invalid cart item detected and removed:", item);
          return acc; // Bỏ qua sản phẩm không hợp lệ
        }
  
        // Kiểm tra xem sản phẩm đã có trong danh sách chưa
        const existingItem = acc.find(
          (cartItem: any) => cartItem.itemId === itemId
        );
        if (existingItem) {
          existingItem.quantity += item.quantity;
        } else {
          acc.push({ ...item, itemId });
        }
        return acc;
      }, []);
      setCart(mergedCart);
      updateTotalPrice(mergedCart, selectedItems);
    } catch (error) {
      console.error("Error fetching cart:", error);
    }
  };

  const updateTotalPrice = (cart: any[], selectedItems: string[]) => {
    const total = cart.reduce((acc: number, item: any) => {
      if (selectedItems.includes(item.itemId)) {
        const productPrice =
          item?.product?.sale_price || item?.product?.price || 0;
        const sizePrice = item?.product_sizes?.priceSize || 0;
        const toppingPrice = Array.isArray(item?.product_toppings)
          ? item.product_toppings.reduce(
              (total: number, topping: any) =>
                total + (topping?.topping_id?.priceTopping || 0),
              0
            )
          : 0;
        return acc + (productPrice + sizePrice + toppingPrice) * item.quantity;
      }
      return acc;
    }, 0);
    setTotalPrice(total);
  };

  useEffect(() => {
    fetchCart();
  }, []);

  useEffect(() => {
    updateTotalPrice(cart, selectedItems); // Recalculate when selectedItems change
  }, [selectedItems]);

  // Handle increasing or decreasing the product quantity
  const handleQuantityChange = async (
    cartItemId: string,
    increase: boolean
  ) => {
    console.log(
      `Handling quantity change for cart item: ${cartItemId}, increase: ${increase}`
    );
    try {
      const response = await instance.patch(
        `/cart/${user._id}/item/${cartItemId}/quantity`,
        { increase }
      );

      if (response.status === 200) {
        fetchCart();
      } else {
        console.error("Không thể cập nhật số lượng sản phẩm.");
      }
    } catch (error) {
      console.error("Không thể cập nhật số lượng sản phẩm.");
    }
  };

  // Format currency for display
  const formatCurrency = (amount: number) => {
    return `${new Intl.NumberFormat("vi-VN", {
      maximumFractionDigits: 0, // Bỏ phần thập phân nếu không cần
    }).format(amount)} VNĐ`;
  };

  // Xóa sản phẩm
  const deleteCartItem = async (cartItemId: any) => {
    try {
      const response = await instance.delete(`/cart/item/${cartItemId}`);
      const updatedCart = response.data?.cart;

      if (updatedCart) {
        fetchCart();
        toast.success("Đã xóa sản phẩm");
      } else {
        console.warn("Không có dữ liệu giỏ hàng nào được trả về sau khi xóa.");
      }

      return updatedCart; // Trả về giỏ hàng đã cập nhật
    } catch (error) {
      console.error("Failed to delete cart item:", error);
      toast.error("Không thể xóa sản phẩm, vui lòng thử lại.");
      throw error;
    }
  };

  // Hàm xử lý xóa giỏ hàng trên frontend
  const handleDeleteCartItem = async (cartItemId) => {
    try {
      await deleteCartItem(cartItemId);
      const updatedCart = cart.filter((item) => item._id !== cartItemId);
      setCart(updatedCart);
    } catch (error) {
      alert("Có lỗi xảy ra khi xóa mục giỏ hàng.");
    }
  };
  // Xóa sản phẩm được chọn
  const deleteSelectedItems = async () => {
    if (selectedItems.length === 0) {
      toast.error("Vui lòng chọn sản phẩm cần xóa");
      return;
    }

    try {
      const itemsToDelete = cart
        .filter((item: any) =>
          selectedItems.includes(
            `${item.product._id}-${
              item.product_sizes?._id
            }-${item.product_toppings
              ?.map((topping: any) => topping.topping_id._id)
              .join(",")}`
          )
        )
        .map((item: any) => item._id);

      const response = await instance.delete(`/cart/${user._id}/selected`, {
        data: { itemIds: itemsToDelete },
      });

      if (response.status === 200) {
        const updatedCart = cart.filter(
          (item: any) => !itemsToDelete.includes(item._id)
        );
        setCart(updatedCart);

        setSelectedItems([]);

        // Show success toast
        toast.success(`Đã xóa ${itemsToDelete.length} sản phẩm thành công`);
      } else {
        toast.error("Không thể xóa sản phẩm. Vui lòng thử lại.");
      }
    } catch (error) {
      console.error("Error deleting items:", error);
      toast.error("Đã có lỗi xảy ra. Vui lòng thử lại.");
    }
  };

  // Xóa tất cả sản phẩm
  const deleteAllItems = async () => {
    const confirmation = await Swal.fire({
      title: "Xác nhận xóa",
      text: "Bạn có chắc chắn muốn xóa toàn bộ giỏ hàng?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
    });

    if (confirmation.isConfirmed) {
      try {
        const response = await instance.delete(`/cart/clear/${user._id}`);
        if (response.status === 200) {
          fetchCart();
          toast.success("Đã xóa toàn bộ giỏ hàng thành công");
        }
      } catch (error) {
        console.error("Error clearing cart:", error);
        toast.error("Không thể xóa giỏ hàng, vui lòng thử lại.");
      }
    }
  };

  const toggleItemSelection = (item: any) => {
    const generateItemId = (cartItem: any): string => {
      const productId = cartItem.product._id;
      const sizeId = cartItem.product_sizes?._id || "no-size";
      const toppingIds = cartItem.product_toppings
        ? cartItem.product_toppings
            .map((topping: any) => topping.topping_id._id)
            .sort() // Ensure consistent ordering
            .join(",")
        : "no-toppings";

      return `${productId}-${sizeId}-${toppingIds}`;
    };

    const itemId = generateItemId(item);

    setSelectedItems((prevSelectedItems) => {
      if (prevSelectedItems.includes(itemId)) {
        return prevSelectedItems.filter((id) => id !== itemId);
      }

      return [...prevSelectedItems, itemId];
    });
  };

  const toggleAllItemsSelection = () => {
    if (selectedItems.length === cart.length) {
      setSelectedItems([]);
    } else {
      const allItemIds = cart.map(
        (item: any) =>
          `${item.product._id}-${
            item.product_sizes?._id
          }-${item.product_toppings
            ?.map((topping: any) => topping.topping_id._id)
            .join(",")}`
      );
      setSelectedItems(allItemIds);
    }
  };
  const calculateItemTotal = (item: any) => {
    const basePrice = item?.product?.sale_price || 0; // Giá sản phẩm
    const sizePrice = item?.product_sizes?.priceSize || 0; // Giá kích thước
    const toppingsPrice = (item?.product_toppings || []).reduce(
      (total: any, topping: any) => {
        return total + (topping?.topping_id?.priceTopping || 0); // Tổng giá topping
      },
      0
    );

    // Tổng giá từng sản phẩm = (Giá cơ bản + Giá kích thước + Giá topping) * Số lượng
    return (basePrice + sizePrice + toppingsPrice) * item.quantity;
  };

  return (
   <section className="mt-[60px] bg-white py-4 antialiased dark:bg-gray-900 md:py-10 my-2">
      {user ? (
        user?.role !== "admin" ? (
          <div className="mx-auto max-w-screen-xl px-4 2xl:px-0">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white sm:text-2xl">
              Giỏ hàng
            </h2>
             <p className="border-b-orange-400 w-20 md:w-24 border-b-[4px] my-1"></p>
            <div className="mt-6 sm:mt-8 md:gap-8 lg:flex lg:items-start xl:gap-10">
              {/* Main Cart Content */}
              <div className="mx-auto w-full flex-none lg:max-w-3xl xl:max-w-4xl">
                {/* Only render the cart section if there are items in the cart */}
                {cart.length > 0 ? (
                  <>
                    {/* Select All Header */}
                    <div className="mb-6 flex items-center justify-between bg-white p-5 rounded-xl border border-gray-200 shadow-md hover:shadow-xl transition-shadow duration-300">
                      <div className="flex items-center space-x-4">
                        <input
                          type="checkbox"
                          className="h-5 w-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500 transition duration-150 ease-in-out"
                          checked={selectedItems.length === cart.length}
                          onChange={toggleAllItemsSelection}
                        />
                        <span className="text-gray-700 font-medium">
                          Chọn tất cả
                        </span>
                      </div>
                      <div className="flex gap-6">
                        <button
                          onClick={deleteSelectedItems}
                          disabled={selectedItems.length === 0}
                          className={`text-sm font-medium text-red-600 hover:text-red-700 flex items-center transition-colors duration-200 ${
                            selectedItems.length === 0
                              ? "opacity-50 cursor-not-allowed"
                              : "hover:scale-105"
                          }`}
                        >
                          Xóa đã chọn
                        </button>
                        <button
                          onClick={deleteAllItems}
                          className="text-sm font-medium text-red-600 hover:text-red-700 flex items-center transition-colors duration-200 hover:scale-105"
                        >
                          Xóa tất cả
                        </button>
                      </div>
                    </div>

                    {/* Cart Items */}
                    {cart.map((item: any) => (
                      <div
                        key={item.product._id}
                        className="mb-4 rounded-xl border border-gray-200 bg-white p-6 shadow-md hover:shadow-xl transition-all duration-300 dark:border-gray-700 dark:bg-gray-800"
                      >
                        <div className="flex flex-col md:flex-row md:items-center md:gap-8">
                          {/* Checkbox and Image */}
                          <div className="flex items-center md:order-1">
                            <input
                              type="checkbox"
                              checked={selectedItems.includes(
                                `${item.product._id}-${
                                  item.product_sizes?._id
                                }-${item.product_toppings
                                  ?.map(
                                    (topping: any) => topping.topping_id._id
                                  )
                                  .join(",")}`
                              )}
                              onChange={() => toggleItemSelection(item)}
                              className="relative md:sticky top-24 mr-4 h-5 w-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                            />

                            <Link  to={`/detail/${item.product._id}`} className="flex-shrink-0 mb-2 md:mb-0">
                              <img
                                className="h-24 w-24 rounded-lg object-cover dark:hidden border"
                                src={item.product.image}
                                alt="product image"
                              />
                            </Link>
                          </div>

                          {/* Product Details */}
                          <div className="flex-1 md:space-y-4 space-y-1 pl-9 md:order-2 md:pl-0">
                            <Link
                              to={`/detail/${item.product._id}`}
                              className="text-lg font-semibold text-gray-900 hover:text-primary-600 transition-colors duration-200 dark:text-white"
                            >
                              {item.product.name}
                            </Link>
                            <div className="space-y-1 text-sm text-gray-600">
                              <p>
                                 Size: <span className="font-medium">{item?.product_sizes?.name}{" "}</span>
                                {item?.product_sizes?.priceSize > 0 && (
                                  <span className="text-gray-500 font-medium">{`(+${item?.product_sizes?.priceSize} VNĐ)`}</span>
                                )}
                              </p>

                              <p>
                                Topping:{" "}
                                {item?.product_toppings &&
                                item?.product_toppings.length > 0 ? (
                                  item?.product_toppings.map(
                                    (
                                      topping: ProductTopping,
                                      index: number
                                    ) => (
                                      <span
                                        key={topping?.topping_id?._id}
                                        className="font-medium"
                                      >
                                        {topping?.topping_id?.nameTopping}
                                        {topping?.topping_id?.priceTopping >
                                          0 && (
                                          <span className="text-gray-500">
                                            {` (+${topping?.topping_id?.priceTopping} VNĐ)`}
                                          </span>
                                        )}
                                        {index <
                                          item?.product_toppings.length - 1 &&
                                          ", "}
                                      </span>
                                    )
                                  )
                                ) : (
                                  <span className="text-gray-500">
                                    Không có Topping
                                  </span>
                                )}
                              </p>
                            </div>
                            <button
                              onClick={() => handleDeleteCartItem(item._id)}
                              className="mt-2 border-2 border-red-500 px-2 rounded-lg hover:bg-red-500 text-sm font-medium text-red-500 hover:text-white transition-colors duration-200"
                            >
                              Xóa
                            </button>
                          </div>

                          {/* Quantity Controls and Price */}
                          <div className="mt-4 flex items-center justify-between pl-[35px] gap-6 md:order-3 md:pl-0 md:mt-0">
                            <div className="flex items-center space-x-3">
                              <button
                                onClick={() =>
                                  handleQuantityChange(item._id, false)
                                }
                                className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors duration-200"
                              >
                                -
                              </button>
                              <input
                                value={item.quantity}
                                readOnly
                                className="w-12 h-10 text-center bg-white border-2 border-gray-200 rounded-lg shadow-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500 transition-all duration-300"
                              />
                              <button
                                onClick={() =>
                                  handleQuantityChange(item._id, true)
                                }
                                className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors duration-200"
                              >
                                +
                              </button>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold text-gray-900 dark:text-white">
                                <div className="flex justify-end w-full">
                                  {/* Giá tổng */}
                                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                                    {formatCurrency(calculateItemTotal(item))}
                                  </p>
                                </div>
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </>
                ) : (
                  // Display when there are no items in the cart
                  <div className="text-center p-8 transition-all duration-300 dark:bg-gray-800 dark:text-white">
                    <p className="text-3xl text-red-600 font-bold mb-6">
                      Giỏ hàng của bạn đang trống.
                    </p>
                    <div className="flex items-center justify-center gap-4 mb-6">
                      <ArrowLeftOutlined className="text-red-600 text-2xl" />
                      <Link
                        to="/"
                        className="inline-flex items-center gap-3 text-lg font-semibold text--600 hover:text--700 transition-colors duration-200 py-3 px-6 rounded-lg bg-red-100 hover:bg-red-200 dark:bg-blue-500 dark:hover:bg-blue-600"
                      >
                        Quay lại trang chủ
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Order Summary */}
              {cart.length > 0 && (
                <div className="mx-auto mt-8 w-full max-w-md lg:mt-0">
                  <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-md hover:shadow-lg transition-all duration-300 dark:border-gray-700 dark:bg-gray-800">
                    <h2 className="text-xl font-bold text-gray-900 mb-6 dark:text-white">
                      Hóa đơn thanh toán
                    </h2>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between border-t border-gray-200 pt-4 dark:border-gray-700">
                        <span className="text-lg font-bold text-gray-900 dark:text-white">
                          Tổng giá
                        </span>
                        <span className="text-lg font-bold text-gray-900 dark:text-white">
                          {formatCurrency(totalPrice || 0)}
                        </span>
                      </div>
                    </div>
                    <Link
                      to={{
                        pathname: "/checkout",
                      }}
                      state={cart.filter((item: any) =>
                        selectedItems.includes(
                          `${item.product._id}-${
                            item.product_sizes?._id
                          }-${item.product_toppings
                            ?.map((topping: any) => topping.topping_id._id)
                            .join(",")}`
                        )
                      )}
                      className={`mt-6 block w-full rounded-lg ${
                        selectedItems.length === 0
                          ? "bg-gray-300 cursor-not-allowed"
                          : "bg-[#ea8025]"
                      } px-6 py-3 text-center text-sm font-semibold text-white hover:bg-[#ff8e37] transition-colors duration-200 transform ${
                        selectedItems.length > 0 ? "hover:scale-[1.02]" : ""
                      }`}
                      onClick={(e) => {
                        if (selectedItems.length === 0) {
                          e.preventDefault(); // Ngăn chặn hành động mặc định
                          toast.error(
                            "Vui lòng chọn ít nhất một sản phẩm để tiếp tục thanh toán!"
                          );
                        }
                      }}
                    >
                      Tiến hành thanh toán
                    </Link>

                    <div className="mt-4 flex items-center justify-center gap-3">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        hoặc
                      </span>
                      <Link
                        to="/"
                        className="group inline-flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors duration-200"
                      >
                        Tiếp tục mua sắm
                        <svg
                          className="h-5 w-5 transform transition-transform group-hover:translate-x-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M14 5l7 7m0 0l-7 7m7-7H3"
                          />
                        </svg>
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <span className="relative z-10 transition duration-300 text-red-600 text-center">
            <p className="text-2xl mt-16">
              Vui lòng đăng nhập tài khoản người dùng
            </p>
            <div className="flex items-center justify-center gap-4 mb-6 mt-8">
              <Link
                to="/login"
                className="inline-flex items-center gap-3 text-lg font-semibold text--600 hover:text--700 transition-colors duration-200 py-3 px-6 rounded-lg bg-red-100 hover:bg-red-200 dark:bg-blue-500 dark:hover:bg-blue-600"
              >
                Đăng nhập
              </Link>
            </div>
          </span>
        )
      ) : (
        <span className=" mt-10 transition duration-300 text-red-600 text-center ">
          <p className="text-2xl mt-16">
            Bạn chưa đăng nhập. Vui lòng đăng nhập để mua hàng.
          </p>
          <div className="flex items-center justify-center gap-4 mb-6 mt-6">
            <Link
              to="/login"
              className="inline-flex items-center gap-3 text-lg font-semibold text--600 hover:text--700 transition-colors duration-200 py-3 px-6 rounded-lg bg-red-100 hover:bg-red-200 dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              Đăng nhập
            </Link>
          </div>
        </span>
      )}
    </section>
  );
};

export default CartPage;
