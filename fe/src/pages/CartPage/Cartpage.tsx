import { Link } from "react-router-dom"
import instance from "../../services/api";
import { useEffect, useState } from "react";




const CartPage = () => {
    const user = JSON.parse(localStorage.getItem("user") || '');
	const [cart, setCart] = useState<any>([]);
    //cart
    const fetchCart = async () => {
    try {
        const { data } = await instance.get(`/cart/${user._id}`);
        console.log(data);
        // Gọi API từ backend
        setCart(data.cart); // Lưu dữ liệu sản phẩm vào state
        // setLoading(false); // Tắt trạng thái loading
    } catch (error) {
        console.error("Lỗi khi lấy sản phẩm:", error);
        // setLoading(false); // Tắt trạng thái loading trong trường hợp lỗi
    }
};
useEffect(() => {
    fetchCart();
}, []);


    return (
        <section className="bg-white py-8 antialiased dark:bg-gray-900 md:py-16 my-4">
            <div className="mx-auto max-w-screen-xl px-4 2xl:px-0">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white sm:text-2xl">Giỏ hàng</h2>
                <p className="border-b-orange-400 w-24 border-b-[4px] my-1"></p>
                <div className="mt-6 sm:mt-8 md:gap-6 lg:flex lg:items-start xl:gap-8">
                   {cart.map((item : any)=>{
                      return  (<>
                      <div className="mx-auto w-full flex-none lg:max-w-2xl xl:max-w-4xl">

<div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 md:p-6">
    <div className="space-y-4 md:flex md:items-center md:justify-between md:gap-6 md:space-y-0">
        <div className="flex items-center md:order-1">
            {/* Checkbox */}
            <input type="checkbox" className="mr-3 h-5 w-5" />
            <Link to="">
                <img className="h-20 w-20 dark:hidden" src={item?.product?.image} alt="imac image" />
            </Link>
        </div>
        {/* Số lượng */}
        <div className="flex items-center justify-between md:order-3 md:justify-end">
           <button type="button"  ></button>
           <input
                type="number"
                id="quantity"
                name="quantity"
                min={1}
                value={item?.quantity}
                // onChange={handleQuantityChange}
                
                className="w-16 mt-2 text-center rounded-md border-[#ea8025] shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
            <button type="button" ></button>
            {/* Giá */}
            <div className="text-end md:order-4 md:w-32">
                <p className="text-base font-bold text-gray-900 dark:text-white">${item?.product?.price * item?.quantity}</p>
            </div>
        </div>
        <div className="w-full min-w-0 flex-1 space-y-3 md:order-2 md:max-w-md">
            <a href="#" className="text-base font-medium text-gray-900 hover:underline dark:text-white">{item?.product?.name}</a>
            {/* Size */}
            <div className="mx-2">
                <p className="text-sm">Size: </p>
              
            </div>
            {/* Topping */}
            <div className="mx-2">
                <p className="text-sm">Topping: </p>
            </div>
            <div className="flex items-center">
                <button type="button" className="inline-flex items-center text-xs font-medium text-red-600 hover:underline dark:text-red-500">
                    <svg className="me-1.5 h-3 w-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18 17.94 6M18 18 6.06 6" />
                    </svg>
                    Xóa
                </button>
            </div>
        </div>
    </div>
</div>

<div className="hidden xl:mt-8 xl:block">
    <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">Sản phẩm khác</h3>
    <div className="mt-6 grid grid-cols-3 gap-4 sm:mt-8">
        <div className="space-y-6 overflow-hidden rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <a href="#" className="overflow-hidden rounded">
                <img className="mx-auto h-44 w-44 dark:hidden border-2 rounded-lg" src="src/pages/CartPage/Trà Đào 3.jpg" alt="imac image" />
            </a>
            <div>
                <a href="#" className="text-lg font-semibold leading-tight text-gray-900 hover:underline dark:text-white">Trà đào cam sả</a>
                <p className="mt-2 text-base font-normal text-gray-500 dark:text-gray-400">Mô tả sản phẩm</p>
            </div>
            <div>
                <p className="text-lg font-medium text-gray-900 dark:text-white">
                    <span className=""> $399,99 </span>
                </p>
            </div>
            <div className="mt-6 text-center">
                <button className="relative bg-white  px-6 py-2 border border-[#ea8025] text-lg rounded-md transition duration-300 overflow-hidden focus:outline-none cursor-pointer group text-black font-semibold">
                    <span className="relative z-10 transition duration-300 group-hover:text-white"><p className="text-base">Thêm giỏ hàng</p></span>
                    <span className="absolute inset-0 bg-[#ea8025] opacity-0  transform -translate-x-full transition-all duration-1000 group-hover:translate-x-0 group-hover:opacity-50"></span>
                    <span className="absolute inset-0 bg-[#ea8025] opacity-0  transform -translate-x-full transition-all duration-1000 group-hover:translate-x-0 group-hover:opacity-100"></span>
                </button>
            </div>
        </div>
    </div>
</div>
</div>
<div className="mx-auto mt-6 max-w-4xl flex-1 space-y-6 lg:mt-0 lg:w-full">
<div className="space-y-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:p-6">
    <p className="text-xl font-semibold text-gray-900 dark:text-white">Hóa đơn thanh toán</p>
    <div className="space-y-4">
        <div className="space-y-2">
            <dl className="flex items-center justify-between gap-4">
                <dt className="text-base font-normal text-gray-500 dark:text-gray-400">{item?.product?.name}</dt>
                <dd className="text-base font-medium text-gray-900 dark:text-white">${item?.product?.price }</dd>
            </dl>
        </div>
        <dl className="flex items-center justify-between gap-4 border-t border-gray-200 pt-2 dark:border-gray-700">
            <dt className="text-base font-bold text-gray-900 dark:text-white">Tổng giá</dt>
            <dd className="text-base font-bold text-gray-900 dark:text-white">${item?.product?.price * item?.quantity}</dd>
        </dl>
    </div>
    <Link to="#" className="flex w-full items-center justify-center rounded-lg  px-5 py-2.5 text-sm font-medium text-white bg-[#ea8025] hover:bg-[#ff8e37] border-2">Tiến hành thanh toán</Link>
    <div className="flex items-center justify-center gap-2">
        <span className="text-sm font-normal text-gray-500 dark:text-gray-400"> hoặc </span>
        <a href="#" className="inline-flex items-center gap-2 text-sm font-medium text-primary-700 underline hover:no-underline dark:text-primary-500">
            Tiếp tục mua sắm
            <svg className="h-5 w-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 12H5m14 0-4 4m4-4-4-4" />
            </svg>
        </a>
    </div>
</div>
</div>
                    </>)
                   })}
                </div>
            </div>
        </section>

    )
}

export default CartPage;