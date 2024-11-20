import { Link } from "react-router-dom";
import instance from "../../services/api";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { ProductSize, ProductTopping } from "../../types/product";

const CartPage: React.FC<{
  idcart: number;
}> = ({ idcart }) => {
  const user = JSON.parse(localStorage.getItem("user") || "");
  const [cart, setCart] = useState<any>([]);
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [selectedItems, setSelectedItems] = useState<string[]>([]); // Track selected item IDs

  // Fetch cart data and calculate total price
  const fetchCart = async () => {
    try {
      const { data } = await instance.get(`/cart/${user._id}`);
      setCart(data.cart);

      const total = data.cart.reduce((acc: number, item: any) => {
        const productPrice =
          item?.product?.sale_price || item?.product?.price || 0; // Sale price or original price

        // If product_sizes is an object, get its price directly
        const sizePrice = item?.product_sizes?.priceSize || 0; // No need for reduce, just access priceSize directly

        // Ensure product_toppings is an array and reduce to get total topping price
        const toppingPrice = Array.isArray(item?.product_toppings)
          ? item.product_toppings.reduce(
              (total: number, topping: any) =>
                total + (topping?.topping_id?.priceTopping || 0),
              0
            )
          : 0;

        // Total price for this item (including size, toppings, and quantity)
        const itemTotalPrice =
          (productPrice + sizePrice + toppingPrice) * item.quantity;

        return acc + itemTotalPrice;
      }, 0);

      setTotalPrice(total); // Update total price
      console.log("Total Price:", total); // This will log the total price to the console
    } catch (error) {
      console.error("Error fetching cart:", error);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  // Handle increasing or decreasing the product quantity
  const handleQuantityChange = async (productId: string, increase: boolean) => {
    console.log(
      `Handling quantity change for product: ${productId}, increase: ${increase}`
    );
    try {
      const response = await instance.patch(
        `/cart/${idcart}/product/${productId}/quantity/change`,
        {
          userId: user._id, // Đảm bảo rằng user._id đã được lấy đúng
          productId: productId, // Đảm bảo rằng productId là đúng
          increase: increase, // Đảm bảo increase là đúng
        }
      );

      if (response.status === 200) {
       
        fetchCart(); // Gọi lại hàm fetchCart() sau khi thay đổi số lượng
      } else {
        toast.error("Không thể cập nhật số lượng sản phẩm.");
      }
    } catch (error) {
console.error("Error updating quantity:", error);
      toast.error("Không thể cập nhật số lượng sản phẩm.");
    }
  };

  // Format currency for display
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const handleCheckboxChange = (productId: string) => {
    setSelectedItems((prevSelected) => {
      if (prevSelected.includes(productId)) {
        // Deselect if already selected
        return prevSelected.filter((id) => id !== productId);
      } else {
        // Select if not already selected
        return [...prevSelected, productId];
      }
    });
  };

const handleDeleteItem = async (productId: string) => {
  try {
    const response = await instance.patch(
      `/cart/${idcart}/product/${productId}/delete`
    );
    if (response.status === 200) {
      toast.success("Sản phẩm đã được xóa.");
      fetchCart(); // Refresh the cart to update the UI
    } else {
      toast.error("Không thể xóa sản phẩm.");
    }
  } catch (error) {
    console.error("Error deleting item:", error);
    toast.error("Có lỗi xảy ra khi xóa sản phẩm.");
  }
};

const handleDeleteSelected = async () => {
  if (selectedItems.length === 0) {
    toast.error("Bạn chưa chọn sản phẩm nào để xóa.");
    return;
  }

  try {
    const response = await instance.patch(`/cart/${idcart}/delete-selected`, {
      productIds: selectedItems,
    });

    if (response.status === 200) {
      toast.success("Các sản phẩm đã được xóa.");
      setSelectedItems([]); // Clear selection
      fetchCart(); // Refresh the cart after deletion
    } else {
      toast.error("Không thể xóa sản phẩm đã chọn.");
    }
  } catch (error) {
    console.error("Error deleting selected items:", error);
    toast.error("Có lỗi xảy ra khi xóa các sản phẩm đã chọn.");
  }
};

const handleDeleteAll = async () => {
  const confirmDelete = window.confirm(
    "Bạn có chắc chắn muốn xóa tất cả sản phẩm trong giỏ hàng?"
  );
  if (!confirmDelete) return; // Nếu người dùng không xác nhận, không làm gì cả

  try {
    const response = await instance.delete(`/cart/${idcart}/delete-all`);
    if (response.status === 200) {
      toast.success("Tất cả sản phẩm đã được xóa.");
      fetchCart(); // Refresh the cart after deletion
    } else {
      toast.error("Không thể xóa tất cả sản phẩm.");
    }
  } catch (error) {
    console.error("Error deleting all items:", error);
    toast.error("Có lỗi xảy ra khi xóa tất cả sản phẩm.");
  }
};

const handleMasterCheckboxChange = () => {
  if (selectedItems.length === cart.length) {
    setSelectedItems([]); // Deselect all if all are selected
  } else {
    setSelectedItems(cart.map((item: any) => item.product._id)); // Select all items
  }
};


  return (
    <section className="bg-white py-8 antialiased dark:bg-gray-900 md:py-16 my-4">
<div className="mx-auto max-w-screen-xl px-4 2xl:px-0">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white sm:text-2xl">
          Giỏ hàng
        </h2>
        <p className="border-b-orange-400 w-24 border-b-[4px] my-1"></p>
        <div className="mt-6 sm:mt-8 md:gap-8 lg:flex lg:items-start xl:gap-10">
          {/* Main Cart Content */}
          <div className="mx-auto w-full flex-none lg:max-w-3xl xl:max-w-4xl">
            {/* Select All Header */}
            <div className="mb-6 flex items-center justify-between bg-white p-5 rounded-xl border border-gray-200 shadow-md hover:shadow-lg transition-shadow duration-300">
              <div className="flex items-center space-x-4">
                <input
                  type="checkbox"
                  className="h-5 w-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500 transition duration-150 ease-in-out"
                  checked={selectedItems.length === cart.length}
                  onChange={handleMasterCheckboxChange}
                />
                <span className="text-gray-700 font-medium">Chọn tất cả</span>
              </div>
              <div className="flex gap-6">
                <button
                  onClick={handleDeleteSelected}
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
                  onClick={handleDeleteAll}
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
                className="mb-4 rounded-xl border border-gray-200 bg-white p-6 shadow-md hover:shadow-lg transition-all duration-300 dark:border-gray-700 dark:bg-gray-800"
              >
                <div className="flex flex-col md:flex-row md:items-center md:gap-8">
                  {/* Checkbox and Image */}
                  <div className="flex items-center md:order-1">
                    <input
                      type="checkbox"
                      className="mr-4 h-5 w-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <Link to="" className="flex-shrink-0">
                      <img
                        className="h-24 w-24 rounded-lg object-cover dark:hidden"
                        src={item.product.image}
alt="product image"
                      />
                    </Link>
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 space-y-4 md:order-2">
                    <Link
                      to="#"
                      className="text-lg font-semibold text-gray-900 hover:text-primary-600 transition-colors duration-200 dark:text-white"
                    >
                      {item.product.name}
                    </Link>
                    <div className="space-y-2 text-sm text-gray-600">
                      <p>Size: {item?.product_sizes?.name}</p>
                      <p>
                        Topping:{" "}
                        {item?.product_toppings &&
                        item?.product_toppings.length > 0 ? (
                          item?.product_toppings.map(
                            (topping: ProductTopping, index: number) => (
                              <span
                                key={topping?.topping_id?._id}
                                className="font-medium"
                              >
                                {topping?.topping_id?.nameTopping}
                                {topping?.priceTopping && (
                                  <span className="text-gray-500">
                                    {` (+${topping?.priceTopping} đ)`}
                                  </span>
                                )}
                                {index < item?.product_toppings.length - 1 &&
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
                      onClick={() => handleDeleteItem(item.product._id)}
                      className="mt-2 text-sm font-medium text-red-600 hover:text-red-700 transition-colors duration-200"
                    >
                      Xóa
                    </button>
                  </div>

                  {/* Quantity Controls and Price */}
                  <div className="mt-4 flex items-center justify-between gap-6 md:order-3 md:mt-0">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() =>
                          handleQuantityChange(item.product._id, false)
                        }
                        className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors duration-200"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        value={item.quantity}
readOnly
                        className="w-16 text-center bg-white border-2 border-gray-200 rounded-lg shadow-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500 transition-all duration-300"
                      />
                      <button
                        onClick={() =>
                          handleQuantityChange(item.product._id, true)
                        }
                        className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors duration-200"
                      >
                        +
                      </button>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {formatCurrency(
                          (item?.product?.sale_price || 0) * item.quantity
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
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
                    {formatCurrency(totalPrice)}
                  </span>
                </div>
              </div>
              <Link
                to="/checkout"
                className="mt-6 block w-full rounded-lg bg-[#ea8025] px-6 py-3 text-center text-sm font-semibold text-white hover:bg-[#ff8e37] transition-colors duration-200 transform hover:scale-[1.02]"
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
        </div>
      </div>
    </section>
  );
};

export default CartPage;