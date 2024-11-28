import { useState } from 'react';
import { Link } from "react-router-dom";
import instance from '../../services/api';
const Forgot = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');

    const handleForgotPassword = async (e: any) => {
        e.preventDefault();
        try {
            const response = await instance.post('/auth/forgot-password', { email });
            setMessage(response.data.message);
        } catch (error: any) {
            setMessage(error.response?.data?.message || 'Lỗi khi gửi yêu cầu quên mật khẩu');
        }
    };

    return (
        <>
            <section className="bg-hero bg-no-repeat bg-cover">
                <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0 mt-10">
                    <div className="w-full md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
                        <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
                            <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
                                Quên mật khẩu
                            </h1>
                            <label>Vui lòng nhập email của bạn để khôi phục mật khẩu.</label>
                            <form onSubmit={handleForgotPassword} className="space-y-4 md:space-y-6">
                                <div>
                                    <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white text-left">Địa chỉ email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        id="email"
                                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                        placeholder="name@company.com"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                                <p className="text-sm text-green-500">{message}</p>
                                <div className="text-right">
                                    <button type="submit" className="text-xs py-3 px-6 rounded-lg bg-red-500 text-white shadow-md hover:shadow-lg">Xác nhận</button>
                                    <button type="button" className="text-xs py-3 px-6 rounded-lg bg-gray-400 text-white shadow-md hover:shadow-lg"><Link to={'/login'}>Quay lại</Link></button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}

export default Forgot;
