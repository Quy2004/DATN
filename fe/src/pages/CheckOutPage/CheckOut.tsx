import { Drawer, Modal } from "flowbite-react";
import React, { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { useQuery, useMutation } from "@tanstack/react-query";
import instance from "../../services/api";
import { toast } from "react-hot-toast";

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

  const [paymentMethod, setPaymentMethod] = useState<string>("");
  console.log(paymentMethod); // Trạng thái để theo dõi phương thức thanh toán
  const [isOpen, setIsOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getTotalPrice = () => {
    return carts.reduce((total: number, item: any) => {
      // Kiểm tra nếu sản phẩm và giá trị quantity hợp lệ
      if (item.product && item.quantity) {
        return total + item.product.price * item.quantity;
      }
      return total;
    }, 0);
  };
  const handleClose = () => setIsOpen(false);
  const toggleModal = () => setIsModalOpen((prev) => !prev);

  const handlePaymentMethodChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setPaymentMethod(event.target.value);
  };
  interface Form {
<<<<<<< HEAD
    name: string;
    address: string;
    phone: string;
    email: string;
    note: string;
  }

  const { handleSubmit, register } = useForm<Form>();
  console.log(typeof paymentMethod);

  const onSubmit = async (data: Form) => {
    if (!paymentMethod) {
      toast.error("Vui lòng chọn phương thức thanh toán!");
      return;
    }

    const orderData = {
      userId,
      customerInfo: data,
      paymentMethod,
      note: data.note,
    };

    try {
      const response = await instance.post("orders", orderData);
      toast.success(
        "Bạn đã đặt hàng thành công",
        
      );
    } catch (error) {
      toast.error("Đặt hàng thất bại, vui lòng thử lại!", {});
    }
  };

  
  
=======
    name: string,
    address: string,
    phone: string,
    email: string
    note: string
  }

  const { handleSubmit, register } = useForm<Form>(

  )
  console.log(typeof paymentMethod)
  const onSubmit = async (data: Form) => {
    const oderData = {
      userId,
      customerInfo: data,
      paymentMethod: paymentMethod,
      note: data.note,

    }
    console.log(oderData);
    const dataOder = await instance.post("orders", oderData);
    console.log(dataOder)
  }
>>>>>>> 8d5b02f92ec6bd487efc179bc84927ecc808bc1f

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
<<<<<<< HEAD
                <label className="block text-sm font-medium text-gray-700">
                  Họ và tên
                </label>
                <input
                  type="text"
                  {...register("name")}
                  placeholder="Nhập họ tên"
                  className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Địa chỉ
                </label>
                <input
                  type="text"
                  {...register("address")}
                  placeholder="Nhập địa chỉ"
                  className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Số điện thoại
                </label>
                <input
                  type="text"
                  {...register("phone")}
                  placeholder="Nhập số điện thoại"
                  className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="text"
                  {...register("email")}
                  placeholder="Nhập email"
                  className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Ghi chú
                </label>
                <textarea
                  {...register("note")}
                  placeholder="Nhập ghi chú khi đặt hàng"
                  className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                ></textarea>
=======
                <label className="block text-sm font-medium text-gray-700">Họ và tên</label>
                <input type="text" {...register("name")} placeholder="Nhập họ tên" className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400" />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Địa chỉ</label>
                <input type="text" {...register("address")} placeholder="Nhập địa chỉ" className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400" />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Số điện thoại</label>
                <input type="text" {...register("phone")} placeholder="Nhập số điện thoại" className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400" />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input type="text" {...register("email")} placeholder="Nhập email" className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400" />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Ghi chú</label>
                <textarea {...register("note")} placeholder="Nhập ghi chú khi đặt hàng" className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"></textarea>
>>>>>>> 8d5b02f92ec6bd487efc179bc84927ecc808bc1f
              </div>

              {/* Payment Method */}
              <div className="space-y-2">
                <h6 className="font-semibold">Phương thức thanh toán</h6>
                <div className="flex items-center space-x-2">
