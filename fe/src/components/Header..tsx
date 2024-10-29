
import { Button, Drawer, Modal } from "flowbite-react";
import { useState } from "react";
import { Link } from "react-router-dom"

const Header: React.FC = () => {
  
    const [isModalOpen, setIsModalOpen] = useState(false);
    const toggleModal = () => {    
        setIsModalOpen(!isModalOpen);
    };  
    const [isOpen, setIsOpen] = useState(false);
    const handleClose = () => setIsOpen(false);
    return (
        <>
            <header className="absolute z-10">
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
                        {/* SEARCH */}
                        <div className="mb:hidden lg:block *:h-[48px] ml-[150px]">
                            <div className="relative flex items-center">
                                <input
                                    type="text"
                                    className="border rounded-full w-[250px] px-6 pr-12 py-1"
                                    placeholder="Search"
                                />
                            </div>
                        </div>
                        <nav aria-label="Global" className="hidden md:block">
                            <div className="flex  text-sm font-semibold" id="main-menu">
                                {/* ICON_USER */}
                                <div className="px-4">
                                    <Link to={"/login"} type="button" className="*:hover:text-[#ea8025] px-6 ">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                                        </svg>
                                    </Link>
                                </div>
                                {/* ICON_CART */}
                                <div className="px-4">
                                    <button className="relative top-[30%] h-[24px] *:hover:text-[#ea8025] *:hover:opacity-80" onClick={() => setIsOpen(true)}>
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5"
                                            stroke="currentColor" className="size-6 w-[24px]">
                                            <path strokeLinecap="round" strokeLinejoin="round"
                                                d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                                        </svg>
                                        <span className="absolute bg-red-500 bottom-3 left-4 rounded-[50%] w-[16px] h-[16px] text-xs text-white">0</span>
                                    </button>
                                </div>
                            </div>
                        </nav>
                    </div>
                </div>
            </header>
            <Drawer open={isOpen} onClose={handleClose} position="right" className="">
                <Drawer.Header title="Cart" />
                <Drawer.Items>
                <div className="flex *:mx-1 items-center border-b-2 pb-2">
                                <div className="w-1/5">
                                    <img src="" alt="Ảnh" className="border rounded-lg p-1" />
                                </div>
                                <div className="w-3/5">
                                    <h3 className="text-base font-semibold">Product</h3>
                                    <span></span>
                                    <p className="text-xs text-red-500 font-semibold">20.000 VNĐ</p>
                                </div>
                                <div>
                                    <span>1</span>
                                </div>
                                <div className="1/5">
                                    <button className="border p-2 rounded-lg bg-gray-200 hover:bg-gray-400" >
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                    <div className="flex gap-2">
                        <Button className="inline-flex w-full rounded-lg px-4 text-center text-sm font-medium text-white 0 focus:outline-none focus:ring-4 focus:ring-cyan-300 dark:bg-cyan-600 ">
                            Checking
                        </Button>
                        <Button onClick={toggleModal} className="inline-flex w-full rounded-lg bg-cyan-700 px-4 text-center text-sm font-medium text-white hover:bg-cyan-800 focus:outline-none focus:ring-4 focus:ring-cyan-300 dark:bg-cyan-600 dark:hover:bg-cyan-700 dark:focus:ring-cyan-800">
                            Thanh Toán
                        </Button>
                    </div>
                    {/* <Modal show={isModalOpen} onClose={toggleModal}>
                        <Modal.Header>
                            <h1 className="text-2xl">
                                Thanh Toán
                            </h1>
                        </Modal.Header>
                        <Modal.Body>
                            <form className="space-y-4" action="#">
                                <div className="grid gap-4 mb-4 grid-cols-2">
                                    <div className="col-span-2 ">
                                        <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                            Address
                                        </label>
                                        <input
                                            type="text"
                                            name="address"
                                            id="text"
                                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                                        />
                                    </div>
                                    <div className="col-span-2 sm:col-span-1">
                                        <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                            Name
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            id="text"
                                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                                        />
                                    </div>
                                    <div className="col-span-2 sm:col-span-1">
                                        <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                            Phone
                                        </label>
                                        <input
                                            type="number"
                                            name="pirce"
                                            id="number"
                                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-4 p-2 rounded-lg border-2 ">
                                    <img src="../src/assets/images/shirt.png" alt="Anh san pham" className="w-[70px] h-[70px] col-span-1" />
                                    <p className="col-span-2">T-Shirt</p>
                                    <span><b className="col-span-1">100.000</b> VND</span>
                                </div>
                            </form>
                            <div className="my-3">
                                <p className="font-medium">Phương thức thanh toán :</p>
                                <div className="my-1">
                                    <input type="radio" name="default-radio" id="" />
                                    <label htmlFor="" className="ms-2 text-gray-900 dark:text-gray-300">Thanh toán khi nhân hàng</label>
                                </div>
                                <div className="mb-4">
                                    <input type="radio" name="default-radio" id="" />
                                    <label htmlFor="" className="ms-2  text-gray-900 dark:text-gray-300">Thanh toán qua momo</label>
                                </div>
                            </div>
                            <Button type="submit" fullSized>
                                Thanh Toán
                            </Button>
                        </Modal.Body>
                    </Modal> */}

                </Drawer.Items>
            </Drawer>
        </>
    )
}

export default Header

