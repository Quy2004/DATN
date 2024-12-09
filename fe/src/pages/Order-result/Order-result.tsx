import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

const OrderResult = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const resultCode = searchParams.get("resultCode");
  const paymentStatus = searchParams.get("payment_order_status"); // Thêm tham số này

  useEffect(() => {
    if (paymentStatus !== null) {
      // Ưu tiên kiểm tra payment_order_status nếu có
      if (paymentStatus === "true") {
        navigate("/oder-success");
      } else {
        navigate("/order-error");
      }
    } else if (resultCode !== null) {
      // Nếu không có payment_order_status, kiểm tra resultCode
      if (resultCode === "0") {
        navigate("/order-success");
      } else {
        navigate("/order-error");
      }
    }
  }, [resultCode, paymentStatus, navigate]);

  return (
    <div>
      {/* Thông báo tạm thời */}
      <p>Đang xử lý kết quả thanh toán...</p>
    </div>
  );
};

export default OrderResult;
