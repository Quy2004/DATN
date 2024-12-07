import React, { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { useQuery, useMutation } from "@tanstack/react-query";
import instance from "../../services/api";
import Swal from "sweetalert2";
import toast from "react-hot-toast";
import { useLocation, useNavigate } from "react-router-dom";

const Checkout: React.FC = () => {
  const userId = JSON.parse(localStorage.getItem("user") || "{}")._id;
  const navigate = useNavigate();
  const {
    data: carts,
    isLoading: isCartsLoading,
    isError,
  } = useQuery({
    queryKey: ["cart"],
    queryFn: async () => {
      const response = await instance.get(`/cart/${userId}`);
      console.log("Response from API:", response.data);
      return response.data.cart;
    },
  });

  const [paymentMethod, setPaymentMethod] = useState("");
  const [isBankTransferSelected, setIsBankTransferSelected] = useState(false);
  // Thêm state để quản lý voucher

  const [discountAmount, setDiscountAmount] = useState<number>(0); // Số tiền giảm giá
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false); // Trạng thái popup
  const [voucherList, setVoucherList] = useState<any[]>([]); // Danh sách voucher
  const [selectedVoucher, setSelectedVoucher] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const handlePaymentMethodChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const selectedMethod = event.target.value;
    setPaymentMethod(selectedMethod);

    // Kiểm tra nếu chọn "Thẻ ATM nội địa / Internet Banking"
    if (selectedMethod === "bank transfer") {
      setIsBankTransferSelected(true);
    } else {
      setIsBankTransferSelected(false);
    }
  };

  // Hàm tính tổng giá
  const getTotalPrice = () => {
    const originalTotal = carts.reduce((total: number, item: any) => {
      const salePrice = item.product?.sale_price || 0;
      const sizePrice = item.product_sizes?.priceSize || 0;
      const toppingsPrice =
        item.product_toppings?.reduce(
          (toppingTotal: number, topping: any) =>
            toppingTotal + (topping.topping_id?.priceTopping || 0),
          0
        ) || 0;
  
      const itemTotalPrice =
        (salePrice + sizePrice + toppingsPrice) * (item.quantity || 0);
  
      return total + itemTotalPrice;
    }, 0);
  
    // Đảm bảo discountAmount có giá trị hợp lệ
    const discountToApply = discountAmount || 0;
  
    // Làm tròn giá trị giảm giá từ voucher
    const roundedDiscount = Math.round(discountToApply);
  
    // Tính tổng giá sau khi đã áp dụng voucher và làm tròn
    const finalTotal = originalTotal - roundedDiscount;
  
    // Trả về đối tượng bao gồm tổng giá và giá trị giảm giá
    return {
      finalTotal: Math.max(0, Math.round(finalTotal)), // Làm tròn tổng giá cuối cùng
      roundedDiscount, // Trả về giá trị giảm giá đã tròn
    };
  };
  
  

  interface Form {
    name: string;
    address: string;
    phone: string;
    email: string;
    note: string;
  }

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<Form>({
    mode: "onBlur", // Trigger validation when input loses focus
  });

  const handleMomoPayment = async (orderData: any) => {
    try {
      // Tạo đơn hàng trước
      const orderResponse = await instance.post("orders", {
        ...orderData,
      });
      console.log("Order API Response:", orderResponse.data);

      // Lấy payUrl từ phản hồi backend
      const { payUrl } = orderResponse.data;

      // Kiểm tra URL thanh toán từ MoMo
      if (!payUrl) {
        Swal.fire({
          icon: "warning",
          title: "Lỗi",
          text: "Không nhận được URL thanh toán từ MoMo. Vui lòng thử lại sau.",
        });
        return;
      }

      // Chuyển hướng người dùng tới trang thanh toán MoMo
      window.location.href = payUrl;
    } catch (error: any) {
      console.error("Lỗi thanh toán:", error);

      Swal.fire({
        icon: "error",
        title: "Thanh toán thất bại",
        text:
          error.response?.data?.message ||
          "Đã xảy ra lỗi khi thanh toán. Vui lòng thử lại.",
      });
      // Chuyển hướng người dùng đến trang hủy đơn nếu thanh toán thất bại
      if (error.response?.data?.cancelUrl) {
        window.location.href = error.response.data.cancelUrl; // Dùng URL từ backend
      }
    }
  };
  const handleZaloPayPayment = async (orderData: any) => {
    try {
      // Tạo đơn hàng trước
      const orderResponse = await instance.post("orders", {
        ...orderData,
      });
      console.log("Order API Response:", orderResponse.data); // Kiểm tra toàn bộ data trong response

      // Lấy payUrl từ phản hồi backend
      const { payUrl } = orderResponse.data;

      // Kiểm tra URL thanh toán từ ZaloPay
      if (!payUrl) {
        Swal.fire({
          icon: "warning",
          title: "Lỗi",
          text: "Không nhận được URL thanh toán từ ZaloPay. Vui lòng thử lại sau.",
        });
        return;
      }

      // Chuyển hướng người dùng tới trang thanh toán ZaloPay
      window.location.href = payUrl;
    } catch (error: any) {
      console.error("Lỗi thanh toán:", error);

      Swal.fire({
        icon: "error",
        title: "Thanh toán thất bại",
        text:
          error.response?.data?.message ||
          "Đã xảy ra lỗi khi thanh toán. Vui lòng thử lại.",
      });

      throw error;
    }
  };
  // Hàm mở modal và lấy danh sách voucher
  const openVoucherModal = async () => {
    try {
      const response = await instance.get("/vouchers");

      if (response.data && response.data.data) {
        // Lọc voucher phù hợp
        const applicableVouchers = filterApplicableVouchers(response.data.data);

        setVoucherList(applicableVouchers);
        setIsModalOpen(true);
      } else {
        console.error("Không có dữ liệu voucher trong response");
      }
    } catch (error) {
      console.error("Lỗi khi tải voucher:", error);
      Swal.fire({
        icon: "error",
        title: "Lỗi",
        text: "Không thể tải danh sách voucher. Vui lòng thử lại.",
      });
    }
  };

  const filterApplicableVouchers = (vouchers: any[]) => {
    return vouchers.filter((voucher) => {
      // Loại bỏ voucher không hoạt động hoặc đã bị xóa
      if (voucher.status !== "active" || voucher.isDeleted) {
        return false;
      }

      // Kiểm tra số lượng voucher
      if (voucher.quantity <= 0) {
        return false;
      }

      // Kiểm tra ngày hiệu lực của voucher
      const currentDate = new Date();
      const minOrderDate = new Date(voucher.minOrderDate);
      const maxOrderDate = new Date(voucher.maxOrderDate);

      if (currentDate < minOrderDate || currentDate > maxOrderDate) {
        return false;
      }

      // Nếu không có điều kiện sản phẩm và danh mục cụ thể, áp dụng cho tất cả
      if (
        (!voucher.applicableProducts ||
          voucher.applicableProducts.length === 0) &&
        (!voucher.applicableCategories ||
          voucher.applicableCategories.length === 0)
      ) {
        return true;
      }

      // Kiểm tra sản phẩm trong giỏ hàng
      const isValidForProducts =
        voucher.applicableProducts && voucher.applicableProducts.length > 0
          ? carts.some((cartItem: any) =>
              voucher.applicableProducts.includes(cartItem.product?._id)
            )
          : false;

      // Kiểm tra danh mục sản phẩm trong giỏ hàng
      const isValidForCategories =
        voucher.applicableCategories && voucher.applicableCategories.length > 0
          ? carts.some((cartItem: any) =>
              voucher.applicableCategories.includes(
                cartItem.product?.category?._id
              )
            )
          : false;

      // Nếu có điều kiện sản phẩm, kiểm tra điều kiện sản phẩm
      if (voucher.applicableProducts && voucher.applicableProducts.length > 0) {
        return isValidForProducts;
      }

      // Nếu có điều kiện danh mục, kiểm tra điều kiện danh mục
      if (
        voucher.applicableCategories &&
        voucher.applicableCategories.length > 0
      ) {
        return isValidForCategories;
      }

      // Trường hợp không khớp
      return false;
    });
  };

  const handleSelectVoucher = async (voucher: any) => {
    console.log("Voucher:", voucher);

    // Kiểm tra ID voucher hợp lệ
    if (!voucher || !voucher._id) {
      toast.error("ID voucher không hợp lệ."); // Hiển thị thông báo lỗi
      return;
    }

    // Kiểm tra trạng thái voucher
    if (voucher.status !== "active" || voucher.isDeleted) {
      toast.error("Voucher hiện không khả dụng."); // Hiển thị thông báo lỗi
      return;
    }

    // Kiểm tra số lượng voucher
    if (voucher.quantity <= 0) {
      toast.error("Voucher đã hết số lượng sử dụng."); // Hiển thị thông báo lỗi
      return;
    }

    // Kiểm tra ngày hiệu lực của voucher
    const currentDate = new Date();
    const minOrderDate = new Date(voucher.minOrderDate);
    const maxOrderDate = new Date(voucher.maxOrderDate);

    if (currentDate < minOrderDate || currentDate > maxOrderDate) {
      toast.error("Voucher chưa đến hoặc đã hết hạn sử dụng."); // Hiển thị thông báo lỗi thay vì info
      return;
    }

    // Kiểm tra điều kiện sản phẩm và danh mục
    const isValidForProducts =
      !voucher.applicableProducts || voucher.applicableProducts.length === 0
        ? true
        : carts.some((cartItem: any) =>
            voucher.applicableProducts.includes(cartItem.product?._id)
          );

    const isValidForCategories =
      !voucher.applicableCategories || voucher.applicableCategories.length === 0
        ? true
        : carts.some((cartItem: any) =>
            voucher.applicableCategories.includes(
              cartItem.product?.category?._id
            )
          );

    // Nếu có điều kiện sản phẩm hoặc danh mục, phải thỏa mãn
    if (
      (voucher.applicableProducts &&
        voucher.applicableProducts.length > 0 &&
        !isValidForProducts) ||
      (voucher.applicableCategories &&
        voucher.applicableCategories.length > 0 &&
        !isValidForCategories)
    ) {
      toast.error(
        "Voucher không áp dụng cho sản phẩm hoặc danh mục trong giỏ hàng."
      ); // Thông báo lỗi
      return;
    }

    // Tính toán giảm giá
const { finalTotal } = getTotalPrice(); // Lấy finalTotal từ kết quả trả về của getTotalPrice()
const discount = (finalTotal * voucher.discountPercentage) / 100; // Sử dụng finalTotal ở đây
const maxDiscount = voucher.maxDiscount || 0;
const finalDiscountAmount = Math.min(discount, maxDiscount); // Tính giảm giá cuối cùng

    // Xử lý chọn/hủy voucher
    if (voucher.code === selectedVoucher) {
      setSelectedVoucher("");
      setDiscountAmount(0);
      toast.success("Voucher đã được hủy."); // Hiển thị thông báo thành công khi hủy
    } else {
      setSelectedVoucher(voucher.code);
      setDiscountAmount(finalDiscountAmount);
      toast.success("Voucher đã được áp dụng thành công!"); // Thông báo thành công khi áp dụng
    }

    setIsModalOpen(false);
  };

  // Thêm hàm lọc voucher phù hợp

  const onSubmit = async (data: Form) => {
    // Kiểm tra phương thức thanh toán
    if (!paymentMethod) {
      Swal.fire({
        icon: "warning",
        title: "Thông báo",
        text: "Vui lòng chọn phương thức thanh toán",
      });
      return;
    }

    // Kiểm tra giỏ hàng có sản phẩm không
    if (!carts || carts.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "Giỏ hàng trống",
        text: "Vui lòng thêm sản phẩm vào giỏ hàng",
      });
      return;
    }
    const { finalTotal, roundedDiscount } = getTotalPrice();
  console.log("Tổng giá trị đơn hàng:", finalTotal);
  console.log("Giảm giá từ voucher:", roundedDiscount);
    const orderData = {
      userId,
      customerInfo: data,
      paymentMethod: paymentMethod,
      note: data.note,
      totalPrice: finalTotal,
      discountAmount: roundedDiscount, // Thêm giảm giá vào orderData
      paymentStatus:
        paymentMethod === "cash on delivery" ? "pending" : "unpaid",
    };

    try {
      setLoading(true);

      switch (paymentMethod) {
        case "momo":
          await handleMomoPayment(orderData);
          break;
        case "zalopay":
          await handleZaloPayPayment(orderData);
          break;
        case "cash on delivery":
          try {
            // Gửi yêu cầu lưu đơn hàng vào cơ sở dữ liệu
            const response = await instance.post("/orders", orderData);

            if (response.status === 201) {
              // Chuyển hướng đến trang thành công sau khi thêm đơn hàng thành công
              navigate("/oder-success");
            } else {
              throw new Error("Không thể tạo đơn hàng");
            }
          } catch (error) {
            console.error("Lỗi khi tạo đơn hàng:", error);
            // Thêm xử lý thông báo lỗi cho người dùng (nếu cần)
          }
          break;
        case "bank transfer":
          break;
        default:
          throw new Error("Phương thức thanh toán không hợp lệ");
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  // Handler chọn MoMo
  const handleMomoClick = () => {
    setPaymentMethod("momo");
    setIsBankTransferSelected(false);
  };
  // Handler chọn ZaloPay
  const handleZaloPayClick = () => {
    setPaymentMethod("zalopay");
    setIsBankTransferSelected(false);
  };
  if (isCartsLoading) {
    return <p>Đang tải dữ liệu giỏ hàng...</p>;
  }

  if (isError) {
    return <p>Đã xảy ra lỗi khi tải giỏ hàng. Vui lòng thử lại sau.</p>;
  }

  return (
    <>
      <div className="flex flex-col items-center w-full min-h-screen p-8 bg-gray-100 md:p-12 mt-10">
        <main className="flex flex-col md:flex-row gap-8 w-full max-w-5xl">
          {/* Checkout Form */}
          <section className="w-full md:w-1/2 bg-white rounded-lg shadow-md p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <h6 className="text-xl font-semibold mb-4">Thông tin liên hệ</h6>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Họ và tên
                </label>
                <input
                  type="text"
                  {...register("name", {
                    required: "Vui lòng nhập họ tên",
                    maxLength: 100,
                  })}
                  placeholder="Nhập họ tên"
                  className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                {errors.name && (
                  <p className="text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Địa chỉ
                </label>
                <input
                  type="text"
                  {...register("address", {
                    required: "Vui lòng nhập địa chỉ",
                    maxLength: 255,
                  })}
                  placeholder="Nhập địa chỉ"
                  className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                {errors.address && (
                  <p className="text-sm text-red-600">
                    {errors.address.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Số điện thoại
                </label>
                <input
                  type="text"
                  {...register("phone", {
                    required: "Vui lòng nhập số điện thoại",
                    pattern: {
                      value: /^[0-9]{10}$/,
                      message: "Số điện thoại phải gồm 10 chữ số",
                    },
                  })}
                  placeholder="Nhập số điện thoại"
                  className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                {errors.phone && (
                  <p className="text-sm text-red-600">{errors.phone.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  {...register("email", {
                    required: "Vui lòng nhập email",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Email không hợp lệ",
                    },
                  })}
                  placeholder="Nhập email"
                  className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                {errors.email && (
                  <p className="text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Ghi chú
                </label>
                <textarea
                  {...register("note", {
                    maxLength: {
                      value: 100,
                      message: "Ghi chú không được vượt quá 100 ký tự",
                    },
                  })}
                  placeholder="Nhập ghi chú khi đặt hàng"
                  className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                ></textarea>
                {errors.note && (
                  <p className="text-sm text-red-600">{errors.note.message}</p>
                )}
              </div>

              {/* Payment Method */}
              <div className="space-y-2">
                <h6 className="font-semibold">Phương thức thanh toán</h6>
                {!paymentMethod && (
                  <p className="flex items-center gap-x-4 text-red-600 bg-[#feffd2] py-1 font-semibold rounded-lg">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      className="size-4 mt-[3px]"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
                      />
                    </svg>
                    Vui lòng chọn phương thức thanh toán.
                  </p>
                )}
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="cod"
                    name="paymentMethod"
                    value="cash on delivery"
                    onChange={handlePaymentMethodChange}
                    className="mr-2"
                  />
                  <label htmlFor="cod">Thanh toán khi nhận hàng (COD)</label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="atm"
                    name="paymentMethod"
                    value="bank transfer"
                    onChange={handlePaymentMethodChange}
                    className="mr-2"
                  />
                  <label htmlFor="atm">
                    Thẻ ATM nội địa / Internet Banking
                  </label>
                </div>
              </div>
              {isBankTransferSelected && (
                <div className="bg-gray-50 border rounded-lg">
                  <h3 className="text-lg font-medium m-2">
                    Chọn phương thức thanh toán
                  </h3>
                  <div className="flex justify-center gap-4 my-2">
                    <button className="rounded-md" onClick={handleMomoClick}>
                      <img
                        src="src/pages/CheckOutPage/ImageBanking/Momo.png"
                        alt="Momo"
                        className="w-16 mx-auto border-2"
                      />
                      <div className="mt-2 text-center font-medium">Momo</div>
                    </button>
                    <button className="rounded-md" onClick={handleZaloPayClick}>
                      <img
                        src="src/pages/CheckOutPage/ImageBanking/ZaloPay.png"
                        alt="ZaloPay"
                        className="w-16 mx-auto border-2"
                      />
                      <div className="mt-2 text-center font-medium">
                        ZaloPay
                      </div>
                    </button>
                    <button className="rounded-md">
                      <img
                        src="src/pages/CheckOutPage/ImageBanking/PhoneBanking.png"
                        alt="Phone Banking"
                        className="w-16 mx-auto border-2"
                      />
                      <div className="mt-2 text-center font-medium">
                        Phone Banking
                      </div>
                    </button>
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="w-full p-3 text-white bg-[#ea8025] rounded-md hover:opacity-80"
              >
                Thanh toán
              </button>
            </form>
          </section>

          {/* Checkout Details */}
          <section className="w-full md:w-1/2 bg-gray-50 rounded-lg shadow-md p-6">
            <h6 className="text-lg font-semibold mb-4">Sản phẩm</h6>
            <div className="flex flex-col space-y-4 mb-6">
              {carts.map((item: any) => (
                <div
                  key={item.product._id}
                  className="flex flex-col md:flex-row p-4 bg-white rounded-lg shadow-sm"
                >
                  {item.product && (
                    <>
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="h-[70px] w-[70px] rounded-sm"
                      />
                      <div className="w-full md:w-2/3 pl-0 md:pl-4">
                        <div className="font-semibold text-lg">
                          {item.product.name}
                        </div>

                        {/* Hiển thị Size */}
                        {item.product_sizes && (
                          <div className="flex items-center justify-between space-x-2 text-sm p-1">
                            <label>Size:</label>
                            <div className="text-gray-500 font-semibold">
                              {item.product_sizes?.name ||
                                "Không có kích thước"}
                            </div>
                          </div>
                        )}

                        {/* Hiển thị Topping mà không có giá */}
                        {item.product_toppings &&
                        item.product_toppings.length > 0 ? (
                          <div className="flex items-center justify-between space-x-2 text-sm p-1">
                            <label>Topping:</label>
                            <div className="font-semibold text-gray-500">
                              {item.product_toppings.map(
                                (topping: any, index: number) => (
                                  <span key={topping._id}>
                                    {topping.topping_id?.nameTopping ||
                                      "Không có topping"}
                                    {index < item.product_toppings.length - 1 &&
                                      ", "}
                                  </span>
                                )
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between space-x-2 text-sm p-1">
                            <label>Topping:</label>
                            <div className="font-semibold text-gray-500">
                              Không có topping
                            </div>
                          </div>
                        )}

                        {/* Hiển thị Giá */}
                        <div className="flex justify-between text-sm p-1">
                          <div>Giá:</div>
                          <div className="text-gray-500 font-semibold">
                            {item?.product && item?.product?.sale_price
                              ? // Tính giá thủ công
                                (
                                  (item?.product?.sale_price +
                                    (item?.product_sizes?.priceSize || 0) +
                                    (item?.product_toppings || []).reduce(
                                      (total: any, topping: any) =>
                                        total +
                                        (topping?.topping_id?.priceTopping ||
                                          0),
                                      0
                                    )) *
                                  item?.quantity
                                ).toLocaleString("vi-VN")
                              : "Chưa có giá"}
                          </div>
                        </div>
                        {/* Hiển thị Số lượng */}
                        <div className="shadow-sm flex items-center justify-between text-sm p-1">
                          <span>Số lượng:</span>
                          <span className="font-semibold text-gray-500">
                            {item.quantity}
                          </span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
            <div className="my-4">
              {/* Input và nút thêm voucher */}
              <div className="flex items-center  justify-between bg-[#fff]">
                <div className="flex items-center text-sm">
                  <svg
                    className="w-14"
                    fill="#ea8025"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="-512 -512 1536.00 1536.00"
                    stroke="#000000"
                    stroke-width="0.00512"
                  >
                    <path d="M480.983,88.645h-0.933c-11.6,0-431.329,0-448.1,0C14.333,88.645,0,102.978,0,120.595v270.809 c0,17.617,14.333,31.95,31.95,31.95c17.185,0,436.934,0,448.1,0h0.933c17.103,0,31.017-13.915,31.017-31.017v-0.933V120.595 v-0.933C512,102.56,498.085,88.645,480.983,88.645z M304.09,184.698l11.544,11.544l-11.544,11.545c-10.228,10.228-10.229,26.871,0,37.102l11.544,11.544l-11.544,11.544c-10.228,10.228-10.229,26.871,0,37.102l11.544,11.544L304.09,328.17c-10.228,10.228-10.229,26.871,0,37.102l11.544,11.544c-12.642,12.64-12.025,11.968-13.132,13.292H33.247V121.892h268.565c1.46,1.908,1.215,1.552,13.823,14.16l-11.545,11.545C293.861,157.826,293.861,174.471,304.09,184.698z M478.753,390.109H348.172c5.904-10.052,4.547-23.224-4.07-31.844l-11.544-11.544l11.544-11.544c10.228-10.228,10.229-26.872,0-37.102l-11.544-11.544l11.544-11.544c10.228-10.228,10.229-26.872,0-37.102l-11.544-11.544l11.544-11.544c4.955-4.955,7.684-11.543,7.684-18.552c0-7.007-2.728-13.596-7.684-18.551l-11.544-11.544l11.545-11.545c8.867-8.869,10.046-22.559,3.537-32.71h131.113V390.109z"></path>
                    <path d="M205.034,244.048c-18.932,0-33.409,8.018-33.409,30.067v31.628c0,22.049,14.477,30.067,33.409,30.067 c18.709,0,33.409-8.018,33.409-30.067v-31.628C238.442,252.066,223.743,244.048,205.034,244.048z M205.034,316.433 c-6.904,0-10.914-3.341-10.914-10.69v-31.628c0-7.35,4.008-10.69,10.914-10.69c6.904,0,11.137,3.341,11.137,10.69v31.628h0 C216.17,313.093,211.938,316.433,205.034,316.433z"></path>
                    <path d="M192.115,163.2c-4.008,0-7.573,1.781-9.354,5.568l-78.175,160.584c-0.668,1.336-1.114,2.895-1.114,4.231c0,5.568,4.899,11.804,12.472,11.804c4.232,0,8.464-2.228,10.023-5.568l78.399-160.584c0.668-1.335,0.89-2.895,0.89-4.231C205.255,167.877,198.351,163.2,192.115,163.2z"></path>
                    <path d="M102.803,172.332c-18.932,0-33.409,8.018-33.409,30.067v31.627c0,22.049,14.477,30.068,33.409,30.068 c18.709,0,33.409-8.019,33.409-30.068v-31.627C136.212,180.35,121.512,172.332,102.803,172.332z M113.94,234.026 c0,7.35-4.231,10.691-11.137,10.691c-6.904,0-10.914-3.341-10.914-10.691v-31.627c0-7.35,4.01-10.69,10.914-10.69 s11.137,3.341,11.137,10.69V234.026z"></path>
                  </svg>
                  Cozy Voucher
                </div>

                <input
                  type="text"
                  placeholder="Chọn mã "
                  value={selectedVoucher}
                  readOnly
                  className="flex w-1/3 p-2 text-right  border-none rounded-md text-sky-500 cursor-pointer"
                  onClick={openVoucherModal}
                />
              </div>

              {/* Tổng thanh toán */}
              <div className="border-t-2 border-gray-300 py-4">
                {discountAmount > 0 && (
                  <div className="flex justify-between mb-2">
                    <span>Giảm giá voucher:</span>
                    <span className="text-green-600">
                      -{Math.round(discountAmount).toLocaleString("vi-VN")} VNĐ
                    </span>
                  </div>
                )}
              <div className="flex justify-between">
  <span className="text-lg font-semibold">
    Tổng thanh toán:
  </span>
  <span className="text-xl font-bold text-[#ea8025]">
    {getTotalPrice().finalTotal.toLocaleString("vi-VN")} VNĐ
  </span>
</div>

              </div>

              {/* Modal chọn voucher */}
              {isModalOpen && voucherList && voucherList.length > 0 && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-2xl shadow-xl p-6 w-[90%] sm:w-[480px] max-h-[80vh] overflow-auto">
                    {/* Tiêu đề Modal */}
                    <h2 className="text-2xl font-semibold mb-6 text-gray-800 text-center">
                      Chọn Voucher
                    </h2>

                    {/* Danh sách Voucher */}
                    <ul className="space-y-4">
                      {filterApplicableVouchers(voucherList).map((v) => (
                        <li
                          key={v.code}
                          className={`flex items-center justify-between bg-white rounded-xl border p-4 cursor-pointer 
            ${
              v.code === selectedVoucher
                ? "bg-green-100 border-green-400"
                : "hover:shadow-lg hover:border-gray-300"
            } 
            transition duration-300 ease-in-out`}
                          onClick={() => handleSelectVoucher(v)}
                        >
                          {/* Thông tin Voucher */}
                          <div className="flex flex-col space-y-1">
                            <span className="text-xl font-medium text-sky-500">
                              {v.code}
                            </span>
                            <span className="text-sm text-gray-600">
                              Giảm {v.discountPercentage}% - Tối đa{" "}
                              {v.maxDiscount.toLocaleString("vi-VN")} VNĐ
                            </span>
                            <span className="text-xs text-gray-500">
                              Hết hạn:{" "}
                              {new Date(v.maxOrderDate).toLocaleDateString()}
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>

                    {/* Nút Đóng */}
                    <div className="flex justify-center mt-6">
                      <button
                        onClick={() => setIsModalOpen(false)}
                        className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg text-sm hover:bg-gray-300 transition duration-200"
                      >
                        Đóng
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>
        </main>
      </div>
    </>
  );
};

export default Checkout;
