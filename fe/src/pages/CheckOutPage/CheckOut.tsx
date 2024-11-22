import { Drawer, Modal } from "flowbite-react";
import React, { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { useQuery, useMutation } from "@tanstack/react-query";
import instance from "../../services/api";
import axios from "axios";
import { ProductTopping } from "../../types/product";

const Checkout: React.FC = () => {
  const userId = JSON.parse(localStorage.getItem("user") || "{}")._id;
  console.log("User ID:", userId);

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

  const getTotalPrice = () => {
    return carts.reduce((total:any, item:any) => {
      const salePrice = item.product.sale_price || 0; // Giá sản phẩm
      const sizePrice = item.product_sizes?.priceSize || 0; // Giá của kích thước
      const toppingsPrice = item.product_toppings?.reduce((toppingTotal:any, topping:any) => {
        return toppingTotal + (topping.topping_id?.priceTopping || 0); // Cộng giá của mỗi topping
      }, 0) || 0; // Nếu không có topping thì là 0
  
      // Tính tổng giá cho sản phẩm này: Giá sản phẩm + Giá kích thước + Giá topping
      const itemTotalPrice = (salePrice + sizePrice + toppingsPrice) * item.quantity;
  
      // Cộng vào tổng giá của giỏ hàng
      return total + itemTotalPrice;
    }, 0);
  };

  interface Form {
    name: string;
    address: string;
    phone: string;
    email: string;
    note: string;
  }

  const { handleSubmit, register, formState: { errors } } = useForm<Form>({
    mode: "onBlur", // Trigger validation when input loses focus
  });

  const onSubmit = async (data: Form) => {
    const oderData = {
      userId,
      customerInfo: data,
      paymentMethod: paymentMethod,
      note: data.note,
    };
    console.log(oderData);

    try {
      // 1. Tạo đơn hàng đầu tiên
      const { data: orderResponse } = await instance.post("orders", oderData);
      console.log("Đơn hàng đã được tạo:", orderResponse);

      // 2. Kiểm tra nếu phương thức thanh toán là MoMo
      if (paymentMethod === "momo") {
        setLoading(true);

        try {
          const response = await axios.post(
            "http://localhost:8000/payments/momo/create-payment",
            {
              orderId: orderResponse._id,
            }
          );

          // 4. Kiểm tra URL thanh toán từ phản hồi
          if (response.data?.payUrl) {
            const { payUrl } = response.data;

            // 5. Chuyển hướng người dùng tới trang thanh toán MoMo
            window.location.href = payUrl;
          } else {
            throw new Error("Không nhận được URL thanh toán MoMo");
          }
        } catch (paymentError) {
          console.error(
            "Lỗi khi tạo thanh toán MoMo",
            paymentError.response?.data || paymentError.message
          );
          alert("Lỗi khi kết nối với MoMo, vui lòng thử lại sau.");
          setLoading(false);
        }
      }
    } catch (error) {
      console.error(
        "Lỗi khi tạo đơn hàng",
        error.response?.data || error.message
      );
      // Thông báo lỗi cho người dùng nếu không thể tạo đơn hàng
      alert("Có lỗi xảy ra khi tạo đơn hàng. Vui lòng thử lại sau.");
    }
  };

  // Hàm xử lý khi người dùng click vào biểu tượng MoMo
  const handleMomoClick = () => {
    setPaymentMethod("momo");
    setIsBankTransferSelected(false); // Ẩn phần lựa chọn khác khi chọn Momo
  };
  // const handleSubmit = (event: React.FormEvent) => {
  //   event.preventDefault(); // Ngăn chặn reload trang
  //   console.log("Form submitted");
  // };

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
              <label className="block text-sm font-medium text-gray-700">Họ và tên</label>
              <input
                type="text"
                {...register("name", { required: "Vui lòng nhập họ tên", maxLength: 100 })}
                placeholder="Nhập họ tên"
                className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Địa chỉ</label>
              <input
                type="text"
                {...register("address", { required: "Vui lòng nhập địa chỉ", maxLength: 255 })}
                placeholder="Nhập địa chỉ"
                className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              {errors.address && <p className="text-sm text-red-600">{errors.address.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Số điện thoại</label>
              <input
                type="text"
                {...register("phone", { 
                  required: "Vui lòng nhập số điện thoại", 
                  pattern: {
                    value: /^[0-9]{10}$/,
                    message: "Số điện thoại phải gồm 10 chữ số"
                  } 
                })}
                placeholder="Nhập số điện thoại"
                className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              {errors.phone && <p className="text-sm text-red-600">{errors.phone.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                {...register("email", { 
                  required: "Vui lòng nhập email", 
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Email không hợp lệ"
                  }
                })}
                placeholder="Nhập email"
                className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Ghi chú</label>
              <textarea
                {...register("note", { maxLength: { value: 500, message: "Ghi chú không được vượt quá 500 ký tự" } })}
                placeholder="Nhập ghi chú khi đặt hàng"
                className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              ></textarea>
              {errors.note && <p className="text-sm text-red-600">{errors.note.message}</p>}
            </div>

            {/* Payment Method */}
            <div className="space-y-2">
              <h6 className="font-semibold">Phương thức thanh toán</h6>
              {!paymentMethod && (
                <p className="flex items-center gap-x-4 text-red-600 bg-[#feffd2] py-1 font-semibold rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-4 mt-[3px]">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
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
                <label htmlFor="atm">Thẻ ATM nội địa / Internet Banking</label>
              </div>
            </div>
            {isBankTransferSelected && (
              <div className="bg-gray-50 border rounded-lg">
                <h3 className="text-lg font-medium m-2">Chọn phương thức thanh toán</h3>
                <div className="flex justify-center gap-4 my-2">
                  <button className="rounded-md" onClick={handleMomoClick}>
                    <img
                      src="src/pages/CheckOutPage/ImageBanking/Momo.png"
                      alt="Momo"
                      className="w-16 mx-auto border-2"
                    />
                    <div className="mt-2 text-center font-medium">Momo</div>
                  </button>
                  <button className="rounded-md">
                    <img
                      src="src/pages/CheckOutPage/ImageBanking/ZaloPay.png"
                      alt="ZaloPay"
                      className="w-16 mx-auto border-2"
                    />
                    <div className="mt-2 text-center font-medium">ZaloPay</div>
                  </button>
                  <button className="rounded-md">
                    <img
                      src="src/pages/CheckOutPage/ImageBanking/PhoneBanking.png"
                      alt="Phone Banking"
                      className="w-16 mx-auto border-2"
                    />
                    <div className="mt-2 text-center font-medium">Phone Banking</div>
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
  <div key={item.product._id} className="flex flex-col md:flex-row p-4 bg-white rounded-lg shadow-sm">
    {item.product && (
      <>
        <img
          src={item.product.image}
          alt={item.product.name}
          className="h-[70px] w-[70px] rounded-sm"
        />
        <div className="w-full md:w-2/3 pl-0 md:pl-4">
          <div className="font-semibold text-lg">{item.product.name}</div>

          {/* Hiển thị Size */}
          {item.product_sizes && (
            <div className="flex items-center justify-between space-x-2 text-sm p-1">
              <label>Size:</label>
              <div className="text-gray-500 font-semibold">
                {item.product_sizes?.name || "Không có kích thước"}
              </div>
            </div>
          )}

          {/* Hiển thị Topping mà không có giá */}
          {item.product_toppings && item.product_toppings.length > 0 ? (
            <div className="flex items-center justify-between space-x-2 text-sm p-1">
              <label>Topping:</label>
              <div className="font-semibold text-gray-500">
                {item.product_toppings.map((topping: any, index: number) => (
                  <span key={topping._id}>
                    {topping.topping_id?.nameTopping || "Không có topping"}
                    {index < item.product_toppings.length - 1 && ", "}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between space-x-2 text-sm p-1">
              <label>Topping:</label>
              <div className="font-semibold text-gray-500">Không có topping</div>
            </div>
          )}

          {/* Hiển thị Giá */}
          <div className="flex justify-between text-sm p-1">
            <div>Giá:</div>
            <div className="text-gray-500 font-semibold">
              {item.product.sale_price
                ? (item.product.sale_price * item.quantity).toLocaleString("vi-VN")
                : ""}
            </div>
          </div>

          {/* Hiển thị Số lượng */}
          <div className="shadow-sm flex items-center justify-between text-sm p-1">
            <span>Số lượng:</span>
            <span className="font-semibold text-gray-500">{item.quantity}</span>
          </div>
        </div>
      </>
    )}
  </div>
))}


            </div>

            <div className="border-t-2 border-gray-300 py-4">
              <div className="flex justify-between">
                <span className="text-lg font-semibold">Tổng thanh toán:</span>
                <span className="text-xl font-bold text-[#ea8025]">
                {getTotalPrice() && getTotalPrice() > 0
  ? `${getTotalPrice().toLocaleString("vi-VN")} VNĐ`
  : ""}
                </span>
              </div>
            </div>
          </section>
        </main>
      </div>
    </>
  );
};

export default Checkout;
