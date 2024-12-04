import { useQuery } from "@tanstack/react-query";
import instance from "../../services/api";
import { Notification } from "../../types/notification";
import { Link } from "react-router-dom";

const AccountUpdate = () => {
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : {};

  // Fetch notification data for the user
  const { data: notifications, isLoading, isError, error } = useQuery({
    queryKey: ["notification", user._id],
    queryFn: async () => {
      const response = await instance.get(`notification/${user._id}`);
      return response.data.data; // Assuming response.data.data contains the notifications array
    },
  });

  // Show loading state
  if (isLoading) {
    return <div>Loading...</div>;
  }

  // Show error state
  if (isError) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div className="mt-20 mb-8 flex justify-center mx-auto">
      <h2 className="text-2xl font-bold">Thông báo của bạn</h2>
      {notifications && notifications.length > 0 ? (
  <div className="space-y-4 mt-4">
    {notifications.map((notification: Notification) => (
      // Kiểm tra nếu có product_id thì link sẽ dẫn đến trang sản phẩm, nếu có order_Id thì link sẽ dẫn đến trang theo dõi đơn hàng
      <Link
        to={
          notification.product_Id
            ? `http://localhost:5173/detail/${notification.product_Id}`
            : `http://localhost:5173/order-tracking/${notification.order_Id}`
        }
        key={notification._id}
      >
        <div className="p-4 border rounded-lg shadow">
          <h3 className="font-semibold text-xl">{notification.title}</h3>
          <p>{notification.message}</p>
          <p className="text-sm text-gray-500">Loại: {notification.type}</p>
          <p className="text-sm text-gray-500">Trạng thái: {notification.isRead ? "Đã đọc" : "Chưa đọc"}</p>
        </div>
      </Link>
    ))}
  </div>
) : (
  <p className="mt-4">Không có thông báo nào.</p>
)}

    </div>
  );
};

export default AccountUpdate;
