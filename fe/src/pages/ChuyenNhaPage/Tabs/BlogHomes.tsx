
import { Link } from 'react-router-dom';
import '../ChuyenNha.css'
const BlogTab: React.FC = () => {
    return (
        <>
             <div className="mb-14">
                <div className='*:mx-auto'>
                    <div className="flex *:rounded-[10px] py-3 w-[75%] justify-center">
                        <div className="w-[25%] ">
                            <ul className="">
                                <li className="">
                                    <Link to="#">
                                        <img src="https://file.hstatic.net/1000075078/article/thecoffeehouse_caphehighlight01_de40c0102a954c50a328f7befcdd82bd_master.jpg" alt=""
                                            className="rounded-xl h-[160px] w-full object-cover" />
                                    </Link>
                                </li>
                            </ul>
                        </div>
                        <div className=" px-5 text-justify w-[50%]">
                            <Link to=''>
                                <h3 className="uppercase text-lg font-semibold pb-1">bắt gặp sài gòn xưa trong món uống hiện đại của giới trẻ</h3>
                            </Link>
                            <span className="text-left">
                                <p className="my-1 text-gray-500">
                                    5/25/2024
                                </p>
                            </span>
                            <p className="text-sm">
                                Dẫu qua bao nhiêu lớp sóng thời gian,
                                người ta vẫn có thể tìm lại những dấu ấn thăng trầm của
                                một Sài Gòn xưa cũ. Trên những góc phố,
                                trong các...
                            </p>
                        </div>
                    </div>
                </div>
                {/*  */}
                <div className='*:mx-auto'>
                    <div className="flex *:rounded-[10px] py-3 w-[75%] justify-center">
                        <div className="w-[25%] ">
                            <ul className="">
                                <li className="">
                                    <Link to="#">
                                        <img src="https://file.hstatic.net/1000075078/article/1200x630_0b0081d93ba6479b934e04e71cbfd102_master.jpg" alt=""
                                            className="rounded-xl h-[160px] w-full object-cover" />
                                    </Link>
                                </li>
                            </ul>
                        </div>
                        <div className=" px-5 text-justify w-[50%]">
                            <Link to=''>
                                <h3 className="uppercase text-lg font-semibold pb-1">
                                    CHỈ CHỌN CÀ PHÊ MỖI SÁNG NHƯNG CŨNG KHIẾN
                                    CUỘC SỐNG CỦA BẠN THÊM THÚ VỊ, TẠI SAO KHÔNG?

                                </h3>
                            </Link>
                            <span className="text-left">
                                <p className="my-1 text-gray-500">
                                    5/25/2024
                                </p>
                            </span>
                            <p className="text-sm">
                                Thực chất, bạn không nhất thiết phải làm gì
                                to tát để tạo nên một ngày rực rỡ. Chỉ cần bắt đầu từ
                                những việc nhỏ nhặt nhất, khi bạn đứng trước quầy...
                            </p>
                        </div>
                    </div>
                </div>
                {/*  */}
                <div className='*:mx-auto'>
                    <div className="flex *:rounded-[10px] py-3 w-[75%] justify-center">
                        <div className="w-[25%] ">
                            <ul className="">
                                <li className="">
                                    <Link to="#">
                                        <img src="https://file.hstatic.net/1000075078/file/1__3__5c6373c6309f47fe8b298f96417819cf_grande.jpg" alt=""
                                            className="rounded-xl h-[160px] w-full object-cover" />
                                    </Link>
                                </li>
                            </ul>
                        </div>
                        <div className=" px-5 text-justify w-[50%]">
                            <Link to=''>
                                <h3 className="uppercase text-lg font-semibold pb-1">
                                    CÀ PHÊ SỮA ESPRESSO THE COFFEE HOUSE - BẬT LON BẬT VỊ NGON
                                </h3>
                            </Link>
                            <span className="text-left">
                                <p className="my-1 text-gray-500">
                                    5/25/2024
                                </p>
                            </span>
                            <p className="text-sm">
                                Cà phê sữa Espresso là một lon cà phê sữa giải khát với
                                hương vị cà phê đậm đà từ 100% cà phê Robusta cùng vị sữa béo
                                nhẹ cho bạn một trải nghiệm hương vị...
                            </p>
                        </div>
                    </div>
                </div>
                {/*  */}
                <div className='*:mx-auto'>
                    <div className="flex *:rounded-[10px] py-3 w-[75%] justify-center">
                        <div className="w-[25%] ">
                            <ul className="">
                                <li className="">
                                    <Link to="#">
                                        <img src="https://file.hstatic.net/1000075078/file/4__1__473314caa93e41b6aa16b1d9da071e07_grande.jpg" alt=""
                                            className="rounded-xl h-[160px] w-full object-cover" />
                                    </Link>
                                </li>
                            </ul>
                        </div>
                        <div className=" px-5 text-justify w-[50%]">
                            <Link to=''>
                                <h3 className="uppercase text-lg font-semibold pb-1">
                                    UỐNG GÌ KHI TỚI SIGNATURE BY THE COFFEE HOUSE?
                                </h3>
                            </Link>
                            <span className="text-left">
                                <p className="my-1 text-gray-500">
                                    5/25/2024
                                </p>
                            </span>
                            <p className="text-sm">
                            Vừa qua, The Coffee House chính thức khai trương cửa hàng SIGNATURE by The Coffee House, chuyên phục vụ cà phê đặc sản, các món ăn đa bản sắc ấy...
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
};

export default BlogTab