import React, { useState } from 'react';
import { PlusIcon, MinusIcon, TrashIcon } from 'lucide-react';

const CartPage = () => {
    const [quantity, setQuantity] = useState(1);

    const handleIncrement = () => {
        setQuantity(quantity + 1);
    };

    const handleDecrement = () => {
        if (quantity > 1) {
            setQuantity(quantity - 1);
        }
    };

    const handleRemove = () => {
        // Implement remove logic here
    };

    return (
        <div className="bg-white shadow-md rounded-lg p-6 mt-14">
            <div className="flex items-center justify-between border-b pb-4 mb-4">
                <div className="flex items-center">
                    <img src="/product-image.jpg" alt="Product" className="w-20 h-20 object-cover rounded-md mr-4" />
                    <div>
                        <h3 className="text-lg font-medium">Quà tặng khách hàng, đội tác - Trà Sâm Dưa, Trà Thiết Quan Âm, Trà Lài, Trà Shan Tuyết</h3>
                        <p className="text-gray-500">1.467.000 VND</p>
                    </div>
                </div>
                <div className="flex items-center">
                    <button className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors" onClick={handleDecrement}>
                        <MinusIcon className="w-5 h-5 text-gray-600" />
                    </button>
                    <span className="mx-4 text-gray-700 font-medium">{quantity}</span>
                    <button className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors" onClick={handleIncrement}>
                        <PlusIcon className="w-5 h-5 text-gray-600" />
                    </button>
                    <button className="p-2 rounded-full bg-red-500 hover:bg-red-600 transition-colors text-white ml-4" onClick={handleRemove}>
                        <TrashIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <div className="flex justify-between items-center">
                <p className="text-gray-500">Tạm tính</p>
                <p className="text-lg font-medium">1.467.000 VND</p>
            </div>
            <div className="flex justify-between items-center">
                <p className="text-gray-500">Tổng</p>
                <p className="text-lg font-medium">1.467.000 VND</p>
            </div>

            <button className="bg-red-500 hover:bg-red-600 transition-colors text-white w-full py-3 rounded-md mt-4">
                Tiến hành thanh toán
            </button>
        </div>
    );
};

export default CartPage;