import React, { useState } from 'react';

const Checkout: React.FC = () => {
    const initialItems = [
        {
            img: 'https://rvs-checkout-page.onrender.com/photo1.png',
            name: 'Ba lô cổ điển',
            price: 54.99,
            originalPrice: 94.99,
            quantity: 1,
        },
        {
            img: 'https://rvs-checkout-page.onrender.com/photo2.png',
            name: 'Giày Levi',
            price: 74.99,
            originalPrice: 124.99,
            quantity: 1,
        },
    ];

    const [items, setItems] = useState(initialItems);

    const increaseQuantity = (index: number) => {
        const updatedItems = [...items];
        updatedItems[index].quantity += 1;
        setItems(updatedItems);
    };

    const decreaseQuantity = (index: number) => {
        const updatedItems = [...items];
        if (updatedItems[index].quantity > 1) {
            updatedItems[index].quantity -= 1;
            setItems(updatedItems);
        }
    };

    const getTotalPrice = () => {
        const shippingCost = 19.00;
        const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
        return subtotal + shippingCost;
    };

    return (
        <div className="flex flex-col items-center w-full min-h-screen p-8 bg-gray-100 md:p-12 mt-10">
            <main className="flex flex-col md:flex-row gap-8 w-full max-w-5xl">
                {/* Checkout Form */}
                <section className="w-full md:w-1/2 bg-white rounded-lg shadow-md p-6">
                    <form action="#!" method="get">
                        <h6 className="text-lg font-semibold mb-2">Thông tin liên hệ</h6>
                        {['E-mail', 'Điện thoại', 'Họ và tên', 'Địa chỉ'].map((field, index) => (
                            <div className="mb-4" key={index}>
                                <label className="block text-sm font-medium mb-1">{field}</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                                        <i className={`fa fa-${field === 'E-mail' ? 'envelope' : field === 'Điện thoại' ? 'phone' : field === 'Họ và tên' ? 'user-circle' : field === 'Địa chỉ' ? 'home' : 'building'}`}></i>
                                    </span>
                                    <input
                                        type={field === 'E-mail' ? 'email' : field === 'Điện thoại' ? 'tel' : 'text'}
                                        placeholder={field === 'E-mail' ? 'Nhập email của bạn' : field === 'Điện thoại' ? 'Nhập số điện thoại' : field === 'Họ và tên' ? 'Nhập họ và tên' : field === 'Địa chỉ' ? 'Nhập địa chỉ' : 'Nhập thành phố'}
                                        className="w-full p-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400"
                                    />
                                </div>
                            </div>
                        ))}
                        <div className="flex flex-col md:flex-row md:justify-between mb-4">
                        </div>
                        <div className="flex items-center mb-4">
                            <input type="checkbox" id="checkout-checkbox" className="mr-2" />
                            <label htmlFor="checkout-checkbox" className="text-sm">Lưu thông tin này cho lần sau</label>
                        </div>
                    </form>
                </section>

                {/* Checkout Details */}
                <section className="w-full md:w-1/2 bg-gray-50 rounded-lg shadow-md p-6">
                    <h6 className="text-lg font-semibold mb-4">Sản phẩm của bạn</h6>
                    <div className="flex flex-col space-y-4 mb-6">
                        {items.map((item, index) => (
                            <div key={index} className="flex flex-col md:flex-row items-center p-4 bg-white rounded-lg shadow-sm">
                                <img src={item.img} alt={item.name} className="w-full md:w-1/3 rounded-lg" />
                                <div className="w-full md:w-2/3 pl-0 md:pl-4">
                                    <div className="font-semibold">{item.name}</div>
                                    <div className="text-gray-500">
                                        ${(item.price * item.quantity).toFixed(2)} <span className="line-through text-red-500">${item.originalPrice.toFixed(2)}</span>
                                    </div>
                                    <div className="flex items-center mt-2 border border-gray-300 rounded-md p-1">
                                        <button className="w-8 h-8 bg-gray-200 rounded-l-md" onClick={() => decreaseQuantity(index)}>-</button>
                                        <span className="px-4">{item.quantity}</span>
                                        <button className="w-8 h-8 bg-gray-200 rounded-r-md" onClick={() => increaseQuantity(index)}>+</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between py-2 border-t border-gray-300">
                        <h6 className="font-medium">Phí vận chuyển</h6>
                        <p className="text-gray-700">$19.00</p>
                    </div>
                    <div className="flex justify-between py-2 border-t border-gray-300">
                        <h6 className="font-medium">Tổng cộng</h6>
                        <p className="text-gray-700">${getTotalPrice().toFixed(2)}</p>
                    </div>
                    <button className="w-full px-4 py-2 text-white bg-orange-500 rounded-md hover:bg-orange-600">Thanh toán</button>
                </section>
            </main>


            <footer className="mt-8 text-gray-400 text-sm">
                <p>
                    Tạo bởi DATN -{' '}
                    <a href="https://vetri-suriya.web.app/" className="text-gray-500 hover:text-gray-700">CozyHaven</a>
                </p>
            </footer>
        </div>
    );
};

export default Checkout;
