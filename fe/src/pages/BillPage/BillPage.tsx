/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import instance from "../../services/api";

const BillPage = () => {
    const localStorageUser = localStorage.getItem("user");
    const storedUserId = localStorageUser ? JSON.parse(localStorageUser)._id : null;
    const {
        data: orders,
        isLoading,
        isError,
        refetch
    } = useQuery({
        queryKey: ["orders", storedUserId],
        queryFn: async () => {
            if (!storedUserId) {
                throw new Error("User ID is not available.");
            }
            const response = await instance.get(`orders/${storedUserId}`);
            if (!response.data || !response.data.data) {
                throw new Error("Invalid response structure.");
            }
            return response.data.data.sort((a: any, b: any) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
        },
        gcTime: 0,  // Thời gian garbage collection = 0
        staleTime: 0,  // Không để dữ liệu hết hạn
        refetchOnMount: true,  // Tự động fetch khi component được mount
        refetchOnWindowFocus: true,  // Tự động fetch khi cửa sổ được focus
        enabled: !!storedUserId,  // Chỉ fetch khi có storedUserId
    });

    console.log(orders);
    // Effect để tự động cập nhật dữ liệu mỗi 5 giây
    useEffect(() => {
        refetch();

        const interval = setInterval(() => {
            refetch();
        }, 5000);

        return () => clearInterval(interval);
    }, [refetch]);

    // Hàm format ngày tháng
    const formatDate = (date: Date | string | number) => {
        const options: Intl.DateTimeFormatOptions = {
            year: "numeric",
            month: "long",
            day: "numeric"
        };
        return new Date(date).toLocaleDateString("vi-VN", options);
    };

    // Hàm format thời gian
    const formatTime = (date: Date | string | number) => {
        const options: Intl.DateTimeFormatOptions = {
            hour: "2-digit",
            minute: "2-digit"
        };
        return new Date(date).toLocaleTimeString("vi-VN", options);
    };

    // Hàm chuyển số thành chữ tiếng Việt
    const numberToWords = (num: any) => {
        const units = ["", "một", "hai", "ba", "bốn", "năm", "sáu", "bảy", "tám", "chín"];
        const scales = ["", "nghìn", "triệu", "tỷ"];
        const toWords = (number: any) => {
            if (number === 0) return "không";
            let str = "";
            let unitIndex = 0;
            while (number > 0) {
                const part = number % 1000;
                if (part > 0) {
                    const hundred = Math.floor(part / 100);
                    const ten = Math.floor((part % 100) / 10);
                    const one = part % 10;

                    let partStr = "";
                    if (hundred > 0) partStr += `${units[hundred]} trăm `;
                    if (ten > 0) {
                        partStr += ten === 1 ? "mười " : `${units[ten]} mươi `;
                    }
                    if (one > 0) {
                        partStr += one === 1 && ten > 1 ? "mốt " : units[one];
                        if (one === 5 && ten > 0) partStr = partStr.replace("năm", "lăm");
                    }
                    str = `${partStr.trim()} ${scales[unitIndex]} ${str}`;
                }
                unitIndex++;
                number = Math.floor(number / 1000);
            }
            return str.trim();
        };
        return `${toWords(num)} đồng`.trim();
    };

    // Xử lý các trạng thái loading và error
    if (isLoading) return <div>Loading...</div>;
    if (isError) return <div>Error loading orders.</div>;
    if (!orders || orders.length === 0) return <div>No orders found.</div>;

    // Lấy đơn hàng mới nhất
    const latestOrder = orders[0];

    // Hàm tính tổng cộng
    const calculateTotalPrice = () => {
        if (!latestOrder || !Array.isArray(latestOrder.orderDetail_id)) return 0;

        // Tổng tất cả các sản phẩm
        const totalItemsPrice = latestOrder.orderDetail_id.reduce((total: number, item: any) => {
            const basePrice = Number(item.sale_price) || 0;
            const sizePrice = Number(item.product_size?.priceSize) || 0;
            const toppingsPrice = Array.isArray(item.product_toppings)
                ? item.product_toppings.reduce((acc: number, topping: any) => acc + (Number(topping?.topping_id?.priceTopping) || 0), 0)
                : 0;
            const quantity = Number(item.quantity) || 1;

            const totalItemPrice = (basePrice + sizePrice + toppingsPrice) * quantity;
            return total + totalItemPrice;
        }, 0);

        // Trừ đi giảm giá
        return totalItemsPrice - (latestOrder.discountAmount || 0);
    };

    // Tổng cộng sau khi tính toán
    const totalPrice = calculateTotalPrice();

    return (
        <div>
            {latestOrder && (
                <div className="containerAll mt-16 bg-slate-100 max-w-md mx-auto border p-6 text-sm font-sans md:mt-20 md:mb-4">
                    <img
                        src="/src/pages/BillPage/Logoremove.png"
                        className="hidden w-24 mb-1 mx-auto md:block"
                        alt="Logo"
                    />
                    <p className="hidden text-center text-gray-600 md:block">Liên hệ: 0352537706</p>
                    <h3 className="text-center text-[#ea8205] font-semibold text-lg mt-4 md:font-bold">HÓA ĐƠN THANH TOÁN</h3>

                    <div className="mt-4 text-gray-800">
                        <p>Ngày: <span className="font-semibold">{formatDate(latestOrder.createdAt)}</span></p>
                        <p>Mã đơn hàng: <span className="font-semibold">{latestOrder.orderNumber}</span></p>
                        <p>Thời gian: <span className="font-semibold">{formatTime(latestOrder.createdAt)}</span></p>
                    </div>
                    <div className="mt-4 text-gray-800">
                        <p>Tên khách hàng: <span className="font-semibold">{latestOrder.customerInfo.name}</span></p>
                        <p>Số điện thoại: <span className="font-semibold">{latestOrder.customerInfo.phone}</span></p>
                        <p>Địa chỉ: <span className="font-semibold">{latestOrder.customerInfo.address}</span></p>
                    </div>

                    <div className="mt-6">
                        {Array.isArray(latestOrder.orderDetail_id) && latestOrder.orderDetail_id.map((item: any, index: any) => {
                            const basePrice = Number(item.sale_price) || 0;
                            const sizePrice = Number(item.product_size?.priceSize) || 0;
                            const toppingsPrice = Array.isArray(item.product_toppings)
                                ? item.product_toppings.reduce((acc: number, topping: any) => {
                                    return acc + (Number(topping?.topping_id?.priceTopping) || 0);
                                }, 0)
                                : 0;
                            const quantity = Number(item.quantity) || 1;
                            // Tính tổng giá cho một đơn vị sản phẩm
                            const totalItemPrice = basePrice + sizePrice + toppingsPrice;

                            // Tính giá cuối cùng sau khi nhân số lượng và trừ giảm giá
                            const finalPrice = (totalItemPrice * quantity) - latestOrder.discountAmount;

                            return (
                                <div key={index} className="mb-6 bg-[#fff] rounded-lg shadow- p-4">
                                    <div className="flex justify-between items-center mb-3">
                                        <h4 className="text-base font-semibold text-gray-700">{item.product_id.name}</h4>
                                        <span className="text-sm text-gray-500">x{quantity}</span>
                                    </div>
                                    <div className="space-y-2 text-sm text-gray-600">
                                        {/* Giá cơ bản */}
                                        <div className="flex justify-between">
                                            <span>Giá cơ bản:</span>
                                            <span className="font-medium">{basePrice.toLocaleString()} VNĐ</span>
                                        </div>
                                        {/* Size và giá size */}
                                        {item.product_size && (
                                            <div className="flex justify-between">
                                                <span>Size {item.product_size?.name || ''}:</span>
                                                <span className="font-medium">{item.product_size?.priceSize.toLocaleString()} VNĐ</span>
                                            </div>
                                        )}

                                        {/* Topping và tổng giá topping */}
                                        {Array.isArray(item.product_toppings) && item.product_toppings.length > 0 && (
                                            <>
                                                <div className="flex justify-between">
                                                    <span>Topping:</span>
                                                    <span className="font-medium text-right">
                                                        {item.product_toppings.map((topping: any) => topping.topping_id?.nameTopping)
                                                            .filter(Boolean)
                                                            .join(", ")}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Giá topping:</span>
                                                    <span className="font-medium">
                                                        {item.product_toppings
                                                            .map((topping: any) => topping.topping_id?.priceTopping || 0) // Đảm bảo giá luôn là số
                                                            .reduce((total: number, price: number) => total + price, 0) // Tính tổng giá
                                                            .toLocaleString()} VNĐ
                                                    </span>
                                                </div>
                                            </>
                                        )}
                                        {/* Đơn giá tổng (trước khi nhân số lượng) */}
                                        <div className="flex justify-between ">
                                            <span>Đơn giá:</span>
                                            <span className="font-medium">{totalItemPrice.toLocaleString()} VNĐ</span>
                                        </div>
                                        {/* Giảm giá nếu có */}
                                        {latestOrder.discountAmount > 0 && (
                                            <div className="flex justify-between text-red-500">
                                                <span>Giảm giá:</span>
                                                <span className="font-semibold">
                                                    - {latestOrder.discountAmount.toLocaleString()} VNĐ
                                                </span>
                                            </div>
                                        )}
                                        {/* Ghi chú */}
                                        {latestOrder.note && latestOrder.note.trim() && (
                                            <div className="flex justify-between mt-3">
                                                <span className="text-gray-700">Ghi chú:</span>
                                                <span className="text-gray-600 italic">
                                                    {latestOrder.note}
                                                </span>
                                            </div>
                                        )}


                                        {/* Thành tiền cuối cùng */}
                                        <div className="flex justify-between text-[#ea8205] font-semibold pt-2 border-t">
                                            <span>Thành tiền:</span>
                                            <span>{finalPrice.toLocaleString()} VNĐ</span>
                                        </div>
                                    </div>
                                </div>

                            );
                        })}
                    </div>
                    <div className="mt-4 text-right text-gray-800">
                        <p className="font-bold">
                            Tổng cộng: <span className="text-xl text-[#ea8205]">{totalPrice.toLocaleString()} VNĐ</span>
                        </p>
                        <p className="italic text-gray-600">({numberToWords(totalPrice)})</p>
                    </div>
                    <p className="text-center mt-4 text-gray-800 font-medium">
                        Xin cảm ơn Quý khách! / Thank you!
                    </p>
                </div>
            )}
        </div>
    );
};

export default BillPage;
