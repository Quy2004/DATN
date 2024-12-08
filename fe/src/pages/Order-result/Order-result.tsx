import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

const OrderResult = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const resultCode = searchParams.get("resultCode");

  useEffect(() => {
    if (resultCode === "0") {
      // Thanh toán thành công - chuyển hướng đến trang order-success
      navigate("/oder-success");
    } else {
      // Thanh toán thất bại - chuyển hướng đến trang order-error
      navigate("/order-error");
    }
  }, [resultCode, navigate]);

  return (
    <div>
      {/* Bạn có thể để một thông báo tạm thời nếu muốn */}
      <p>Đang xử lý...</p>
    </div>
  );
};

export default OrderResult;

