import { FaMapMarkerAlt, FaPhoneAlt } from "react-icons/fa";

const Footer: React.FC = () => {
    return (
        <>
            <footer id="footer">
                <div className=" bg-customBlack text-white py-12 text-left text-sm">
                    <div className=" container mx-auto">
                        <div className="row mb-8 grid grid-cols-4 gap-5">
                            <div className="cow">
                                <h4 className="font-bold text-base pb-3">Giới thiệu</h4>
                                <ul className="*:text-xs *:py-2">
                                    <li><a href="">Về chúng tôi</a></li>
                                    <li><a href="">Sản phẩm</a></li>
                                    <li><a href="">khuyến mãi</a></li>
                                    <li><a href="">Chuyện cà phê</a></li>
                                </ul>
                            </div>
                            <div className="cow">
                                <h4 className="font-bold text-base pb-3">Điều khoản</h4>
                                <ul className="*:text-xs *:py-2">
                                    <li className=""><a href="">Điều khoản</a></li>
                                    <li><a href="">Chính sách bảo mật thông tin</a></li>
                                    <li><a href="">Hướng dẫn xuát hóa đơn GTGT</a></li>
                                </ul>
                            </div>
                            <div className="cow *:pb-5">
                                <h4 className="font-bold text-base flex"><div className="mt-1 mr-2"><FaPhoneAlt /></div>Đặt hàng: 1800 1800</h4>
                                <h4 className="font-bold text-base flex"><div className="mt-1 mr-2"><FaMapMarkerAlt /></div>Liên hệ</h4>
                                <p className="text-xs w-40">
                                    Cổng số 1, Tòa nhà FPT Polytechnic, 13 phố Trịnh Văn Bô,
                                    Km12 Cầu Diễn, Phường Phúc Diễn, Quận Bắc Từ Liêm, Hà Nội
                                </p>
                            </div>
                            <div className="cow">
                                {/* <iframe className=""
                                    width="300"
                                    height="150"
                                    src="https://youtu.be/OE57pr7sPE4?si=sw5v14SPVBwUzOXI"
                                    title="YouTube video player"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                    allowFullScreen
                                ></iframe> */}
                                <iframe
                                    width="300"
                                    height="150"
                                    src="https://www.youtube.com/embed/zEWSSod0zTY?si=likpXujK9JxLrOVl" 
                                    title="YouTube video player"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share">

                                </iframe>
                                <div>
                                    <a href="https://www.facebook.com/choe.quy1412/" target="_blank" rel="noopener noreferrer">
                                        <i className="fa-brands fa-square-facebook fa-2xl"></i>
                                    </a>
                                    <a href="">
                                        <i className="fa-brands fa-instagram fa-2xl"></i>
                                    </a>
                                </div>

                            </div>
                        </div>
                        <hr />
                        <div className="row mt-5">
                            <div className="row">
                                <div className="col-lg-9 col-md-9 col-sm-9 col-xs-12 footer_col">
                                    <ul className="footer_itemlists text-xs">
                                        <li>Công ty cổ phần thương mại dịch vụ Trà Cà Phê VN</li>
                                        <li>Mã số DN: 0886847253 do sở kế hoạch và đầu tư tp. Hà Nội cấp ngày 04/09/2022. Người đại diện: TRẦN VĂN QUÝ</li>
                                        <li>Địa chỉ: Tòa nhà FPT Polytechnic, 13 phố Trịnh Văn Bô, phường Phương Canh, quận Nam Từ Liêm, TP Hà Nội &nbsp; Điện thoại: (037) 286 3006 &nbsp; Email: quytv3804@gmail.com</li>
                                        <li>© 2022-2024 Công ty cổ phần thương mại dịch vụ Trà Cà Phê VN mọi quyền bảo lưu</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </footer >
        </>
    )
}

export default Footer;