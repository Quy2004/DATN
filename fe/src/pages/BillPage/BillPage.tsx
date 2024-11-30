import React from "react";

const BillPage = () => {
    // Lấy ngày hiện tại
    const today = new Date();
    const formattedDate = today.toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    });

    const formattedTime = today.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    });

    const categorizedItems = {
        "Cà phê": [
            { name: "Cà phê đen", quantity: 2, unitPrice: 30000, total: 60000 },
            { name: "Cà phê nâu", quantity: 1, unitPrice: 89000, total: 89000 },
        ],
        "Trà": [
            { name: "Trà đào cam sả", quantity: 3, unitPrice: 40000, total: 120000 },
            { name: "Hồng trà", quantity: 1, unitPrice: 50000, total: 50000 },
        ],
    };

    const totalAmount = Object.values(categorizedItems)
        .flat()
        .reduce((sum, item) => sum + item.total, 0);

    return (
        <div className="containerAll mt-16 bg-slate-100 max-w-md mx-auto border p-4 text-sm font-sans first-line md:mt-20 md:mb-4">
            <img
                src="/src/pages/BillPage/Logoremove.png"
                className="hidden w-24 mb-1 mx-auto md:block"
                alt="Logo"
            />
            <p className="hidden text-center text-gray-600 md:block">Liên hệ: 0987777777</p>
            <h3 className="text-center font-semibold text-lg mt-4 md:font-bold">HÓA ĐƠN BÁN HÀNG</h3>
            <p className="text-center text-gray-600 md:hidden">Liên hệ: 0987777777</p>

            <div className="mt-4 text-gray-800">
                <p>Ngày: <span className="font-semibold">{formattedDate}</span></p>
                <p>Mã đơn hàng: <span className="font-semibold">123</span></p>
                <p>Thu ngân: <span className="font-semibold">Đinh Hải Hòa</span></p>
                <p>Thời gian: <span className="font-semibold">{formattedTime}</span></p>
            </div>

            <div className="mt-4">
                <p>Khách hàng: <span className="font-semibold">Trần Văn Quý</span></p>
                <p>SĐT: <span className="font-semibold">0334264444</span></p>
                <p>Địa chỉ: <span className="font-semibold">Cao đẳng FPT Polytechnic, Đường Trịnh Văn Bô, Quận Nam Từ Liêm, Hà Nội</span></p>
            </div>

            {/* Phân loại mặt hàng */}
            <div className="mt-4">
                {Object.entries(categorizedItems).map(([category, items]) => (
                    <div key={category} className="mb-4">
                        <table className="w-full mt-2 text-gray-800 border-collapse">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left py-2 w-1/2">{category}</th>
                                    <th className="text-center py-2">SL</th>
                                    <th className="text-right py-2">Đơn giá</th>
                                    <th className="text-right py-2">Thành tiền</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((item, index) => (
                                    <tr key={index} className="border-b last:border-none">
                                        <td className="py-1">{item.name}</td>
                                        <td className="text-center py-1">{item.quantity}</td>
                                        <td className="text-right py-1">{item.unitPrice.toLocaleString()}</td>
                                        <td className="text-right py-1">{item.total.toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ))}
            </div>

            <div className="mt-4 text-right text-gray-800">
                <p className="font-bold">Tổng cộng: <span className="text-xl text-black">{totalAmount.toLocaleString()} VND</span></p>
                <p className="italic text-gray-600">(Ba trăm mười chín nghìn đồng)</p>
            </div>
            <p className="text-center mt-4 text-gray-800 font-medium">
                Xin cảm ơn Quý khách! / Thank you!
            </p>
        </div>
    );
};

export default BillPage;
