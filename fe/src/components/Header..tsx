import { Link } from "react-router-dom"

const Header: React.FC = () => {
    return (
            <div className="flex h-16 bg-white bg-opacity-70 max-w items-center justify-evenly gap-8 px-4 sm:px-6 lg:px-8 ">
                <div className=" flex justify-normal container mx-auto inner-header ">
                    <div>
                        <ul>
                            <li>
                                <Link to="/" className="bg-none">
                                    <img className="h-16" src="/src/assets/images/bg-remove-cf.png" alt="" />
                                </Link>
                            </li>
                        </ul>
                    </div>
                    <nav aria-label="Global" className="hidden md:block">
                        <ul className="flex items-center text-sm font-semibold" id="main-menu">
                            <li className="px-6 py-6">
                                <Link className="" to="tea" >
                                    <h3> Trà </h3>
                                </Link>
                            </li>
                            <li className="px-4 py-6">
                                <Link to="coffee">
                                    <h3>Cà Phê</h3>
                                </Link>
                            </li>

                            <li className="px-4 py-6">
                                <Link to="/menu" >
                                    <h3>Menu</h3>
                                </Link>
                            </li>

                            <li className="px-4 py-6">
                                <Link to="/chuyennha">
                                    <h3>Chuyện nhà</h3>
                                </Link>
                            </li>

                            <li className="px-4 py-6">
                                <Link to="/signin">
                                    <h3>Tài Khoản</h3>
                                </Link>
                            </li>
                        </ul>
                    </nav>
                </div>
            </div>
    )
}

export default Header

