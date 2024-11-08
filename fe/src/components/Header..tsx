import { useQuery } from "@tanstack/react-query";
import { Button, Drawer, Modal } from "flowbite-react";
import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import instance from "../services/api";
import { Product } from "../types/product";
import axios from "axios";
import CartItem from "./CartItem";

const Header: React.FC = () => {
	const user = JSON.parse(localStorage.getItem("user") || '');
	const [cart, setCart] = useState<any>([]);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const toggleModal = () => {
		setIsModalOpen(!isModalOpen);
	};
	const [isOpen, setIsOpen] = useState(false);
	const handleClose = () => setIsOpen(false);

	// State cho tìm kiếm
	const [searchTerm, setSearchTerm] = useState<string>("");
	const navigate = useNavigate();

	const updateUrlParams = useCallback(() => {
		const params = new URLSearchParams();

		if (searchTerm) params.set("search", searchTerm);
		navigate({ search: params.toString() }, { replace: true });
	}, [searchTerm]);

	useEffect(() => {
		updateUrlParams();
	}, [searchTerm, updateUrlParams]);

	const { data: products } = useQuery({
		queryKey: ["products", searchTerm],
		queryFn: async () => {
			const response = await instance.get(`products?search=${searchTerm}`);

			return response.data.data;
		},
	});

	const handleSearch = (value: string) => {
		setSearchTerm(value);
	};
	// Hàm để xóa searchTerm
	const clearSearch = () => {
		setSearchTerm("");
	};
	// Định dạng price 
	const formatPrice = (price: number) => {
		return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
	};
	//cart
	const fetchCart = async () => {
		try {
		  const { data } = await instance.get(`/cart/${user._id}`);
		  console.log('CART ->', data);
		   // Gọi API từ backend
		  setCart(data.cart); // Lưu dữ liệu sản phẩm vào state
		  // setLoading(false); // Tắt trạng thái loading
		} catch (error) {
		  console.error("Lỗi khi lấy sản phẩm:", error);
		  // setLoading(false); // Tắt trạng thái loading trong trường hợp lỗi
		}
	  };
	  useEffect(() => {
		  fetchCart();
	  }, []);

	  console.log(cart)
	

	return (
		<>
			<header className="absolute z-10">
				<div className="flex h-16 bg-white bg-opacity-70 max-w items-center justify-evenly gap-8 px-4 sm:px-6 lg:px-8 ">
					<div className=" flex justify-between items-center container mx-auto inner-header ">
						<nav
							aria-label="Global"
							className="hidden md:block"
						>
							<ul
								className="flex items-center text-sm font-semibold"
								id="main-menu"
							>
								<li>
									<Link
										to="/"
										className="bg-none"
									>
										<img
											className="h-16"
											src="/src/assets/images/bg-remove-cf.png"
											alt=""
										/>
									</Link>
								</li>
								<li className="px-6 py-6">
									<Link
										className=""
										to="tea"
									>
										<h3> Trà </h3>
									</Link>
								</li>
								<li className="px-4 py-6">
									<Link to="coffee">
										<h3>Cà Phê</h3>
									</Link>
								</li>

								<li className="px-4 py-6">
									<Link to="/menu">
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
						<div className="mb:hidden lg:block ml-[150px]">
							<div className="relative flex items-center h-[38px] ">
								<input
									type="text"
									className="border rounded-full w-[250px] px-6 pr-12 py-1"
									placeholder="Search"
									value={searchTerm}
									onChange={e => handleSearch(e.target.value)}
								/>
								<span className="text-white absolute end-1 bottom-0.5  focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-3xl text-sm px-2 py-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
									<svg className="w-4 h-4 text-[#000] dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
										<path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
									</svg>
								</span>
							</div>

							{searchTerm && (<div className="max-h-[191px] w-[250px] absolute bg-gray-100 overflow-y-auto px-2 rounded-lg">
								{products?.length ? (
									products.map((product: Product) => (
										<Link to={`detail/${product._id}`} onClick={clearSearch}>
											<div
												key={product._id}
												className="flex items-center border-b-2 hover:bg-gray-200 h-[63px]"
											>
												<img
													src={product.image}
													alt={product.name}
													className="w-14 h-14 rounded-full mr-4 object-cover"
												/>
												<div>
													<h3 className="text-sm font-semibold">
														{product.name}
													</h3>
													<p className="text-gray-700 text-[10px]">{formatPrice(product.price)} VNĐ</p>
												</div>
											</div>
										</Link>
									))
								) : (
									<p>Không tìm thấy</p>
								)}
							</div>
							)}
						</div>

						<nav
							aria-label="Global"
							className="hidden md:block"
						>
							<div
								className="flex  text-sm font-semibold"
								id="main-menu"
							>
								<div className="px-4">
									<Link
										to={"/login"}
										type="button"
										className="*:hover:text-[#ea8025] px-6 "
									>
										<svg
											xmlns="http://www.w3.org/2000/svg"
											fill="none"
											viewBox="0 0 24 24"
											strokeWidth={1.5}
											stroke="currentColor"
											className="size-6"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
											/>
										</svg>
									</Link>
								</div>
								<div className="px-4">
									<button
										className="relative top-[30%] h-[24px] *:hover:text-[#ea8025] *:hover:opacity-80"
										onClick={() => setIsOpen(true)}
									>
										<svg
											xmlns="http://www.w3.org/2000/svg"
											fill="none"
											viewBox="0 0 24 24"
											strokeWidth="1.5"
											stroke="currentColor"
											className="size-6 w-[24px]"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
											/>
										</svg>
										<span className="absolute bg-red-500 bottom-3 left-4 rounded-[50%] w-[16px] h-[16px] text-xs text-white">
											{cart?.length}
										</span>
									</button>
								</div>
							</div>
						</nav>
					</div>
				</div>
			</header>
			<Drawer
				open={isOpen}
				onClose={handleClose}
				position="right"
				className=""
			>
				<Drawer.Header title="Cart" />
				<Drawer.Items>
					
					{cart?.map((item : any)=>(
						<CartItem item={item?.product} quantity={item.quantity
						} />
					))}
						
					<div className="flex gap-2">
						<Button className="inline-flex w-full rounded-lg px-4 text-center text-sm font-medium text-white 0 focus:outline-none focus:ring-4 focus:ring-cyan-300 dark:bg-cyan-600 ">
							Checking
						</Button>
						<Button
							onClick={toggleModal}
							className="inline-flex w-full rounded-lg bg-cyan-700 px-4 text-center text-sm font-medium text-white hover:bg-cyan-800 focus:outline-none focus:ring-4 focus:ring-cyan-300 dark:bg-cyan-600 dark:hover:bg-cyan-700 dark:focus:ring-cyan-800"
						>
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
	);
};

export default Header;
