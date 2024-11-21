import { Link } from "react-router-dom"
const Homes: React.FC = () => {
    return (
        <div className="bg-orange-50 md:pt-12 md:pb-36">
            <div className="containerAll mx-auto">
                {/* COFFEEHOLIC */}
                <h1 className="text-3xl text-center md:text-left font-semibold pt-8 md:pt-0">Chuyện Nhà</h1>
                <div className="mx-4 md:mx-0">
                    <h2 className="border-l-[6px] text-left text-2xl font-semibold px-3 py-0.5 mb-5 mt-10 border-l-orange-400">Coffeholic</h2>
                    <div className="row grid grid-cols-1  md:grid-cols-3 gap-5 ">
                        <div className="cow *:truncate *:rounded-[10px]">
                            <ul className="img_homes">
                                <li className="">
                                    <Link to="#">
                                        <img src="https://file.hstatic.net/1000075078/article/thecoffeehouse_caphehighlight01_de40c0102a954c50a328f7befcdd82bd_master.jpg" alt=""
                                            className="hover:scale-110 ease-in-out duration-300 object-cover" />
                                    </Link>
                                </li>
                            </ul>
                            <nav className="mx-3 md:mx-0">
                                <span className="text-left">
                                    <p className="my-2 text-gray-500">
                                        5/25/2024
                                    </p>
                                </span>
                                <Link to=''>
                                    <h3 className="uppercase truncate text-[17px] font-semibold pb-1">bắt gặp sài gòn xưa trong món uống hiện đại của giới trẻ</h3>
                                </Link>
                                <p className="text-[15px]">Dẫu qua bao nhiêu lớp sóng thời gian,
                                    người ta vẫn có thể tìm lại những dấu ấn thăng trầm của một Sài Gòn xưa cũ.
                                    Trên những góc phố, trong các bức ảnh, trong vô số tác phẩm văn chương...
                                    và dĩ nhiên trong cả thiên đường ẩm thực phong phú.
                                    Món ăn đường phố Sài Gòn nức tiếng qua bao nhiêu thế hệ,
                                    trong đó có một món tưởng bình dị nhưng lại là “kho báu” của tuổi thơ,
                                    và là cảm hứng cho các tín đồ ăn uống.</p>
                            </nav>
                        </div>
                        <div className="cow *:truncate *:rounded-[10px]">
                            <ul className="img_homes">
                                <li>
                                    <Link to="#">
                                        <img src="https://file.hstatic.net/1000075078/article/1200x630_0b0081d93ba6479b934e04e71cbfd102_grande.jpg" alt=""
                                            className="hover:scale-110 ease-in-out duration-300 object-cover" />
                                    </Link>
                                </li>
                            </ul>
                            <nav className="mx-3 md:mx-0">
                                <span>
                                    <p className="my-2 text-left text-gray-500">
                                        30/10/2023
                                    </p>
                                </span>
                                <Link to=''>
                                    <h3 className="uppercase truncate text-[17px] font-semibold pb-1">
                                        CHỈ CHỌN CÀ PHÊ MỖI SÁNG NHƯNG CŨNG KHIẾN CUỘC SỐNG CỦA BẠN THÊM THÚ VỊ, TẠI SAO KHÔNG?
                                    </h3>
                                </Link>
                                <p className="text-[15px]">
                                    Thực chất, bạn không nhất thiết phải làm gì to tát để tạo nên một ngày rực rỡ.
                                    Chỉ cần bắt đầu từ những việc nhỏ nhặt nhất,
                                    khi bạn đứng trước quầy cà phê mỗi sáng,
                                    mạnh dạn thử một thức uống mới mẻ và phá cách.
                                </p>
                            </nav>
                        </div>
                        <div className="cow *:truncate *:rounded-[10px]">
                            <ul className="img_homes">
                                <li>
                                    <Link to="#">
                                        <img src="https://file.hstatic.net/1000075078/article/3__1__2b67342f4db64bb082944cf078afd910_grande.jpg" alt=""
                                            className="hover:scale-110 ease-in-out duration-300 object-cover" />
                                    </Link>
                                </li>
                            </ul>
                            <nav className="mx-3 md:mx-0">
                            <span>
                                <p className="text-left my-2 text-gray-500">
                                    30/2/2024
                                </p>
                            </span>
                            <Link to=''>
                                <h3 className="uppercase truncate text-[17px] font-semibold pb-1">
                                    SIGNATURE - BIỂU TƯỢNG VĂN HOÁ CÀ PHÊ CỦA THE COFFEE HOUSE ĐÃ QUAY TRỞ LẠI
                                </h3>
                            </Link>
                            <p className="text-[15px]">
                                Mới đây, các "tín đồ" cà phê đang bàn tán xôn xao về SIGNATURE
                                - Biểu tượng văn hóa cà phê của The Coffee House đã quay trở lại.
                            </p>
                            </nav>
                        </div>
                    </div>
                </div>

                {/* TEAHOLIC */}
                <div className="mx-4 md:mx-0">
                    <h3 className="border-l-[6px] text-left text-2xl font-semibold px-3 py-0.5 mb-5 mt-10 border-l-orange-400">Techolic</h3>
                    <div className="row grid grid-cols-1  md:grid-cols-3 gap-5 ">
                        <div className="cow *:truncate *:rounded-[10px]">
                            <ul className="img_homes">
                                <li>
                                    <a href="">
                                        <img src="https://file.hstatic.net/1000075078/article/an_banh_uong_nuoc_nhom_03_d499c0cab14746588fff6fe0dee678ad_grande.jpg" alt=""
                                            className="hover:scale-110 ease-in-out duration-300 object-cover" />
                                    </a>
                                </li>
                            </ul>
                            <nav className="mx-3 md:mx-0">
                            <span>
                                <p className="text-left my-2 text-gray-500">
                                    30/2/2024
                                </p>
                            </span>
                            <Link to=''>
                                <h3 className="uppercase truncate text-[17px] font-semibold pb-1">
                                    TRUNG THU NÀY, SAO BẠN KHÔNG TỰ CHO MÌNH "DỪNG MỘT CHÚT THÔI,
                                    THƯỞNG MỘT CHÚT TRÔI"?
                                </h3>
                            </Link>
                            <p className="text-[15px]">
                                Bạn có từng nghe: “Trung thu thôi mà,
                                có gì đâu mà chơi”, hay “Trung thu càng ngày càng chán”...?
                                Sự bận rộn đến mức “điên rồ” đã khiến chúng ta dần quên đi:
                                bản thân mỗi người cũng đã từng háo hức mỗi khi Trung thu đến.
                                Vậy thì mùa trăng năm nay, sao không thử “dừng một chút thôi”,
                                vì chúng ta đều xứng đáng tự thương mình, và tự “thưởng một chút trôi”.
                            </p>
                            </nav>
                        </div>
                        <div className="cow *:truncate *:rounded-[10px]">
                            <ul className="img_homes">
                                <li className="">
                                    <a href="">
                                        <img src="https://file.hstatic.net/1000075078/article/cautoankeothom_thecoffeehouse_03_29cd435c9a574e1a867ac36f2c863bb6_grande.jpg" alt=""
                                            className="hover:scale-110 ease-in-out duration-300 object-cover" />
                                    </a>
                                </li>
                            </ul>
                            <nav className="mx-3 md:mx-0">
                            <span>
                                <p className="text-left my-2 text-gray-500">
                                    30/2/2024
                                </p>
                            </span>
                            <Link to=''>
                                <h3 className="uppercase truncate text-[17px] font-semibold pb-1">
                                    BỘ SƯU TẬP CẦU TOÀN KÈO THƠM:
                                    "VÍA" MAY MẮN KHÔNG THỂ BỎ LỠ TẾT NÀY
                                </h3>
                            </Link>
                            <p className="text-[15px]">
                                Tết nay vẫn giống Tết xưa,
                                không hề mai một nét văn hoá truyền thống
                                mà còn thêm vào những hoạt động “xin vía” hiện đại, trẻ trung.
                                Ví như giới trẻ đang lên lịch ghé The Coffee House
                                - “địa điểm xin vía mới nổi” để vừa thưởng thức bộ sưu tập
                                thức uống dành riêng cho Tết vừa mong năm mới Cầu Toàn Kèo Thơm.
                            </p>
                            </nav>
                        </div>
                        <div className="cow *:truncate *:rounded-[10px]">
                            <ul className="img_homes">
                                <li>
                                    <Link to="#">
                                        <img src="https://file.hstatic.net/1000075078/article/dscf0216_2890bcca44ae49aaaf843d5fa3db2fc6_grande.jpg" alt=""
                                            className="hover:scale-110 ease-in-out duration-300 object-cover" />
                                    </Link>
                                </li>
                            </ul>
                            <nav className="mx-2 md:mx-0">
                            <span>
                                <p className="text-left my-2 text-gray-500">
                                    30/2/2024
                                </p>
                            </span>
                            <Link to=''>
                                <h3 className="uppercase truncate text-[17px] font-semibold pb-1">
                                    “KHUẤY ĐỂ THẤY TRĂNG" - KHUẤY LÊN NIỀM HẠNH PHÚC:
                                    TRẢI NGHIỆM KHÔNG THỂ BỎ LỠ MÙA TRUNG THU NÀY
                                </h3>
                            </Link>
                            <p className="text-[15px]">
                                Năm 2022 là năm đề cao sức khỏe tinh thần
                                nên giới trẻ muốn tận hưởng một Trung thu với nhiều trải nghiệm mới mẻ,
                                rôm rả cùng bạn bè và người thân. Và trải nghiệm độc đáo
                                “Khuấy để thấy trăng” của The Coffee House
                                như khuấy lên niềm hạnh phúc, nao nức về một trung thu
                                đầy thú vị mà không người trẻ nào muốn bỏ lỡ.
                            </p>
                            </nav>
                        </div>
                    </div>
                </div>

                {/* BLOG */}
                <div className="mx-4 pb-8 md:mx-0 ">
                    <h2 className="border-l-[6px] text-left text-2xl font-semibold px-3 py-0.5 mb-5 mt-10 border-l-orange-400">Blog</h2>
                    <div className="row grid grid-cols-1  md:grid-cols-3 gap-5 ">
                        <div className="cow *:truncate *:rounded-[10px]">
                            <ul className="img_homes">
                                <li>
                                    <Link to="#">
                                        <img src="https://file.hstatic.net/1000075078/article/post-tcbc_f_2e456821ebac42398b294f9356fe30a0_grande.jpg" alt=""
                                            className="hover:scale-110 ease-in-out duration-300 object-cover" />
                                    </Link>
                                </li>
                            </ul>
                            <nav className="mx-2 md:mx-0">
                            <span>
                                <p className="text-left my-2 text-gray-500">
                                    30/2/2024
                                </p>
                            </span>
                            <Link to=''>
                                <h3 className="uppercase truncate text-[17px] font-semibold pb-1">
                                    THE COFFEE HOUSE PHẢN HỒI VỀ SỰ CỐ VỠ KÍNH
                                    DO GIÔNG LỐC TẠI CỬA HÀNG THE COFFEE HOUSE THÁI HÀ, HÀ NỘI
                                </h3>
                            </Link>
                            <p className="text-[15px]">
                                Vào tối ngày 20 tháng 04 năm 2024,
                                Hà Nội có xuất hiện giông lốc kèm mưa đá,
                                gây vỡ kính tại toà nhà Việt Tower - 01 Thái Hà,
                                nơi The Coffee House (TCH) thuê mở địa điểm kinh doanh.
                                Sự cố thiên tai này đã khiến một số khách hàng
                                và nhân viên bị thương ở các mức độ khác nhau.
                                Ngay khi sự cố xảy ra, TCH đã ngay lập tức đưa người bị thương vào viện chữa trị.
                                Đồng thời tích cực phối hợp với các cơ quan chức năng
                                & BQL tòa nhà Việt Tower (bên cho thuê và vận hành tòa nhà)
                                xác định thiệt hại và đề xuất phương án hỗ trợ.
                            </p>
                            </nav>
                        </div>
                        <div className="cow *:truncate *:rounded-[10px]">
                            <ul className="img_homes">
                                <li>
                                    <Link to="#">
                                        <img src="https://file.hstatic.net/1000075078/article/zalo_01c6f0bfb0854951a16a92b52457ca56_grande.jpg" alt=""
                                            className="hover:scale-110 ease-in-out duration-300 object-cover" />
                                    </Link>
                                </li>
                            </ul>
                            <nav className="mx-3 md:mx-0">
                            <span>
                                <p className="text-left my-2 text-gray-500">
                                    30/2/2024
                                </p>
                            </span>
                            <Link to=''>
                                <h3 className="uppercase truncate text-[17px] font-semibold pb-1">
                                    “XUÂN LÊN ĐI!”: LỜI CHÚC Ý NGHĨA CHO NĂM THÌN ĐIỀU CHI CŨNG NHƯ Ý
                                </h3>
                            </Link>
                            <p className="text-[15px]">
                                Mùa xuân đã rộn ràng khắp nơi,
                                mang theo nguồn sống dào dạt cùng mọi ước nguyện may mắn.
                                Bạn cầu mong gì cho mình và người thân trong những chiếc lộc
                                trao tay đón xuân mới?
                            </p>
                            </nav>
                        </div>
                        <div className="cow *:truncate *:rounded-[10px]">
                            <ul className="img_homes">
                                <li>
                                    <Link to="#">
                                        <img src="https://file.hstatic.net/1000075078/article/thecoffeehouse_timesquare_02_b87f7576b02d4d82ba5b7ed4e40b6b00_grande.png" alt=""
                                            className="hover:scale-110 ease-in-out duration-300 object-cover" />
                                    </Link>
                                </li>
                            </ul>
                            <nav className="mx-3 md:mx-0">
                            <span>
                                <p className="text-left my-2 text-gray-500">
                                    30/2/2024
                                </p>
                            </span>
                            <Link to=''>
                                <h3 className="uppercase truncate text-[17px] font-semibold pb-1">
                                    LY CÀ PHÊ SỮA ĐÁ VIỆT NAM XUẤT HIỆN Ở QUẢNG TRƯỜNG THỜI ĐẠI NEW YORK
                                </h3>
                            </Link>
                            <p className="text-[15px]">
                                Ấn tượng và tự hào, hình ảnh Việt Nam tiếp tục được lên sóng tại
                                Quảng trường Thời Đại (New York) với ly cà phê sữa đá quen thuộc,
                                đi cùng thương hiệu The Coffee House.
                            </p>
                            </nav>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Homes