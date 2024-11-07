import React, { useState } from "react";
import { Modal } from "flowbite-react";
import { useQuery } from "@tanstack/react-query";
import instance from "../../services/api";

const userId = JSON.parse(localStorage.getItem("user") || "{}")._id;
console.log("User ID:", userId);

const Checkout: React.FC = () => {
  const {
    data: carts,
    isLoading: isCartsLoading,
    isError,
  } = useQuery({
    queryKey: ["cart"],
    queryFn: async () => {
      const response = await instance.get(`/cart/${userId}`);
      console.log("Response from API:", response.data); // Xem phản hồi API
      return response.data.cart; // Trả về dữ liệu giỏ hàng từ trường `cart`
    },
  });

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, ] = useState<string | null>(null); // Trạng thái để quản lý lỗi

  const toggleModal = () => setIsModalOpen((prev) => !prev);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await createOrder(); // Gọi hàm tạo đơn hàng trực tiếp mà không cần xử lý thanh toán
      toggleModal(); // Hiển thị modal khi đơn hàng được tạo thành công
    } catch (error) {
    //   setError(.message); // Lưu lại thông báo lỗi
    }
  };

  const totalAmount = carts?.reduce((total, item) => {
    return total + (item.product.price * item.quantity);
  }, 0) || 0; // Nếu không có sản phẩm, tổng là 0

  const createOrder = async () => {
    if (!carts || carts.length === 0) {
      throw new Error("Giỏ hàng trống, không thể tạo đơn hàng."); // Kiểm tra giỏ hàng trống
    }

    const response = await fetch(`http://localhost:8000/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId,
        items: carts, // Không cần fallback ở đây vì đã kiểm tra ở trên
        totalAmount,
        customerInfo: {
          name,
          email,
          phone,
          address,
        },
      }),
    });

    if (!response.ok) {
      throw new Error("Có lỗi xảy ra khi tạo đơn hàng");
    }

    console.log("Order created successfully");
    // Xóa giỏ hàng hoặc thực hiện các hành động khác nếu cần
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
          <section className="w-full md:w-1/2 bg-white rounded-lg shadow-md p-6">
            <form onSubmit={handleSubmit}>
              <h6 className="text-lg font-semibold mb-2">Thông tin liên hệ</h6>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Họ và tên</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nhập họ và tên"
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">E-mail</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Nhập email"
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Điện thoại</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Nhập số điện thoại"
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Địa chỉ</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Nhập địa chỉ"
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400"
                  required
                />
              </div>
              <div className="mt-4">
                <button
                  type="submit"
                  className="w-full bg-orange-500 hover:bg-orange-600 rounded-md py-2 font-semibold"
                >
                  Xác nhận đơn hàng
                </button>
              </div>
            </form>
            {error && <p className="text-red-500">{error}</p>} {/* Hiển thị thông báo lỗi nếu có */}
            <div className="mt-4">
              <h6 className="font-semibold">Chi tiết đơn hàng:</h6>
              <div className="flex flex-col">
                {carts?.map((item: any) => (
                  <div key={item._id} className="flex mb-4">
                    {item.product ? (
                      <>
                        <img
                          src={item.product.image || "default-image-url.png"}
                          alt={item.product.name}
                          className="w-20 h-auto rounded-lg object-cover mr-4"
                        />
                        <div className="flex-1">
                          <h6 className="font-semibold">{item.product.name}</h6>
                          <p className="text-gray-600">Số lượng: {item.quantity}</p>
                          <p className="text-orange-500 font-semibold">
                            {(item.product.price * item.quantity).toLocaleString("vi-VN", {
                              style: "currency",
                              currency: "VND",
                            })}
                          </p>
                        </div>
                      </>
                    ) : (
                      <p>Không có sản phẩm nào trong giỏ hàng.</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>
          <section className="w-full md:w-1/2 bg-white rounded-lg shadow-md p-6">
            <h6 className="text-lg font-semibold mb-2">Tổng kết</h6>
            <div className="flex justify-between">
              <span>Tổng cộng:</span>
              <span className="font-semibold text-lg text-orange-500">
                {totalAmount.toLocaleString("vi-VN", {
                  style: "currency",
                  currency: "VND",
                })}
              </span>
            </div>
          </section>
        </main>
      </div>
      <Modal show={isModalOpen} onClose={toggleModal}>
        <Modal.Header>Thông báo</Modal.Header>
        <Modal.Body>
          <p>Đơn hàng đã được xác nhận thành công!</p>
        </Modal.Body>
        <Modal.Footer>
          <button onClick={toggleModal} className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700">
            Đóng
          </button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default Checkout;