<<<<<<< HEAD
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
                {!paymentMethod && (
                  <p className="text-yellow-600">
                    Vui lòng chọn phương thức thanh toán.
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="w-full p-3 text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
=======
                  <input type="radio" id="atm" name="paymentMethod" value="bank transfer" onChange={handlePaymentMethodChange} className="mr-2" />
                  <label htmlFor="atm">Thẻ ATM nội địa / Internet Banking</label>
                </div>
                <div className="flex items-center space-x-2">
                  <input type="radio" id="cod" name="paymentMethod" value="cash on delivery" onChange={handlePaymentMethodChange} className="mr-2" />
                  <label htmlFor="cod">Thanh toán khi nhận hàng (COD)</label>
                </div>
                {!paymentMethod && (
                  <p className="text-yellow-600">Vui lòng chọn phương thức thanh toán.</p>
                )}
              </div>

              <button type="submit" className="w-full p-3 text-white bg-blue-600 rounded-md hover:bg-blue-700">
>>>>>>> 8d5b02f92ec6bd487efc179bc84927ecc808bc1f
                Thanh toán
              </button>
            </form>
          </section>

          {/* Checkout Details */}
          <section className="w-full md:w-1/2 bg-gray-50 rounded-lg shadow-md p-6">
            <h6 className="text-lg font-semibold mb-4">Sản phẩm của bạn</h6>
            <div className="flex flex-col space-y-4 mb-6">
              {carts.map((item) => (
                <div
                  key={item._id}
                  className="flex flex-col md:flex-row items-center p-4 bg-white rounded-lg shadow-sm"
                >
                  {item.product && (
                    <>
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-full md:w-1/3 rounded-lg"
                      />
                      <div className="w-full md:w-2/3 pl-0 md:pl-4">
                        <div className="font-semibold">{item.product.name}</div>
                        <div className="text-gray-500">
<<<<<<< HEAD
                          {item.product.price && item.quantity
                            ? (item.product.price * item.quantity).toFixed(2)
                            : "0.00"}{" "}
                          <span className="line-through text-red-500">
                            {item.product.sale_price
                              ? item.product.sale_price.toFixed(2)
                              : "0.00"}
                          </span>
                        </div>
                        {/* Hiển thị tên kích thước */}
                        {item.product.product_sizes &&
                          item.product.product_sizes.length > 0 && (
                            <div className="flex items-center space-x-2">
                              {" "}
                              {/* Dùng flex để giữ mọi thứ trên cùng một dòng */}
                              <label className="text-sm">Size:</label>
                              <div className="flex space-x-2">
                                {item.product.product_sizes.map(
                                  (size, index) => (
                                    <span key={size._id}>
                                      {size.size_id.name}
                                      {index <
                                        item.product.product_sizes.length - 1 &&
                                        ", "}{" "}
                                      {/* Thêm dấu phẩy giữa các kích thước */}
                                    </span>
                                  )
                                )}
                              </div>
                            </div>
                          )}
                        {/* Hiển thị topping */}
                        {item.product.product_toppings &&
                          item.product.product_toppings.length > 0 && (
                            <div className="flex items-center space-x-2">
                              {" "}
                              {/* Dùng flex để giữ mọi thứ trên cùng một dòng */}
                              <label className="text-sm">Topping:</label>
                              <div className="flex space-x-2">
                                {item.product.product_toppings.map(
                                  (topping, index) => (
                                    <span key={topping._id}>
                                      {topping.topping_id.nameTopping}
                                      {index <
                                        item.product.product_toppings.length -
                                          1 && ", "}{" "}
                                      {/* Thêm dấu phẩy giữa các topping */}
                                    </span>
                                  )
                                )}
                              </div>
                            </div>
                          )}
=======
                          {(item.product.price && item.quantity)
                            ? (item.product.price * item.quantity).toFixed(2)
                            : "0.00"}{" "}
                          <span className="line-through text-red-500">
                            {item.product.sale_price ? item.product.sale_price.toFixed(2) : "0.00"}
                          </span>
                        </div>
                        {/* Hiển thị tên kích thước */}
                        {item.product.product_sizes && item.product.product_sizes.length > 0 && (
                          <div className="flex items-center space-x-2"> {/* Dùng flex để giữ mọi thứ trên cùng một dòng */}
                            <label className="text-sm">Size:</label>
                            <div className="flex space-x-2">
                              {item.product.product_sizes.map((size, index) => (
                                <span key={size._id}>
                                  {size.size_id.name}
                                  {index < item.product.product_sizes.length - 1 && ", "} {/* Thêm dấu phẩy giữa các kích thước */}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {/* Hiển thị topping */}
                        {item.product.product_toppings && item.product.product_toppings.length > 0 && (
                          <div className="flex items-center space-x-2"> {/* Dùng flex để giữ mọi thứ trên cùng một dòng */}
                            <label className="text-sm">Topping:</label>
                            <div className="flex space-x-2">
                              {item.product.product_toppings.map((topping, index) => (
                                <span key={topping._id}>
                                  {topping.topping_id.nameTopping}
                                  {index < item.product.product_toppings.length - 1 && ", "} {/* Thêm dấu phẩy giữa các topping */}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
>>>>>>> 8d5b02f92ec6bd487efc179bc84927ecc808bc1f
                        <div className="flex items-center mt-2 border border-gray-300 rounded-md p-1">
                          <button
                            type="button"
                            className="w-8 h-8 bg-gray-200 rounded-l-md"
<<<<<<< HEAD
                            // onClick={() => decreaseQuantity(index)}
=======
                          // onClick={() => decreaseQuantity(index)}
>>>>>>> 8d5b02f92ec6bd487efc179bc84927ecc808bc1f
                          >
                            -
                          </button>
                          <span className="px-4">{item.quantity}</span>
                          <button
                            type="button"
                            className="w-8 h-8 bg-gray-200 rounded-r-md"
<<<<<<< HEAD
                            // onClick={() => increaseQuantity(index)}
=======
                          // onClick={() => increaseQuantity(index)}
>>>>>>> 8d5b02f92ec6bd487efc179bc84927ecc808bc1f
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>

            <div className="border-t-2 border-gray-300 py-4">
              <div className="flex justify-between">
                <span className="text-lg font-semibold">Tổng cộng:</span>
                <span className="text-xl font-bold">
                  {getTotalPrice() && getTotalPrice() > 0
                    ? getTotalPrice().toFixed(2)
<<<<<<< HEAD
                    : "0.00"}{" "}
                  VND
=======
                    : "0.00"} VND
>>>>>>> 8d5b02f92ec6bd487efc179bc84927ecc808bc1f
                </span>
              </div>
            </div>
          </section>
<<<<<<< HEAD
=======

>>>>>>> 8d5b02f92ec6bd487efc179bc84927ecc808bc1f
        </main>
      </div>

      {/* Modal Payment Method */}
      <Modal show={isModalOpen} onClose={toggleModal}>
        <Modal.Header>Chọn phương thức thanh toán</Modal.Header>
        <Modal.Body>
          <div className="flex justify-center items-center space-x-4">
            <div>
              <button
                onClick={toggleModal}
                className="bg-gray-200 p-2 rounded-md"
              >
                <img
                  src="src/pages/CheckOutPage/ImageBanking/Momo.png"
                  alt="Momo"
                  className="w-24"
                />
                <div className="mt-2 text-center">Momo</div>
              </button>
            </div>
            <div>
              <button
                onClick={toggleModal}
                className="bg-gray-200 p-2 rounded-md"
              >
                <img
                  src="src/pages/CheckOutPage/ImageBanking/ZaloPay.png"
                  alt="ZaloPay"
                  className="w-24"
                />
                <div className="mt-2 text-center">ZaloPay</div>
              </button>
            </div>
            <div>
              <button
                onClick={toggleModal}
                className="bg-gray-200 p-2 rounded-md"
              >
                <img
                  src="src/pages/CheckOutPage/ImageBanking/PhoneBanking.png"
                  alt="Phone Banking"
                  className="w-24"
                />
                <div className="mt-2 text-center">Phone Banking</div>
              </button>
            </div>
          </div>
        </Modal.Body>
      </Modal>

      {/* Drawer Component for payment details */}
      <Drawer open={isOpen} onClose={handleClose} position="right">
        <Drawer.Items>
          <Modal show={isModalOpen} onClose={toggleModal}>
            <Modal.Header className="relative h-0 top-2 text-black p-0 mr-2 border-none">
              <h2 className="text-lg font-semibold">Thông tin sản phẩm</h2>
            </Modal.Header>
            <Modal.Body className="bg-gray-100">
              <form onSubmit={handleSubmit}>
                <div className="flex gap-3">
                  {/* Cart-left */}
                  <div className="w-[170px]">
                    <img
                      src="src/account/AuthPage/Bg-coffee.jpg"
                      alt="Cà phê không phê"
                      className="w-[160px] h-[160px] rounded-xl"
                    />
                  </div>
                  {/* Cart-right */}
                  <div className="w-max flex-1">
                    <h1 className="text-lg font-medium">Cà phê không phê</h1>
                    <p className="text-sm text-[#ea8025] font-medium py-1">
                      30.000 đ
                    </p>
                    <i className="text-sm text-black">
                      Không ngon không lấy tiền
                    </i>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={toggleModal}
                  className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
                >
                  Đóng
                </button>
              </form>
            </Modal.Body>
          </Modal>
        </Drawer.Items>
      </Drawer>
    </>
  );
};

export default Checkout;
