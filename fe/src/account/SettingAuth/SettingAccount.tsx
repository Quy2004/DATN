import { Link } from "react-router-dom"

const SettingAccount = () => {
  return (
    <>
      <nav className="mt-[60px] *:mx-4 py-4 *:*:py-2 ">
        <div className="">
          <h1 className="flex items-center gap-2 text-lg uppercase">
            <svg xmlns="http://www.w3.org/2000/svg"
              fill="none" viewBox="0 0 24 24"
              strokeWidth="1.5" stroke="currentColor"
              className="w-5 h-auto">
              <path strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
            </svg>
            Trung tâm tài khoản
          </h1>
        </div>
        <div className="w-[400px] text-sm font-medium text-gray-600 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white">
          <Link to={"/account-update"}
            className="block w-full py-2  cursor-pointer hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-sky-500 dark:border-gray-600 dark:hover:bg-gray-600 dark:hover:text-white dark:focus:ring-gray-500 dark:focus:text-white transition-all duration-200 ease-in-out sm:hover:scale-105 md:hover:scale-110"
          >
            <h4 className="flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg"
                fill="none" viewBox="0 0 24 24"
                strokeWidth="1.5" stroke="currentColor"
                className="w-5 h-auto">
                <path strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              </svg>
              Cập nhật tài khoản
            </h4>
          </Link>
        <Link to={"/change-password"}
            className="block w-full py-2  cursor-pointer hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-sky-500 dark:border-gray-600 dark:hover:bg-gray-600 dark:hover:text-white dark:focus:ring-gray-500 dark:focus:text-white transition-all duration-200 ease-in-out sm:hover:scale-105 md:hover:scale-110"
          >
            <h4 className="flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                className="w-5 h-auto">
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M12 3a12 12 0 0 0 8.5 3a12 12 0 0 1 -8.5 15a12 12 0 0 1 -8.5 -15a12 12 0 0 0 8.5 -3" />
                <path d="M12 11m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
                <path d="M12 12l0 2.5" />
              </svg>Đổi mật khẩu
            </h4>
          </Link>
         <Link to={"/order-history"}
            className="block w-full py-2  cursor-pointer hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-sky-500 dark:border-gray-600 dark:hover:bg-gray-600 dark:hover:text-white dark:focus:ring-gray-500 dark:focus:text-white transition-all duration-200 ease-in-out sm:hover:scale-105 md:hover:scale-110"
          >
            <h4 className="flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg"
                fill="none" viewBox="0 0 24 24"
                strokeWidth="1.5" stroke="currentColor"
                className="w-5 h-auto">
                <path strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0-3-3m3 3 3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
              </svg>
              Đơn hàng
            </h4>
          </Link>
        </div>

      </nav>
    </>
  )
}
export default SettingAccount
