import { Link } from "react-router-dom";

const Forgot = () => {
    return (
        <>
            <section className="bg-hero bg-no-repeat bg-cover">
                <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0 mt-10">
                    <div className="w-full md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
                        <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
                            <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
                                Quên mật khẩu
                            </h1>
                            <label className="">Vui lòng nhập email của bạn để khôi phục mật khẩu.</label>
                            <form className="space-y-4 md:space-y-6" action="#">
                                <div>
                                    <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white text-left">Địa chỉ email</label>
                                    <input type="email" name="email" id="email" className="bg-gray-50- border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="name@company.com" required />
                                </div>
                                <div className="text-right">
                                    <button type="submit" className="align-middle select-none font-sans font-bold text-center disabled:pointer-events-none text-xs py-3 px-6 rounded-lg bg-gray-400 text-white shadow-md shadow-red-900/10 hover:shadow-lg hover:shadow-gray-900/20 focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85] active:shadow-none mr-1"><Link to={'/signin'}>Quay lại</Link></button>
                                    <button type="submit" className="text-right align-middle select-none font-sans font-bold text-center disabled:pointer-events-none text-xs py-3 px-6 rounded-lg bg-red-500 text-white shadow-md shadow-red-900/10 hover:shadow-lg hover:shadow-gray-900/20 focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85] active:shadow-none">Xác nhận</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}

export default Forgot;
