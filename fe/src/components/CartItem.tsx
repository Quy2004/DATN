import React, { useEffect, useState } from "react";
import { Product } from "../types/product";
import instance from "../services/api";
import toast from "react-hot-toast";

const CartItem: React.FC<{
  idcart: number;
  item?: any;
  quantity: number;
  onSelect: (id: number, isSelected: boolean) => void; // Hàm xử lý khi chọn checkbox
}> = ({ idcart, item, quantity, onSelect }) => {
  const [product, setProduct] = useState<Product>();
  const [isSelected, setIsSelected] = useState(false); // Trạng thái checkbox

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await instance.get(`/products/${item?._id}`);
        setProduct(data.data);
      } catch (error) {
        console.error("Lỗi khi lấy sản phẩm:", error);
        
      }
    };
    if (item?._id) {
      fetchProduct();
    }
  }, [item]);

  const handleCheckboxChange = (checked: boolean) => {
    setIsSelected(checked); // Cập nhật trạng thái checkbox
    onSelect(item?._id, checked); // Gửi trạng thái checkbox lên component cha
  };

  const deleteSelectedItems = async () => {
    if (!item) {
      toast.error("Không thể xóa sản phẩm.");
      return;
    }

    try {
      const userId = JSON.parse(localStorage.getItem("user") || "{}")._id;
      await instance.patch(`/cart/${userId}/delete-selected`, {
        productIds: [item?._id], // Chỉ gửi sản phẩm hiện tại để xóa
      });

      toast.success("Đã xóa sản phẩm thành công.");
    } catch (error) {
      toast.error("Không thể xóa sản phẩm.");
      console.error("Delete selected error:", error);
    }
  };

  const priceSize = (item?.product_sizes || []).reduce(
    (total: number, size: any) => total + (size?.size_id?.priceSize || 0), // Tổng giá kích thước
    0
  );

  const priceTopping = (item?.product_toppings || []).reduce(
    (total: number, topping: any) => total + (topping?.topping_id?.priceTopping || 0), // Tổng giá topping
    0
  );

  const basePrice = item?.product?.sale_price || item?.sale_price || 0; // Giá cơ bản của sản phẩm (ưu tiên lấy từ product nếu tồn tại)
  const totalPrice = (basePrice + priceSize + priceTopping) * quantity; // Tính tổng giá

  const formatCurrency = (amount: number) => {
    return `${new Intl.NumberFormat("vi-VN", {
      maximumFractionDigits: 0, // Bỏ phần thập phân nếu không cần
    }).format(amount)} VND`;
  };

  return (
    <div className="flex items-center border-b-2 pb-2">
      {item && (
        <>
          
          {/* Product Image */}
          <div className="w-1/5">
            <img src={item?.image} alt="Ảnh" className="border rounded-lg mt-2 w-[50px] h-[50px] object-cover" />
          </div>

          {/* Product Details */}
          <div className="w-3/5">
            <h4 className="text-lg font-medium mt-1">{item?.name}</h4>
            <p className="text-sm m-1 text-red-500 font-semibold ">
              Tổng: {formatCurrency(totalPrice)} {/* Hiển thị tổng giá */}
            </p>
          </div>

          <div >
            <span className="font-semibold">x{quantity}</span>
          </div>

          
        </>
      )}
    </div>
  );
};

export default CartItem;
