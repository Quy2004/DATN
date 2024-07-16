
import { Link } from 'react-router-dom';
import '../ChuyenNha.css'
const TeaHolicTab: React.FC = () => {
    return (
        <>
            <div className="mb-14">
                <div className='*:mx-auto'>
                    <div className="flex *:rounded-[10px] py-3 w-[75%] justify-center">
                        <div className="w-[25%] ">
                            <ul className="">
                                <li className="">
                                    <Link to="#">
                                        <img src="https://file.hstatic.net/1000075078/article/an_banh_uong_nuoc_nhom_03_d499c0cab14746588fff6fe0dee678ad_master.jpg" alt=""
                                            className="rounded-xl h-[160px] w-full object-cover" />
                                    </Link>
                                </li>
                            </ul>
                        </div>
                        <div className=" px-5 text-justify w-[50%]">
                            <Link to=''>
                                <h3 className="uppercase text-lg font-semibold pb-1">TRUNG THU NÀY, SAO BẠN KHÔNG TỰ CHO MÌNH "DỪNG MỘT CHÚT THÔI, THƯỞNG MỘT CHÚT TRÔI"?</h3>
                            </Link>
                            <span className="text-left">
                                <p className="my-1 text-gray-500">
                                    5/25/2024
                                </p>
                            </span>
                            <p className="text-sm">
                                Bạn có từng nghe: “Trung thu thôi mà, có gì đâu mà chơi”, hay “Trung...
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
                                        <img src="https://file.hstatic.net/1000075078/article/cautoankeothom_thecoffeehouse_03_29cd435c9a574e1a867ac36f2c863bb6_master.jpg" alt=""
                                            className="rounded-xl h-[160px] w-full object-cover" />
                                    </Link>
                                </li>
                            </ul>
                        </div>
                        <div className=" px-5 text-justify w-[50%]">
                            <Link to=''>
                                <h3 className="uppercase text-lg font-semibold pb-1">
                                    BỘ SƯU TẬP CẦU TOÀN KÈO THƠM: "VÍA"
                                    MAY MẮN KHÔNG THỂ BỎ LỠ TẾT NÀY
                                </h3>
                            </Link>
                            <span className="text-left">
                                <p className="my-1 text-gray-500">
                                    5/25/2024
                                </p>
                            </span>
                            <p className="text-sm">
                                Tết nay vẫn giống Tết xưa, không hề mai một nét văn hoá truyền thống...
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
                                        <img src="https://file.hstatic.net/1000075078/article/hinh_cover_hero_c7bbff15ef674270ae8390da9c2be2ab_master.jpg   " alt=""
                                            className="rounded-xl h-[160px] w-full object-cover" />
                                    </Link>
                                </li>
                            </ul>
                        </div>
                        <div className=" px-5 text-justify w-[50%]">
                            <Link to=''>
                                <h3 className="uppercase text-lg font-semibold pb-1">
                                    “KHUẤY ĐỂ THẤY TRĂNG" - KHUẤY LÊN NIỀM HẠNH PHÚC:
                                    TRẢI NGHIỆM KHÔNG THỂ BỎ LỠ MÙA TRUNG THU NÀY
                                </h3>
                            </Link>
                            <span className="text-left">
                                <p className="my-1 text-gray-500">
                                    5/25/2024
                                </p>
                            </span>
                            <p className="text-sm">
                                Năm 2024 đề cao sức khỏe tinh thần nên giới trẻ muốn tận...
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
                                        <img src="https://file.hstatic.net/1000075078/article/thecoffeehouse_hiteahealthy_03_89263a1a922e4813a894c245b1145b7f_master.png" alt=""
                                            className="rounded-xl h-[160px] w-full object-cover" />
                                    </Link>
                                </li>
                            </ul>
                        </div>
                        <div className=" px-5 text-justify w-[50%]">
                            <Link to=''>
                                <h3 className="uppercase text-lg font-semibold pb-1">
                                    UỐNG TRÀ HIBISCUS CÓ BỊ MẤT NGỦ HAY KHÔNG?
                                </h3>
                            </Link>
                            <span className="text-left">
                                <p className="my-1 text-gray-500">
                                    5/25/2024
                                </p>
                            </span>
                            <p className="text-sm">
                                Trà hoa Hibiscus luôn nằm trong top
                                những loại trà healthy được nhiều người ưa...
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
};

export default TeaHolicTab