import { Link } from "react-router-dom";
import instance from "../../services/api";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { ArrowLeftOutlined } from "@ant-design/icons";
import Swal from "sweetalert2";
import { ProductTopping } from "../../types/product";

const CartPage: React.FC<{ idcart: number }> = ({ idcart }) => {
  const user = JSON.parse(localStorage.getItem("user") || "");
  const [cart, setCart] = useState<any>([]);
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [totalSelectedPrice, setTotalSelectedPrice] = useState<number>(0);

  const fetchCart = async () => {
    try {
      const { data } = await instance.get(`/cart/${user._id}`);
      const mergedCart = data.cart.reduce((acc: any[], item: any) => {
        const itemId = item._id;
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

  const calculateSelectedTotalPrice = () => {
    return cart.reduce((total, item) => {
      if (selectedItems.includes(item._id)) {
        const basePrice =
          item?.product?.sale_price || item?.product?.price || 0;
        const sizePrice = item?.product_sizes?.priceSize || 0;
        const toppingsPrice = (item?.product_toppings || []).reduce(
          (sum, topping) => sum + (topping?.topping_id?.priceTopping || 0),
          0
        );

        // Total price for each selected item multiplied by quantity
        return total + (basePrice + sizePrice + toppingsPrice) * item.quantity;
      }
      return total;
    }, 0);
  };

  useEffect(() => {
    fetchCart();
  }, []);

  useEffect(() => {
    updateTotalPrice(cart, selectedItems);
    setTotalSelectedPrice(calculateSelectedTotalPrice());
  }, [selectedItems, cart]);

  const handleQuantityChange = async (
    cartItemId: string,
    increase: boolean
  ) => {
    try {
      const response = await instance.patch(
        `/cart/${user._id}/item/${cartItemId}/quantity`,
        { increase }
      );
      if (response.status === 200) {
        fetchCart();
      }
    } catch (error) {
      console.error("Cannot update item quantity.");
    }
  };

  const formatCurrency = (amount: number) => {
    return `${new Intl.NumberFormat("vi-VN", {
      maximumFractionDigits: 0,
    }).format(amount)} VND`;
  };

  const deleteCartItem = async (cartItemId: any) => {
    try {
      await instance.delete(`/cart/item/${cartItemId}`);
      fetchCart();
      toast.success("Đã xóa sản phẩm");
    } catch (error) {
      console.error("Failed to delete cart item:", error);
      toast.error("Không thể xóa sản phẩm, vui lòng thử lại.");
    }
  };

  const handleDeleteCartItem = async (cartItemId) => {
    await deleteCartItem(cartItemId);
    const updatedCart = cart.filter((item) => item._id !== cartItemId);
    setCart(updatedCart);
  };

  const deleteSelectedItems = async () => {
    if (selectedItems.length === 0) {
      toast.error("Vui lòng chọn sản phẩm cần xóa");
      return;
    }

    try {
      const response = await instance.delete(`/cart/${user._id}/selected`, {
        data: { itemIds: selectedItems },
      });
      if (response.status === 200) {
        fetchCart();
        setSelectedItems([]);
        toast.success("Xóa các sản phẩm đã chọn thành công");
      }
    } catch (error) {
      console.error("Lỗi khi xóa các sản phẩm đã chọn:", error);
      toast.error("Đã xảy ra lỗi khi xóa sản phẩm. Vui lòng thử lại.");
    }
  };

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
    const itemId = item._id; // Use the product's _id
    setSelectedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  const toggleAllItemsSelection = () => {
    if (selectedItems.length === cart.length) {
      setSelectedItems([]);
    } else {
      const allItemIds = cart.map((item) => item._id);
      setSelectedItems(allItemIds);
    }
  };

  return (
    <section className="containerAll mx-auto bg-white py-8 antialiased dark:bg-gray-900 md:py-16 my-4">
      <div className="mx-auto max-w-screen-xl px-4 2xl:px-0">
        <h2 className="w-max pt-4 text-xl font-semibold mb-1 mt-6 md:pt-6 md:mt-0 md:text-3xl md:mb-3">
          Giỏ hàng
        </h2>
        <p className="border-b-orange-400 w-20 border-b-[4px] my-1 md:w-[122px]"></p>
        <div className="mt-6 sm:mt-8 md:gap-8 lg:flex lg:items-start xl:gap-10">
          <div className="mx-auto w-full flex-none lg:max-w-3xl xl:max-w-4xl">
            {cart.length > 0 ? (
              <>
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

                {cart.map((item: any) => (
                  <div
                    key={item._id}
                    className="mb-4 rounded-xl border border-gray-200 bg-white p-6 shadow-md hover:shadow-xl transition-all duration-300 dark:border-gray-700 dark:bg-gray-800"
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:gap-8">
                      <div className="flex items-center md:order-1">
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(item._id)}
                          onChange={() => toggleItemSelection(item)}
                          className="mr-4 h-5 w-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        <Link to="" className="flex-shrink-0">
                          <img
                            className="h-24 w-24 rounded-lg object-cover dark:hidden"
                            src={item.product.image}
                            alt="product"
                          />
                        </Link>
                      </div>

                      <div className="flex-1 space-y-4 md:order-2">
                        <Link
                          to="#"
                          className="text-lg font-semibold text-gray-900 hover:text-primary-600 transition-colors duration-200 dark:text-white"
                        >
                          {item.product.name}
                        </Link>
                        <div className="space-y-2 text-sm text-gray-600">
                          <p>
                            Size:{" "}
                            <span className="text-gray-500 font-medium">
                              {item?.product_sizes?.name}
                            </span>
                          </p>
                          <p>
                            Topping:{" "}
                            {item?.product_toppings &&
                            item.product_toppings.length > 0 ? (
                              item.product_toppings.map(
                                (topping: ProductTopping, index: number) => (
                                  <span
                                    key={topping?.topping_id?._id}
                                    className="font-medium"
                                  >
                                    {topping?.topping_id?.nameTopping}
                                    {topping?.priceTopping && (
                                      <span className="text-gray-500">{` (+${topping?.priceTopping} đ)`}</span>
                                    )}
                                    {index < item.product_toppings.length - 1 &&
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

                      <div className="mt-4 flex items-center justify-between gap-6 md:order-3 md:mt-0">
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
                            onClick={() => handleQuantityChange(item._id, true)}
                            className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors duration-200"
                          >
                            +
                          </button>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-900 dark:text-white">
                            {formatCurrency(
                              (() => {
                                const basePrice =
                                  item?.product?.sale_price ||
                                  item?.product?.price ||
                                  0;
                                const sizePrice =
                                  item?.product_sizes?.priceSize || 0;
                                const toppingsPrice = (
                                  item?.product_toppings || []
                                ).reduce(
                                  (sum, topping) =>
                                    sum +
                                    (topping?.topping_id?.priceTopping || 0),
                                  0
                                );
                                const totalPrice =
                                  (basePrice + sizePrice + toppingsPrice) *
                                  item.quantity;
                                return totalPrice;
                              })()
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <div className="text-center p-8 transition-all duration-300 dark:bg-gray-800 dark:text-white">
                <p className="text-3xl text-red-600 font-bold mb-6">
                  Giỏ hàng của bạn đang trống.
                </p>
                <div className="flex items-center justify-center gap-4 mb-6">
                  <ArrowLeftOutlined className="text-red-600 text-2xl" />
                  <Link
                    to="/"
                    className="inline-flex items-center gap-3 text-lg font-semibold text-red-600 hover:text-red-700 transition-colors duration-200 py-3 px-6 rounded-lg bg-red-100 hover:bg-red-200 dark:bg-blue-500 dark:hover:bg-blue-600"
                  >
                    Quay lại trang chủ
                  </Link>
                </div>
              </div>
            )}
          </div>

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
                  {/* <div className="flex items-center justify-between border-t border-gray-200 pt-4 dark:border-gray-700">
                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                      Tổng giá đã chọn
                    </span>
                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                      {formatCurrency(totalSelectedPrice || 0)}
                    </span>
                  </div> */}
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
                    className="group inline-flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-[#ea8025] hover:underline transition-colors duration-200"
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
    </section>
  );
};

export default CartPage;
