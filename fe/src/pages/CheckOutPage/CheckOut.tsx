import { Drawer, Modal } from 'flowbite-react';
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
    const [paymentMethod, setPaymentMethod] = useState<string>(''); // Trạng thái để theo dõi phương thức thanh toán
    const [isOpen, setIsOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleClose = () => setIsOpen(false);
    const toggleModal = () => setIsModalOpen(prev => !prev);

    const handlePaymentMethodChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setPaymentMethod(event.target.value);
    };

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault(); // Ngăn chặn reload trang
        console.log('Form submitted');
    };


    return (
        <>
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
                            <div className=''>
                                <h1 className='font-semibold'>Phương thức thanh toán:</h1>
                                <form className='py-2 *:py-1' action="">
                                    <div className='flex items-center gap-2'>
                                        <input
                                            type="radio"
                                            name="pttt"
                                            id="cod"
                                            value="cod"
                                            checked={paymentMethod === 'cod'}
                                            onChange={handlePaymentMethodChange}
                                        />
                                        <label htmlFor="cod">Thanh toán khi nhận hàng</label>
                                    </div>
                                    <div className='flex items-center gap-2'>
                                        <input
                                            type="radio"
                                            name="pttt"
                                            id="atm"
                                            value="atm"
                                            checked={paymentMethod === 'atm'}
                                            onChange={handlePaymentMethodChange}
                                        />
                                        <label htmlFor="atm">Thẻ ATM nội địa/ Internet Banking</label>
                                    </div>

                                    {/* Hiển thị các tùy chọn khi chọn "Thẻ ATM" */}
                                    {paymentMethod === 'atm' && (
                                        <div className="mt-4 p-4 border rounded-md shadow-lg my-4">
                                            <h6 className="font-semibold">Chọn phương thức thanh toán:</h6>
                                            <div className='flex gap-3 my-2'>
                                                <div className=''>
                                                    <button type='button' onClick={toggleModal}>
                                                        <img className='w-14 rounded-lg ' src="src/pages/CheckOutPage/ImageBanking/Momo.png" alt="" />
                                                    </button>
                                                </div>
                                                <div>
                                                    <button type='button' onClick={toggleModal}>
                                                        <img className='w-14 border-2 border-blue-500  rounded-lg ' src="src/pages/CheckOutPage/ImageBanking/ZaloPay.png" alt="" />
                                                    </button>
                                                </div>
                                                <div>
                                                    <button type='button' onClick={toggleModal}>
                                                        <img className='w-14 border-2 border-gray-400 rounded-lg p-1' src="src/pages/CheckOutPage/ImageBanking/PhoneBanking.png" alt="" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </form>
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
            {/* Banking */}
            <Drawer open={isOpen} onClose={handleClose} position="right">
                <Drawer.Items>
                    <Modal show={isModalOpen} onClose={toggleModal}>
                        <Modal.Header className="relative h-0 top-2 text-black p-0 mr-2 border-none">
                            <h2 className="text-lg font-semibold"></h2>
                        </Modal.Header>
                        <Modal.Body className="bg-gray-100">
                            <div className='flex'>
                                {/* Pay left */}
                                <div className='w-[40%]'>
                                    <h1>Thông tin đơn hàng</h1>
                                    <h1>Mã đơn hàng</h1>
                                    <p>abczyx1234567890</p>
                                    <hr />
                                    <h1>Mô tả</h1>
                                    <p>Thanh toán đơn hàng abczyx1234567890</p>
                                    <hr />
                                    <h1>Số tiền</h1>
                                    <p>100.000 VND</p>
                                    <div>
                                        <p>Đơn hàng sẽ hết hạn sai :</p>
                                        <p>10 phút : 00 giây</p>
                                    </div>
                                    <form onSubmit={handleSubmit}>
                                        <button type="button" onClick={toggleModal} className="mt-4 px-4 py-2 bg-red-500 text-white rounded">Hủy</button>
                                    </form>
                                </div>
                                {/* QR CODE */}
                                <div className='flex-1 w-[60%]'>
                                    <h1>QUÉT MÃ QR ĐỂ THANH TOÁN</h1>
                                </div>
                            </div>
                        </Modal.Body>
                    </Modal>
                </Drawer.Items>
            </Drawer>
        </>
    );
};

export default Checkout;
