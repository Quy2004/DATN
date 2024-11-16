import { Link } from "react-router-dom"
import { TooltipArrow } from "../../components/TooltipArrow"


const Tracking = () => {
  return (
    <>
      <div className="bg-gray-100">
        <main className="containerAll mx-auto py-5 *:bg-white">
          <section className="flex justify-between py-4 border-b-2">
            <div>
              <p className="flex items-center uppercase gap-1 text-sm text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                </svg>
                Trở lại</p>
            </div>
            <div className="flex  *:text-sm">
              <div className="flex gap-x-2">
                <p>MÃ ĐƠN HÀNG:</p>
                <p className="text-sky-500">240904478FV68R</p>
              </div>
              <div className="mx-2">|</div>
              <div>
                <p className="font-medium text-red-500">ĐƠN HÀNG ĐANG ĐƯỢC GIAO</p>
              </div>
            </div>
          </section>
          <section className="flex justify-center py-10">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full border-4 border-[#2dc258] text-[#2dc258] flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.35 3.836c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m8.9-4.414c.376.023.75.05 1.124.08 1.131.094 1.976 1.057 1.976 2.192V16.5A2.25 2.25 0 0 1 18 18.75h-2.25m-7.5-10.5H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V18.75m-7.5-10.5h6.375c.621 0 1.125.504 1.125 1.125v9.375m-8.25-3 1.5 1.5 3-3.75" />
                </svg>
              </div>
              <p className="text-center text-sm  mt-2 w-32">Đơn Hàng Đã Đặt</p>
              <p className="text-center text-xs text-gray-400">17:34 04-09-2024</p>
            </div>
            <div className="h-1 w-40 border-2 -ml-9 -mr-9 mt-8 bg-[#2dc258] border-[#2dc258]"></div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full border-4 border-[#2dc258] text-[#2dc258] flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z" />
                </svg>
              </div>
              <p className="text-center text-sm mt-2 w-32">Đã Xác Nhận Thông Tin Thanh Toán</p>
              <p className="text-center text-xs text-gray-400">18:04 04-09-2024</p>
            </div>
            <div className="h-1 w-40 -ml-9 -mr-9 mt-8 bg-[#2dc258] border-[#2dc258]"></div>

            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full border-4 border-[#2dc258] text-[#2dc258] flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                </svg>

              </div>
              <p className="text-center text-sm  mt-2 w-32">Đã Giao Cho ĐVVC</p>
              <p className="text-center text-xs text-gray-400">16:31 05-09-2024</p>
            </div>
            <div className="h-1 w-40 -ml-9 -mr-9 mt-8 bg-[#2dc258] border-[#2dc258]"></div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full border-4 border-[#2dc258] text-[#2dc258] flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 3.75H6.912a2.25 2.25 0 0 0-2.15 1.588L2.35 13.177a2.25 2.25 0 0 0-.1.661V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 0 0-2.15-1.588H15M2.25 13.5h3.86a2.25 2.25 0 0 1 2.012 1.244l.256.512a2.25 2.25 0 0 0 2.013 1.244h3.218a2.25 2.25 0 0 0 2.013-1.244l.256-.512a2.25 2.25 0 0 1 2.013-1.244h3.859M12 3v8.25m0 0-3-3m3 3 3-3" />
                </svg>

              </div>
              <p className="text-center text-sm mt-2 w-32">Đã Nhận Được Hàng</p>
              <p className="text-center text-xs text-gray-400">09:06 13-09-2024</p>
            </div>
            <div className="h-1 w-32 -ml-9 -mr-9 mt-8 bg-[#2dc258] border-[#2dc258]"></div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full border-4 border-[#2dc258] text-[#2dc258] flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
                </svg>
              </div>
              <p className="text-center text-sm  mt-2 w-32">Đơn Hàng Đã Hoàn Thành</p>
              <p className="text-center text-xs text-gray-400">23:59 13-10-2024</p>
            </div>
          </section>
          <section className="mt-2 bg-[#eda500]">
            <div className="w-full">
              <h1>Địa CHỉ Nhận Hàng</h1>
            </div>
            <div>
              <div>
                <div>
                  <p>Ngọc Quý</p>
                </div>
                <div>
                  <span tabIndex={0}>(+84) 7632472832</span><br />
                  <span>
                    Trinh Văn Bô, Nam Từ Liêm, Hà Nội
                  </span>
                </div>
              </div>
              <div>
                <Link to={``}>Mua Lại</Link>
              </div>
            </div>
            <p>Cảm ơn bạn đã mua sắm tại CozyHaven</p>
          </section>
          <section>
            <div>
              <TooltipArrow />
            </div>
            <div className="flex justify-between mx-3 border-t-2 border-gray-200 pt-3 pb-10">
              <div className="flex ">
                <img src="Ảnh.jpg" alt="Ảnh sp" className="w-20 h-20 border-[1px]" />
                <div className="mx-3">
                  <p>Prodcuct Cart</p>
                  <span className="flex gap-1">Phân Loại: <p className="text-gray-500">Size XL - Topping : A, B, C, D</p></span>
                  <span>x1</span>
                </div>
              </div>
              <p className="text-sm">33.000 VND</p>
            </div>
            <div>
              <div className="grid grid-cols-4 *:text-right *:border w-full">
                <div className="col-span-3 ">Tổng tiền hàng</div>
                <div className="col-span-1">57.000 VND</div>
              </div>
              <div className="grid grid-cols-4 *:text-right *:border w-full">
                <div className="col-span-3 ">Giảm giá</div>
                <div className="col-span-1">- 5.000 VND</div>
              </div>
              <div className="grid grid-cols-4 *:text-right *:border w-full">
                <div className="col-span-3 ">Thành tiền </div>
                <div className="col-span-1">52.000 VND</div>
              </div>
              <div className="w-full border-2 border-[#FCCD2A]">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-4 border-[1px] border-[#FCCD2A] text-[#FCCD2A] rounded-2xl">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
                </svg>
                <p>
                  Vui lòng thanh toán <p>57.000</p> khi nhận hàng
                </p>
              </div>
              <div className="grid grid-cols-4 *:text-right *:border w-full">
                <div className="col-span-3 ">Phương thức thanh toán</div>
                <div className="col-span-1">Thanh toán khi nhận hàng</div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </>
  )
}

export default Tracking