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
        toast.error("Không thể tải sản phẩm.");
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
          {/* Checkbox */}


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



          {/* Quantity */}
          <div >
            <span className="font-semibold">x{quantity}</span>
          </div>

          {/* Delete Button */}
          {/* <div className="w-1/5 ml-2">
            <button
              className="border p-2 rounded-lg bg-gray-200 hover:bg-gray-400"
              onClick={deleteSelectedItems}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="size-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                />
              </svg>
            </button>
          </div> */}
        </>
      )}
    </div>
  );
};

export default CartItem;
