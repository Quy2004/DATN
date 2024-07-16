import { Link } from "react-router-dom";
import '../ChuyenNha.css'
const AllHomes: React.FC = () => {
    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth' // Cuộn nhanh lên đầu trang mà không có hiệu ứng cuộn chậm
        });
    };
    return (
        <>
            <div className="allHome row grid  grid-cols-3 containerAll mx-auto gap-8 my-20 ">
                <div className="cow *:rounded-[10px] *:text-justify">
                    <ul>
                        <li>
                            <Link to="#">
                                <img src="https://file.hstatic.net/1000075078/article/thecoffeehouse_traxanhtaybac_1_d8c2ac635c5941a19c0065339727e41a_master.jpg"
                                    alt="" className="object-cover w-[370px] h-[370px] rounded-xl" />
                            </Link>
                        </li>
                    </ul>

                    <Link to=''>
                        <h3 className="uppercase truncate text-[17px] font-semibold pt-3 pb-2">
                            NGƯỢC LÊN TÂY BẮC GÓI VỊ MỘC VỀ XUÔI
                        </h3>
                    </Link>
                    <span>
                        <p className="text-left  text-gray-400 mb-4 text-xs">
                            30/2/2024
                        </p>
                    </span>
                    <p className="text-sm ">
                        Những dải ruộng bậc thang, các cô gái Thái với điệu múa xòe hoa, muôn cung đường ngợp mùa hoa…đó là rẻo cao Tây Bắc luôn làm say lòng...
                    </p>
                </div>
                <div className="cow col-span-2 *:rounded-[10px] *:text-justify">
                    <ul>
                        <li>
                            <Link to="">
                                <img src="https://file.hstatic.net/1000075078/article/signaturebythecoffeehouse_03_16b2ab7101e14d62835a4b231e73b65d_master.jpg"
                                    alt="" className="h-[430px] w-full rounded-xl object-cover" />
                            </Link>
                        </li>
                    </ul>
                    <Link to=''>
                        <h3 className="uppercase truncate text-[17px] font-semibold pt-3 pb-2">
                            SIGNATURE BY THE COFFEE HOUSE - "DẤU ẤN" MỚI CỦA NHÀ CÀ PHÊ
                        </h3>
                    </Link>
                    <span>
                        <p className="text-left  text-gray-400 mb-4 text-xs">
                            30/2/2024
                        </p>
                    </span>
                    <p className="text-sm font-normal ">
                        Ngày 11.01.2023,
                        Chuỗi The Coffee House thông báo cửa hàng SIGNATURE
                        by The Coffee House chính thức khai trương tại trung tâm thương mại Crescent Mall, Nguyễn Văn Linh, Quận...
                    </p>
                </div>
            </div>
            {/* Coffee */}
            <div className="row grid grid-cols-5 bg-amber-50 pos">
                <div className="cow col-span-2">
                    <div className="image-container" style={{ marginTop: '-40px' }}>
                        <ul>
                            <li>
                                <Link to="">
                                    <img src="https://file.hstatic.net/1000075078/file/photo_2021-11-25_09-31-52_52c6f13fcc06433db2362281059d1c09.jpg"
                                        className="mb-2 w-full" alt="" />
                                </Link>
                            </li>
                        </ul>
                    </div>
                    <h1>Left</h1>
                </div>
                <div className="cow ml-8 col-span-3">
                    <div>
                        <h2 className="border-l-[6px] text-left text-xl font-semibold px-3 py-0.5 mt-10 mb-4 border-l-orange-400">
                            Coffeholic
                        </h2>
                        <div className="grid grid-cols-3 *:rounded-[10px] py-3">
                            <div className="col-span-1">
                                <ul className="">
                                    <li className="">
                                        <Link to="#">
                                            <img src="https://file.hstatic.net/1000075078/article/thecoffeehouse_caphehighlight01_de40c0102a954c50a328f7befcdd82bd_master.jpg" alt=""
                                                className="rounded-xl h-[160px]" />
                                        </Link>
                                    </li>
                                </ul>
                            </div>
                            <div className="col-span-2 px-5 text-justify w-3/4">
                                <Link to=''>
                                    <h3 className="uppercase text-lg font-semibold pb-1">bắt gặp sài gòn xưa trong món uống hiện đại của giới trẻ</h3>
                                </Link>
                                <span className="text-left">
                                    <p className="my-1 text-gray-500">
                                        5/25/2024
                                    </p>
                                </span>
                                <p className="text-[15px]">
                                    Dẫu qua bao nhiêu lớp sóng thời gian,
                                    người ta vẫn có thể tìm lại...</p>
                            </div>
                        </div>
                        {/*  */}
                        <div className="grid grid-cols-3 *:rounded-[10px] py-3">
                            <div className="col-span-1">
                                <ul className="">
                                    <li className="">
                                        <Link to="#">
                                            <img src="https://file.hstatic.net/1000075078/article/1200x630_0b0081d93ba6479b934e04e71cbfd102_grande.jpg" alt=""
                                                className="rounded-xl h-[160px]" />
                                        </Link>
                                    </li>
                                </ul>
                            </div>
                            <div className="col-span-2 px-5 text-left w-3/4">
                                <Link to=''>
                                    <h3 className="uppercase text-lg font-semibold pb-1">
                                        CHỈ CHỌN CÀ PHÊ MỖI SÁNG NHƯNG CŨNG
                                        <p className="truncate"> KHIẾN CUỘC SỐNG CỦA BẠN THÊM THÚ VỊ, TẠI SAO KHÔNG?</p>
                                    </h3>
                                </Link>
                                <span className="text-left">
                                    <p className="my-1 text-gray-500">
                                        5/25/2024
                                    </p>
                                </span>
                                <p className="text-[15px]">
                                    Thực chất, bạn không nhất thiết
                                    phải làm gì to tát để tạo nên một..</p>
                            </div>
                        </div>
                        {/*  */}
                        <div className="grid grid-cols-3 *:rounded-[10px] py-3">
                            <div className="col-span-1">
                                <ul className="">
                                    <li className="">
                                        <Link to="#">
                                            <img src="https://file.hstatic.net/1000075078/article/3__1__2b67342f4db64bb082944cf078afd910_grande.jpg" alt=""
                                                className="rounded-xl h-[160px] w-full object-cover" />
                                        </Link>
                                    </li>
                                </ul>
                            </div>
                            <div className="col-span-2 px-5 text-justify w-3/4">
                                <Link to=''>
                                    <h3 className="uppercase text-lg font-semibold pb-1">
                                        SIGNATURE - BIỂU TƯỢNG VĂN HOÁ CÀ PHÊ CỦA THE COFFEE HOUSE ĐÃ QUAY TRỞ LẠI
                                    </h3>
                                </Link>
                                <span className="text-left">
                                    <p className="my-1 text-gray-500">
                                        5/25/2024
                                    </p>
                                </span>
                                <p className="text-[15px]">
                                    Mới đây, các "tín đồ" cà phê
                                    đang bàn tán xôn xao về SIGNATURE -...</p>
                            </div>
                        </div>
                        <div>
                            <Link to="coffeeholic" onClick={scrollToTop}>
                                <h3 className="border-2 w-1/3 mx-auto my-8 py-2 rounded-lg bg-white font-semibold text-[17px]">
                                    Tìm hiểu thêm
                                </h3>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
            {/* tea */}
            <div className="row flex pb-14">
                <div className="cow ml-36 flex-auto w-60 *:pr-4">
                    <h2 className="border-l-[6px] text-left text-xl font-semibold px-3 py-0.5 mt-10 mb-4 border-l-orange-400">
                        Teaholic
                    </h2>
                    {/*  */}
                    <div className=" flex *:rounded-[10px] py-3">
                        <div className="flex-auto w-40">
                            <ul className="">
                                <li className="">
                                    <Link to="#">
                                        <img src="https://file.hstatic.net/1000075078/article/an_banh_uong_nuoc_nhom_03_d499c0cab14746588fff6fe0dee678ad_grande.jpg" alt=""
                                            className="rounded-xl h-[160px] w-[91%]" />
                                    </Link>
                                </li>
                            </ul>
                        </div>
                        <div className=" text-left flex-auto w-60">
                            <Link to=''>
                                <h3 className="uppercase text-lg font-semibold pb-1">
                                    TRUNG THU NÀY, SAO BẠN KHÔNG TỰ CHO
                                    <p className="truncate">MÌNH "DỪNG MỘT CHÚT THÔI, THƯỞNG MỘT CHÚT TRÔI "?</p>
                                </h3>
                            </Link>
                            <span className="text-left">
                                <p className="my-1 text-gray-500">
                                    5/25/2024
                                </p>
                            </span>
                            <p className="text-[15px]"> Bạn có từng nghe:
                                “Trung thu thôi mà, có gì đâu mà chơi”, hay “Trung...
                            </p>
                        </div>
                    </div>
                    {/*  */}
                    <div className=" flex *:rounded-[10px] py-3">
                        <div className="flex-auto w-40">
                            <ul className="">
                                <li className="">
                                    <Link to="#">
                                        <img src="https://file.hstatic.net/1000075078/article/cautoankeothom_thecoffeehouse_03_29cd435c9a574e1a867ac36f2c863bb6_grande.jpg" alt=""
                                            className="rounded-xl h-[160px] w-[91%]" />
                                    </Link>
                                </li>
                            </ul>
                        </div>
                        <div className=" text-left flex-auto w-60">
                            <Link to=''>
                                <h3 className="uppercase text-lg font-semibold pb-1 pr-8">
                                    BỘ SƯU TẬP CẦU TOÀN KÈO THƠM: "VÍA" MAY MẮN KHÔNG THỂ BỎ LỠ TẾT NÀY
                                </h3>
                            </Link>
                            <span className="text-left">
                                <p className="my-1 text-gray-500">
                                    5/25/2024
                                </p>
                            </span>
                            <p className="text-[15px]"> Tết nay vẫn giống Tết xưa,
                                không hề mai một nét văn hoá truyền thống...</p>
                        </div>
                    </div>
                    {/*  */}
                    <div className=" flex *:rounded-[10px] py-3">
                        <div className="flex-auto w-40">
                            <ul className="">
                                <li className="">
                                    <Link to="#">
                                        <img src="https://file.hstatic.net/1000075078/article/dscf0216_2890bcca44ae49aaaf843d5fa3db2fc6_grande.jpg" alt=""
                                            className="rounded-xl h-[160px] w-[91%]" />
                                    </Link>
                                </li>
                            </ul>
                        </div>
                        <div className=" text-left flex-auto w-60">
                            <Link to=''>
                                <h3 className="uppercase text-lg font-semibold pb-1">
                                    “KHUẤY ĐỂ THẤY TRĂNG" - KHUẤY LÊN NIỀM
                                    <p className="truncate">HẠNH PHÚC: TRẢI NGHIỆM KHÔNG THỂ BỎ LỠ MÙA TRUNG THU NÀY
                                    </p>
                                </h3>
                            </Link>
                            <span className="text-left">
                                <p className="my-1 text-gray-500">
                                    5/25/2024
                                </p>
                            </span>
                            <p className="text-[15px]">
                                Năm 2022 là năm đề cao sức khỏe
                                tinh thần nên giới trẻ muốn tận...</p>
                        </div>
                    </div>
                    <div>
                        <Link to="teaholic" onClick={scrollToTop}>
                            <h3 className="border-2 w-1/3 mx-auto my-8 py-2 rounded-lg bg-white font-semibold text-[17px]">
                                Tìm hiểu thêm
                            </h3>
                        </Link>
                    </div>
                </div>
                <div className="cow items flex items-center flex-auto w-40 px-2">
                    <div className="image-container " >
                        <ul>
                            <li>
                                <Link to="">
                                    <img src="https://file.hstatic.net/1000075078/file/teaholic_3f320cac87814da0912f45ccfebd4e0e.jpg"
                                        className="mb-2 w-full" alt="" />
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
            {/* blog */}
            <div className="row grid grid-cols-5 bg-amber-50 pos">
                <div className="cow col-span-2">
                    <div className="image-container" style={{ marginTop: '-40px' }}>
                        <ul>
                            <li>
                                <Link to="">
                                    <img src="https://file.hstatic.net/1000075078/file/blog_94b05e56224646bc86c6e72c73ac4258.jpg"
                                        className="mb-2 w-full object-cover" alt="" />
                                </Link>
                            </li>
                        </ul>
                    </div>
                    <h1>Left</h1>
                </div>
                <div className="cow ml-8 col-span-3">
                    <div>
                        <h2 className="border-l-[6px] text-left text-xl font-semibold px-3 py-0.5 mt-10 mb-4 border-l-orange-400">
                            Blog
                        </h2>
                        {/*  */}
                        <div className="grid grid-cols-3 *:rounded-[10px] py-3">
                            <div className="col-span-1">
                                <ul className="">
                                    <li className="">
                                        <Link to="#">
                                            <img src="https://file.hstatic.net/1000075078/article/post-tcbc_f_2e456821ebac42398b294f9356fe30a0_grande.jpg" alt=""
                                                className="rounded-xl h-[160px] object-cover" />
                                        </Link>
                                    </li>
                                </ul>
                            </div>
                            <div className="col-span-2 px-5 text-justify w-3/4">
                                <Link to=''>
                                    <h3 className="uppercase text-lg font-semibold pb-1">
                                        THE COFFEE HOUSE PHẢN HỒI VỀ SỰ CỐ VỠ
                                        <p className="truncate">KÍNH DO GIÔNG LỐC TẠI CỬA HÀNG THE COFFEE HOUSE THÁI HÀ, HÀ NỘI</p>
                                    </h3>
                                </Link>
                                <span className="text-left">
                                    <p className="my-1 text-gray-500">
                                        5/25/2024
                                    </p>
                                </span>
                                <p className="text-[15px]">
                                    Vào tối ngày 20 tháng 04 năm 2024,
                                    Hà Nội có xuất hiện giông lốc...</p>
                            </div>
                        </div>
                        {/*  */}
                        <div className="grid grid-cols-3 *:rounded-[10px] py-3">
                            <div className="col-span-1">
                                <ul className="">
                                    <li className="">
                                        <Link to="#">
                                            <img src="https://file.hstatic.net/1000075078/article/zalo_01c6f0bfb0854951a16a92b52457ca56_grande.jpg" alt=""
                                                className="rounded-xl h-[160px] object-cover" />
                                        </Link>
                                    </li>
                                </ul>
                            </div>
                            <div className="col-span-2 px-5 text-left w-3/4">
                                <Link to=''>
                                    <h3 className="uppercase text-lg font-semibold pb-1">
                                        “XUÂN LÊN ĐI!”: LỜI CHÚC Ý NGHĨA CHO NĂM THÌN ĐIỀU CHI CŨNG NHƯ Ý
                                    </h3>
                                </Link>
                                <span className="text-left">
                                    <p className="my-1 text-gray-500">
                                        5/25/2024
                                    </p>
                                </span>
                                <p className="text-[15px]">
                                    Mùa xuân đã rộn ràng khắp nơi,
                                    mang theo nguồn sống dào dạt cùng mọi...</p>
                            </div>
                        </div>
                        {/*  */}
                        <div className="grid grid-cols-3 *:rounded-[10px] py-3">
                            <div className="col-span-1">
                                <ul className="">
                                    <li className="">
                                        <Link to="#">
                                            <img src="https://file.hstatic.net/1000075078/article/thecoffeehouse_timesquare_02_b87f7576b02d4d82ba5b7ed4e40b6b00_grande.png" alt=""
                                                className="rounded-xl h-[160px] w-full object-cover" />
                                        </Link>
                                    </li>
                                </ul>
                            </div>
                            <div className="col-span-2 px-5 text-justify w-3/4">
                                <Link to=''>
                                    <h3 className="uppercase text-lg font-semibold pb-1">
                                        LY CÀ PHÊ SỮA ĐÁ VIỆT NAM XUẤT HIỆN Ở QUẢNG TRƯỜNG THỜI ĐẠI NEW YORK
                                    </h3>
                                </Link>
                                <span className="text-left">
                                    <p className="my-1 text-gray-500">
                                        5/25/2024
                                    </p>
                                </span>
                                <p className="text-[15px]">
                                    Ấn tượng và tự hào,
                                    hình ảnh Việt Nam tiếp tục được lên sóng tại...</p>
                            </div>
                        </div>
                        <div>
                            <Link to="#">
                                <h3 className="border-2 w-1/3 mx-auto my-8 py-2 rounded-lg bg-white font-semibold text-[17px]">
                                    Tìm hiểu thêm
                                </h3>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
};

export default AllHomes