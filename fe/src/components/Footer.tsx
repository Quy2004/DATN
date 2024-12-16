import { FaMapMarkerAlt, FaPhoneAlt } from "react-icons/fa";

const Footer: React.FC = () => {
    return (
        <>
            <footer id="footer">
                <div className="bg-customBlack text-white py-12 text-left text-sm">
                    <div className="containerAll mx-auto px-4 md:px-0">
                        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="col-span-2 md:hidden">
                                <h4 className="font-bold text-sm md:text-base flex items-center pb-2">
                                    <FaPhoneAlt className="mr-2" /> Đặt hàng: 1800 1800
                                </h4>
                                <h4 className="font-bold text-sm md:text-base flex items-center">
                                    <FaMapMarkerAlt className="mr-2" /> Liên hệ
                                </h4>
                                <p className="text-xs md:text-base mt-2">
                                    Cổng số 2, Tòa nhà FPT Polytechnic, 13 phố Trịnh Văn Bô, Km12 Cầu Diễn, Phường Phúc Diễn, Quận Bắc Từ Liêm, Hà Nội
                                </p>
                            </div>
                            <div className="col-span-2 md:hidden">
                                <iframe
                                    width="100%"
                                    height="150"
                                    src="https://www.youtube.com/embed/zEWSSod0zTY?si=likpXujK9JxLrOVl"
                                    title="YouTube video player"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                    className="rounded-md"
                                ></iframe>
                                <div className="flex mt-4 space-x-3">
                                    <a href="https://www.facebook.com/choe.quy1412/" target="_blank" rel="noopener noreferrer">
                                        <i className="fa-brands fa-square-facebook fa-2xl"></i>
                                    </a>
                                    <a href="#">
                                        <i className="fa-brands fa-instagram fa-2xl"></i>
                                    </a>
                                </div>
                            </div>
                            {/* Giới thiệu */}
                            <div>
                                <h4 className="font-bold text-base pb-3">Giới thiệu</h4>
                                <ul className="text-sm space-y-2">
                                    <li><a href="#">Về chúng tôi</a></li>
                                    <li><a href="#">Sản phẩm</a></li>
                                    <li><a href="#">Khuyến mãi</a></li>
                                    <li><a href="#">Chuyện cà phê</a></li>
                                </ul>
                            </div>

                            {/* Điều khoản */}
                            <div>
                                <h4 className="font-bold text-base pb-3">Điều khoản</h4>
                                <ul className="text-sm space-y-2">
                                    <li><a href="#">Điều khoản</a></li>
                                    <li><a href="#">Chính sách bảo mật thông tin</a></li>
                                    <li><a href="#">Hướng dẫn xuất hóa đơn GTGT</a></li>
                                </ul>
                            </div>

                            {/* Đặt hàng */}
                            <div className="hidden md:block">
                                <h4 className="font-bold text-base flex items-center pb-2">
                                    <FaPhoneAlt className="mr-2" /> Đặt hàng: 1800 1800
                                </h4>
                                <h4 className="font-bold text-base flex items-center">
                                    <FaMapMarkerAlt className="mr-2" /> Liên hệ
                                </h4>
                                <p className="text-sm mt-2">
                                    Cổng số 1, Tòa nhà FPT Polytechnic, 13 phố Trịnh Văn Bô, Km12 Cầu Diễn, Phường Phúc Diễn, Quận Bắc Từ Liêm, Hà Nội
                                </p>
                            </div>

                            {/* Video và mạng xã hội */}
                            <div className="hidden md:block">
                                <iframe
                                    width="100%"
                                    height="150"
                                    src="https://www.youtube.com/embed/zEWSSod0zTY?si=likpXujK9JxLrOVl"
                                    title="YouTube video player"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                    className="rounded-md"
                                ></iframe>
                                <div className="flex mt-4 space-x-3">
                                    <a href="https://www.facebook.com/choe.quy1412/" target="_blank" rel="noopener noreferrer">
                                        <i className="fa-brands fa-square-facebook fa-2xl"></i>
                                    </a>
                                    <a href="#">
                                        <i className="fa-brands fa-instagram fa-2xl"></i>
                                    </a>
                                </div>
                            </div>
                        </div>

                        <hr className="my-6" />

                        {/* Thông tin công ty */}
                        <div className="text-xs md:text-sm  md:text-left space-y-2">
                            <p>Công ty cổ phần thương mại dịch vụ Trà Cà Phê VN</p>
                            <p>
                                Mã số DN: 0886847253 do sở kế hoạch và đầu tư TP. Hà Nội cấp ngày 04/09/2022.
                                Người đại diện: TRẦN VĂN QUÝ
                            </p>
                            <p>
                                Địa chỉ: Tòa nhà FPT Polytechnic, 13 phố Trịnh Văn Bô, Phường Phương Canh, Quận Nam Từ Liêm, TP Hà Nội
                                &nbsp; Điện thoại: (037) 286 3006 &nbsp;--- Email: quytv3804@gmail.com
                            </p>
                            <p>© 2022-2024 Công ty cổ phần thương mại dịch vụ Trà Cà Phê VN mọi quyền bảo lưu</p>
                        </div>
                    </div>
                </div>
            </footer>


        </>
    )
}

export default Footer;