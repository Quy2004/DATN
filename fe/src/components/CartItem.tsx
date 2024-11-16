import React, { useEffect, useState } from "react";
import { Product } from "../types/product";
import instance from "../services/api";
import toast from "react-hot-toast";

const CartItem: React.FC<{
  idcart: number;
  item?: any;
  quantity: number;
}> = ({ idcart, item, quantity }) => {
  const [product, setProduct] = useState<Product>();
  const [deleted, setDeleted] = useState(false); // New state to track deletion

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
    fetchProduct();
  }, [item]);

  

  const handleDelete = async (id: number) => {
    try {
      await instance.patch(`/cart/${idcart}/product/${id}`);
      toast.success("Đã xóa sản phẩm khỏi giỏ hàng.");
      setDeleted(true); // Update deleted state to true
    } catch (error) {
      console.error("Lỗi khi xóa sản phẩm:", error);
      toast.error("Không thể xóa sản phẩm.");
    }
  };

  if (deleted) return null; 
  // console.log(product)
  const priceSize = product?.product_sizes?.reduce((total: number, current: any) => {
    return (total += current?.size_id?.priceSize);
  }, 0);

  const toppingSize = product?.product_toppings?.reduce((total: number, current: any) => {
    return (total += current?.topping_id?.priceTopping);
  }, 0);
  

    // Hàm định dạng tiền Việt
    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
      }).format(amount);
    };
  return (
    <div className="flex *:mx-1 items-center border-b-2 pb-2">
      {
        item && <>
        <div className="w-1/5">
        <img src={item?.image} alt="Ảnh" className="border rounded-lg p-1" />
      </div>
      <div className="w-3/5">
        <h3 className="text-base font-semibold">{item?.name}</h3>
        <p className="text-xs text-red-500 font-semibold">
        {formatCurrency((item?.sale_price + priceSize + toppingSize) * quantity)}
        </p>
      </div>
      <div>
        <span>{quantity}</span>
      </div>
      <div className="1/5">
        <button
          className="border p-2 rounded-lg bg-gray-200 hover:bg-gray-400"
          onClick={() => handleDelete(item?._id)}
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
      </div>
        </>
      }
      
    </div>
  );
};

export default CartItem;
