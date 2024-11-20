import { Link } from "react-router-dom";
import instance from "../../services/api";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";




const CartPage : React.FC<{
    idcart: number;
    
}> = ({ idcart  }) => {
    const user = JSON.parse(localStorage.getItem("user") || '');
    const [cart, setCart] = useState<any>([]);
    const [deleted, setDeleted] = useState(false);
    const [totalPrice, setTotalPrice] = useState<number>(0);

     // Fetch cart data
     const fetchCart = async () => {
        try {
            const { data } = await instance.get(`/cart/${user._id}`);
            setCart(data.cart);
            
            
            const total = data.cart.reduce((acc: number, item: any) => {
                const priceSize = item?.product.product_sizes?.reduce((total: number, size: any) => total + (size?.size_id?.priceSize || 0), 0);
                const toppingSize = item?.product.product_toppings?.reduce((total: number, topping: any) => total + (topping?.topping_id?.priceTopping || 0), 0);
                return acc + ((item.product.sale_price + priceSize + toppingSize) * item.quantity);
            }, 0);
            console.log(data.cart);
            
            setTotalPrice(total);
        } catch (error) {
            console.error("Lỗi khi lấy sản phẩm:", error);
        }
    };

    useEffect(() => {
        fetchCart();
    }, []);

    const handleDelete = async (id: number) => {
        try {
            await instance.patch(`/cart/${idcart}/product/${id}`);
            toast.success("Đã xóa sản phẩm khỏi giỏ hàng.");
            setDeleted(true);
        } catch (error) {
            console.error("Lỗi khi xóa sản phẩm:", error);
            toast.error("Không thể xóa sản phẩm.");
        }
    };
    
    if (deleted) return null;
    

     // Định dạng tiền Việt
     const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(amount);
    };
   

    const calculateTotalPrice = () => {
        const total = cart.reduce((sum, item) => {
          return sum + item.quantity * item.product.sale_price;
        }, 0);
        setTotalPrice(total);
      };

    const handleIncrement = (index: number) => {
     const updatedCart = [...cart];
    updatedCart[index].quantity += 1;
    setCart(updatedCart);
    calculateTotalPrice(); // Tính lại tổng giá
};

    const handleDecrement = (index: number) => {
    const updatedCart = [...cart];
    if (updatedCart[index].quantity > 1) {
    updatedCart[index].quantity -= 1;
    setCart(updatedCart);
    calculateTotalPrice(); // Tính lại tổng giá
  }
};
useEffect(() => {
    calculateTotalPrice();
  }, [cart]);

    return (
        <section className="bg-white py-8 antialiased dark:bg-gray-900 md:py-16 my-4">
        <div className="mx-auto max-w-screen-xl px-4 2xl:px-0">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white sm:text-2xl">Giỏ hàng</h2>
          <p className="border-b-orange-400 w-24 border-b-[4px] my-1"></p>
          <div className="mt-6 sm:mt-8 md:gap-6 lg:flex lg:items-start xl:gap-8">
            <div className="mx-auto w-full flex-none lg:max-w-2xl xl:max-w-4xl">
              {cart.map((item: any, index: number) => (
                <div
                  key={item.product._id}
                  className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 md:p-6"
                >
                  <div className="space-y-4 md:flex md:items-center md:justify-between md:gap-6 md:space-y-0">
                    {/* Hình ảnh và checkbox */}
                    <div className="flex items-center md:order-1">
                      <input type="checkbox" className="mr-3 h-5 w-5 rounded-sm" />
                      <Link to="">
                        <img
                          className="h-20 w-20 dark:hidden"
                          src={item.product.image}
                          alt="product image"
                        />
                      </Link>
                    </div>
      
                    {/* Bộ đếm số lượng */}
                    <div className="flex items-center justify-between md:order-3 md:justify-end">
                      <button
                        onClick={() => handleDecrement(index)}
                        className="bg-[#ea8025] text-white rounded-md px-3 py-1"
                      >
                        -
                      </button>
                      <input
                        type="text"
                        id="quantity"
                        name="quantity"
                        value={item.quantity}
                        readOnly
                        className="w-16 mx-2 text-center rounded-md border-[#ea8025] shadow-sm focus:outline-none"
                      />
                      <button
                        onClick={() => handleIncrement(index)}
                        className="bg-[#ea8025] text-white rounded-md px-3 py-1"
                      >
                        +
                      </button>
                    </div>
      
                    {/* Thông tin sản phẩm */}
                    <div className="w-full min-w-0 flex-1 space-y-3 md:order-2 md:max-w-md">
                      <a
                        href="#"
                        className="text-base font-medium text-gray-900 hover:underline dark:text-white"
                      >
                        {item.product.name}
                      </a>
                      <div className="mx-2">
                        <p className="text-sm">Size: {item?.product_sizes?.name}</p>
                      </div>
                      <div className="mx-2">
                        <p className="text-sm">
                          Topping: {item?.product_toppings?.nameTopping}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDelete(item._id)}
                        type="button"
                        className="inline-flex items-center text-xs font-medium text-red-600 hover:underline dark:text-red-500"
                      >
                        <svg
                          className="mr-1.5 h-3 w-3"
                          aria-hidden="true"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                        >
                          <path
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18 17.94 6M18 18 6.06 6"
                          />
                        </svg>
                        Xóa
                      </button>
                    </div>
      
                    {/* Giá sản phẩm */}
                    <div className="text-end md:order-4 md:w-32">
                     <p className="text-base font-bold text-gray-900 dark:text-white">
                    {formatCurrency(item.quantity * item.product.sale_price)}
                    </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
      
            {/* Hóa đơn thanh toán */}
            <div className="mx-auto mt-6 max-w-4xl flex-1 space-y-6 lg:mt-0 lg:w-full">
              <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:p-6">
                <p className="text-xl font-semibold text-gray-900 dark:text-white">
                  Hóa đơn thanh toán
                </p>
                <div className="space-y-4">
                  <dl className="flex items-center justify-between gap-4 border-t border-gray-200 pt-2 dark:border-gray-700">
                    <dt className="text-base font-bold text-gray-900 dark:text-white">
                      Tổng giá
                    </dt>
                    <dd className="text-base font-bold text-gray-900 dark:text-white">
                      {formatCurrency(totalPrice)}
                    </dd>
                  </dl>
                </div>
                <Link
                  to="#"
                  className="flex w-full items-center justify-center rounded-lg px-5 py-2.5 text-sm font-medium text-white bg-[#ea8025] hover:bg-[#ff8e37] border-2"
                >
                  Tiến hành thanh toán
                </Link>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                    hoặc
                  </span>
                  <a
                    href="#"
                    className="inline-flex items-center gap-2 text-sm font-medium text-primary-700 underline hover:no-underline dark:text-primary-500"
                  >
                    Tiếp tục mua sắm
                    <svg
                      className="h-5 w-5"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 12H5m14 0-4 4m4-4-4-4"
                      />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
    );
};

export default CartPage;
