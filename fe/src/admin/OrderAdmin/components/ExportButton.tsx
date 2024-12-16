import { utils as XLSXUtils, write as XLSXWrite } from "xlsx";
import { DownloadOutlined } from "@ant-design/icons";
import { Button } from "antd";
import { Order, OrderStatus } from "../../../types/order";

interface ExportButtonProps {
  filteredOrders: Order[];
}

const ExportButton: React.FC<ExportButtonProps> = ({ filteredOrders }) => {
  const OrderStatusLabels: Record<OrderStatus, string> = {
    pending: "Chờ Xác Nhận",
    confirmed: "Đã Xác Nhận",
    shipping: "Đang Giao",
    delivered: "Đã Giao",
    completed: "Hoàn Thành",
    canceled: "Đã Hủy",
  };

  const exportToExcel = () => {
    const exportData = filteredOrders.map((order: Order, index: number) => {
      const totalQuantity = order.orderDetail_id.reduce(
        (sum, detail) => sum + detail.quantity,
        0
      );

      const products = order.orderDetail_id
        .map((detail) => `${detail.product_id?.name} (${detail.quantity})`)
        .join(", ");

      return {
        STT: index + 1,
        "Mã đơn hàng": order.orderNumber,
        "Ngày đặt hàng": new Date(order.createdAt).toLocaleString("vi-VN"),
        "Tên khách hàng": order.customerInfo?.name || "N/A",
        Email: order.customerInfo?.email || "N/A",
        "Số điện thoại": order.customerInfo?.phone || "N/A",
        "Địa chỉ": order.customerInfo?.address || "N/A",
        "Sản phẩm": products,
        "Tổng số lượng": totalQuantity,
        "Tổng tiền": order.totalPrice,
        "Phương thức thanh toán":
          order.paymentMethod === "bank transfer"
            ? "Chuyển khoản"
            : "Thanh toán khi nhận hàng",
        "Trạng thái": OrderStatusLabels[order.orderStatus],
        "Lý do hủy": order.cancellationReason || "",
        "Ngày cập nhật cuối": new Date(order.updatedAt).toLocaleString("vi-VN"),
      };
    });

    const wb = XLSXUtils.book_new();
    const ws = XLSXUtils.json_to_sheet(exportData);

    const colWidths = [
      { wch: 5 },
      { wch: 15 },
      { wch: 20 },
      { wch: 20 },
      { wch: 25 },
      { wch: 15 },
      { wch: 30 },
      { wch: 40 },
      { wch: 15 },
      { wch: 15 },
      { wch: 20 },
      { wch: 15 },
      { wch: 30 },
      { wch: 20 },
    ];
    ws["!cols"] = colWidths;

    XLSXUtils.book_append_sheet(wb, ws, "Danh sách đơn hàng");

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const fileName = `danh-sach-don-hang-${timestamp}.xlsx`;

    const wbout = XLSXWrite(wb, { bookType: "xlsx", type: "binary" });

    const blob = new Blob([s2ab(wbout)], { type: "application/octet-stream" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  const s2ab = (s: string): ArrayBuffer => {
    const buf = new ArrayBuffer(s.length);
    const view = new Uint8Array(buf);
    for (let i = 0; i < s.length; i++) {
      view[i] = s.charCodeAt(i) & 0xff;
    }
    return buf;
  };

  return (
    <Button
      type="primary"
      icon={<DownloadOutlined />}
      onClick={exportToExcel}
      className="bg-green-500 hover:bg-green-600"
    >
      Xuất Excel
    </Button>
  );
};

export default ExportButton;
