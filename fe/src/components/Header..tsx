import { Link } from "react-router-dom"

const Header: React.FC = () => {
    return (
        <div className="flex h-16 bg-white bg-opacity-70 max-w items-center justify-evenly gap-8 px-4 sm:px-6 lg:px-8 ">
            <div className=" flex justify-between items-center container mx-auto inner-header ">
                <nav aria-label="Global" className="hidden md:block">
                    <ul className="flex items-center text-sm font-semibold" id="main-menu">
                        <li>
                            <Link to="/" className="bg-none">
                                <img className="h-16" src="/src/assets/images/bg-remove-cf.png" alt="" />
                            </Link>
                        </li>
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
                    </ul>
                </nav>
                <div className="mb:hidden lg:block *:h-[48px] ml-[150px]">
                    <div className="relative flex items-center">
                        <input
                            type="text"
                            className="border rounded-full w-[250px] px-6 pr-12 py-1"
                            placeholder="Search"
                        />
                        <button className="absolute right-0 mr-3 bg-[#17af26] rounded-full p-1.5">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5"
                                stroke="currentColor" className="h-4 w-4 text-white">
                                <path strokeLinecap="round" strokeLinejoin="round"
                                    d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                            </svg>
                        </button>
                    </div>
                </div>
                <nav aria-label="Global" className="hidden md:block">
                    <div className="flex  text-sm font-semibold" id="main-menu">
                        <div className="px-4">
                            <button type="button" className=" px-6 border-r-2 border-[#]">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                                    </svg>
                             </button>
                        </div>
                        <div className="px-4">
                            <button>
                                
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                                    </svg>
                               
                            </button>
                        </div>
                    </div>
                </nav>

            </div>
        </div>
    )
}

export default Header

