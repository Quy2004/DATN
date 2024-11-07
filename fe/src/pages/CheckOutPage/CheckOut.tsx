import { Drawer, Modal } from "flowbite-react";
import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import instance from "../../services/api";

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

  const [paymentMethod, setPaymentMethod] = useState<string>(""); // Trạng thái để theo dõi phương thức thanh toán
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

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault(); // Ngăn chặn reload trang
    console.log("Form submitted");
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
            <form onSubmit={handleSubmit}>
              <h6 className="text-lg font-semibold mb-4">Thông tin liên hệ</h6>
              {["E-mail", "Điện thoại", "Họ và tên", "Địa chỉ"].map(
                (field, index) => (
                  <div className="mb-4" key={index}>
                    <label className="block text-sm font-medium mb-1">
                      {field}
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                        <i
                          className={`fa ${
                            field === "E-mail"
                              ? "fa-envelope"
                              : field === "Điện thoại"
                              ? "fa-phone"
                              : field === "Họ và tên"
                              ? "fa-user-circle"
                              : field === "Địa chỉ"
                              ? "fa-home"
                              : "fa-building"
                          }`}
                        ></i>
                      </span>
                      <input
                        type={
                          field === "E-mail"
                            ? "email"
                            : field === "Điện thoại"
                            ? "tel"
                            : "text"
                        }
                        placeholder={
                          field === "E-mail"
                            ? "Nhập email của bạn"
                            : field === "Điện thoại"
                            ? "Nhập số điện thoại"
                            : field === "Họ và tên"
                            ? "Nhập họ và tên"
                            : "Nhập địa chỉ"
                        }
                        className="w-full p-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400"
                        required
                      />
                    </div>
                  </div>
                )
              )}

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  Ghi chú
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <i className="fa fa-building"></i>
                  </span>
                  <textarea
                    placeholder="Nhập ghi chú khi đặt hàng"
                    className="w-full p-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400"
                  ></textarea>
                </div>
              </div>

              {/* Phương thức thanh toán */}
              <div className="mb-4">
                <h1 className="font-semibold">Phương thức thanh toán:</h1>
                <form className="py-2" action="">
                  <div className="flex items-center gap-2 mb-4">
                    <input
                      type="radio"
                      id="atm"
                      name="paymentMethod"
                      value="atm"
                      onChange={handlePaymentMethodChange}
                      className="mr-2"
                    />
                    <label htmlFor="atm">
                      Thẻ ATM nội địa / Internet Banking
                    </label>
                  </div>

                  {/* Box Note cho phần ghi chú */}
                  {!paymentMethod && (
                    <div className="mt-4 p-4 bg-yellow-100 border border-yellow-300 rounded-md shadow-lg my-4">
                      <p className="text-yellow-800 font-semibold">Lưu ý:</p>
                      <p className="text-gray-700">
                        Vui lòng chọn phương thức thanh toán của bạn.
                      </p>
                    </div>
                  )}

                  {/* Hiển thị các tùy chọn khi chọn "Thẻ ATM" */}
                  {paymentMethod === "atm" && (
                    <div className="mt-4 p-4 border rounded-md shadow-lg my-4">
                      <h6 className="font-semibold">
                        Chọn phương thức thanh toán:
                      </h6>
                      <div className="flex gap-3 my-2">
                        <div>
                          <button type="button" onClick={toggleModal}>
                            <img
                              className="w-14 rounded-lg"
                              src="src/pages/CheckOutPage/ImageBanking/Momo.png"
                              alt="Momo"
                            />
                          </button>
                        </div>
                        <div>
                          <button type="button" onClick={toggleModal}>
                            <img
                              className="w-14 border-2 border-blue-500 rounded-lg"
                              src="src/pages/CheckOutPage/ImageBanking/ZaloPay.png"
                              alt="ZaloPay"
                            />
                          </button>
                        </div>
                        <div>
                          <button type="button" onClick={toggleModal}>
                            <img
                              className="w-14 border-2 border-gray-400 rounded-lg p-1"
                              src="src/pages/CheckOutPage/ImageBanking/PhoneBanking.png"
                              alt="Phone Banking"
                            />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </form>
              </div>

              <div className="flex items-center mb-4">
                <input
                  type="checkbox"
                  id="checkout-checkbox"
                  className="mr-2"
                />
                <label htmlFor="checkout-checkbox" className="text-sm">
                  Lưu thông tin này cho lần sau
                </label>
              </div>

              <button
                type="submit"
                className="w-full px-4 py-2 text-white bg-orange-500 rounded-md hover:bg-orange-600"
              >
                Thanh toán
              </button>
            </form>
          </section>

          {/* Checkout Details */}
          <section className="w-full md:w-1/2 bg-gray-50 rounded-lg shadow-md p-6">
  <h6 className="text-lg font-semibold mb-4">Sản phẩm của bạn</h6>
  <div className="flex flex-col space-y-4 mb-6">
    {carts.map((item: any) => (
      <div
        key={item._id} // Đảm bảo rằng mỗi phần tử có một key duy nhất
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
                {/* Kiểm tra giá trị trước khi gọi toFixed */}
                {(item.product.price && item.quantity)
                  ? (item.product.price * item.quantity).toFixed(2)
                  : "0.00"}{" "}
                <span className="line-through text-red-500">
                  {item.product.originalPrice ? item.product.originalPrice.toFixed(2) : "0.00"}
                </span>
              </div>
              <div className="flex items-center mt-2 border border-gray-300 rounded-md p-1">
                <button
                  type="button"
                  className="w-8 h-8 bg-gray-200 rounded-l-md"
                  // onClick={() => decreaseQuantity(index)}
                >
                  -
                </button>
                <span className="px-4">{item.quantity}</span>
                <button
                  type="button"
                  className="w-8 h-8 bg-gray-200 rounded-r-md"
                  // onClick={() => increaseQuantity(index)}
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
        {/* Kiểm tra giá trị tổng trước khi gọi toFixed */}
        {getTotalPrice() && getTotalPrice() > 0
          ? getTotalPrice().toFixed(2)
          : "0.00"} VND
      </span>
    </div>
  </div>
</section>

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
      <Drawer open={isOpen} onClose={handleClose}>
        <div className="p-4">
          <h3 className="font-semibold text-lg">Chi tiết thanh toán</h3>
          <div className="my-4">
            <div className="flex justify-between mb-2">
              <span className="font-medium">Tổng số tiền:</span>
              <span>{getTotalPrice().toFixed(2)} VND</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="font-medium">Phí vận chuyển:</span>
              <span>19.00 VND</span>
            </div>
          </div>
          <div className="mt-4">
            <button
              onClick={handleClose}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Hoàn tất thanh toán
            </button>
          </div>
        </div>
      </Drawer>
    </>
  );
};

export default Checkout;
