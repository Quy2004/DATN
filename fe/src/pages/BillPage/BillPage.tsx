const BillPage = () => {
    const numberToWords = (num: number) => {
        const ones = [
            "", "Một", "Hai", "Ba", "Bốn", "Năm", "Sáu", "Bảy", "Tám", "Chín"
        ];
        const tens = [
            "", "mười", "hai mươi", "ba mươi", "bốn mươi", "năm mươi", "sáu mươi", "bảy mươi", "tám mươi", "chín mươi"
        ];
        const units = [
            "", "nghìn", "triệu", "tỷ"
        ];

        if (num === 0) return "Không đồng";

        const words = [];
        let unitIndex = 0;

        // Tách số thành các nhóm ba chữ số
        while (num > 0) {
            let part = num % 1000;
            if (part > 0) {
                const partWords = [];
                const hundreds = Math.floor(part / 100);
                part = part % 100;
                const ten = Math.floor(part / 10);
                const one = part % 10;

                if (hundreds > 0) {
                    partWords.push(ones[hundreds] + " trăm");
                }
                if (ten > 1) {
                    partWords.push(tens[ten]);
                } else if (ten === 1) {
                    partWords.push("Mười");
                }
                if (one > 0) {
                    if (ten > 1 || ten === 0) {
                        partWords.push(ones[one]);
                    } else {
                        partWords.push("một");
                    }
                }
                words.unshift(partWords.join(" ").trim() + " " + units[unitIndex]);
            }
            num = Math.floor(num / 1000);
            unitIndex++;
        }

        return words.join(" ").trim() + " đồng";
    };

    // Lấy ngày và giờ hiện tại
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
            {
                name: "Cà phê đen",
                quantity: 2,
                unitPrice: 20000,
                total: 40000,
                size: "S",
                toppings: ["Sữa", "Đá"]
            },
            {
                name: "Cà phê nâu",
                quantity: 1,
                unitPrice: 70000,
                total: 70000,
                size: "L",
                toppings: ["Sữa đặc"]
            },
        ],
        "Trà": [
            {
                name: "Trà đào cam sả",
                quantity: 3,
                unitPrice: 40000,
                total: 120000,
                size: "S",
                toppings: ["Đá", "Chanh"]
            },
            {
                name: "Hồng trà",
                quantity: 1,
                unitPrice: 50000,
                total: 50000,
                size: "Lớn",
                toppings: ["Đá"]
            },
        ],
    };

    // Tính tổng cộng
    const totalAmount = Object.values(categorizedItems)
        .flat()
        .reduce((sum, item) => sum + item.total, 0);

    // Sử dụng hàm `numberToWords` để chuyển số tiền thành văn bản
    const totalAmountInWords = numberToWords(totalAmount);

    return (
        <div className="containerAll mt-16 bg-slate-100 max-w-md mx-auto border p-4 text-sm font-sans first-line md:mt-20 md:mb-4">
            <img
                src="/src/pages/BillPage/Logoremove.png"
                className="hidden w-24 mb-1 mx-auto md:block"
                alt="Logo"
            />
            <p className="hidden text-center text-gray-600 md:block">Liên hệ: 0987777777</p>
            <h3 className="text-center text-[#ea8205] font-semibold text-lg mt-4 md:font-bold">HÓA ĐƠN THANH TOÁN</h3>
            <p className="text-center text-gray-600 md:hidden">Liên hệ: 0987777777</p>

            <div className="mt-4 text-gray-800">
                <p>Ngày: <span className="font-semibold">{formattedDate}</span></p>
                <p>Mã đơn hàng: <span className="font-semibold">123</span></p>
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
                    <div key={category} className="mb-6">
                        <div className="text-lg font-semibold text-gray-700 mb-2">{category}</div>
                        <table className="w-full text-gray-800 border-collapse shadow-md rounded-lg overflow-hidden">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Mặt hàng</th>
                                    <th className="text-center py-3 px-4 text-sm font-medium text-gray-700">SL</th>
                                    <th className="text-center py-3 px-4 text-sm font-medium text-gray-700">Size</th>
                                    <th className="text-center py-3 px-4 text-sm font-medium text-gray-700">Topping</th>
                                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">Đơn giá</th>
                                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">Thành tiền</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                {items.map((item, index) => (
                                    <tr key={index} className="border-b hover:bg-gray-50">
                                        <td className="py-3 px-4">{item.name}</td>
                                        <td className="text-center py-3 px-4">{item.quantity}</td>
                                        <td className="text-center py-3 px-4">{item.size}</td>
                                        <td className="text-center py-3 px-4">
                                            {item.toppings.join(", ")}
                                        </td>
                                        <td className="text-right py-3 px-4">{item.unitPrice.toLocaleString()}</td>
                                        <td className="text-right py-3 px-4">{item.total.toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ))}
            </div>

            <div className="mt-4 text-right text-gray-800">
                <p className="font-bold ">Tổng cộng: <span className="text-xl text-[#ea8205]">{totalAmount.toLocaleString()} VND</span></p>
                <p className="italic text-gray-600">({totalAmountInWords})</p>
            </div>
            <p className="text-center mt-4 text-gray-800 font-medium">
                Xin cảm ơn Quý khách! / Thank you!
            </p>
        </div>
    );
};
export default BillPage;
