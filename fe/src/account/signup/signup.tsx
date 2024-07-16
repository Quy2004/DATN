import { Link } from "react-router-dom"

function Signup() {
    return (
        <>
            <section className="bg-hero bg-no-repeat bg-cover">
                <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
                    <div className="w-full md:mt-0 sm:max-w-md xl:p-0 dark:border-gray-700">
                        <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
                            <h1 className="text-center font-bold text-3xl">
                                Đăng kí
                            </h1>
                            <form className="space-y-4 md:space-y-6 " action="#">
                                <div className="">
                                    <input type="email" name="email" id="email" className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Email" required />
                                </div>
                                <div >
                                    <input type="password" name="password" id="password" placeholder="Mật khẩu" className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" />
                                </div>
                                <div>
                                    <input type="confirm-password" name="confirm-password" id="confirm-password" placeholder="Nhập lại mật khẩu" className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" required />
                                </div>
                                <button type="submit" className="border border-red-500 text-white w-full bg-red-500 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800 ">Tạo tài khoản</button>
                                <p className="text-sm font-light text-gray-700 dark:text-gray-400">
                                    Bạn đã có tài khoản? <Link to="/signin" className="font-medium text-red-500 hover:underline dark:text-primary-500">Đăng nhập tại đây</Link>
                                </p>
                            </form>
                        </div>
                    </div>
                </div>
            </section>

        </>
    )
}
export default Signup