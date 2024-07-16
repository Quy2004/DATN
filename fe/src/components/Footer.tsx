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
                                <h4 className="font-bold text-base">Đặt hàng: 1800 1800</h4>
                                <h4 className="font-bold text-base">Liên hệ</h4>
                                <p className="text-xs w-40">
                                    Tầng 3-4 Hub Building
                                    195/10E Điện Biên Phủ, P.15,
                                    Q.Bình Thạnh, TP.Hồ Chí Minh
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
                                    src="https://www.youtube.com/embed/OE57pr7sPE4?si=sw5v14SPVBwUzOXI"
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
                                        <li>Mã số DN: 0312867172 do sở kế hoạch và đầu tư tp. HCM cấp ngày 23/07/2014. Người đại diện: NGÔ NGUYÊN KHA</li>
                                        <li>Địa chỉ: 86-88 Cao Thắng, phường 04, quận 3, tp Hồ Chí Minh &nbsp; Điện thoại: (028) 7107 8079 &nbsp; Email: hi@thecoffeehouse.vn</li>
                                        <li>© 2014-2022 Công ty cổ phần thương mại dịch vụ Trà Cà Phê VN mọi quyền bảo lưu</li>
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