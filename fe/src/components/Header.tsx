import { useQuery } from "@tanstack/react-query";
import { Button, Drawer } from "flowbite-react";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import instance from "../services/api";
import { Product } from "../types/product";
import CartItem from "./CartItem";
import { useClickOutside } from "./ClickOutSide";

const Header: React.FC = () => {
	const storedUser = localStorage.getItem("user");
	const user = storedUser ? JSON.parse(storedUser!) : {};
	const [cart, setCart] = useState<any>([]);
	const [idCart, setIdCart] = useState<number>()
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const toggleMenu = () => {
		setIsMenuOpen(!isMenuOpen);
		console.log(isMenuOpen);
	};
	const toggleModal = () => {
		setIsModalOpen(!isModalOpen);
	};
	const [isOpen, setIsOpen] = useState(false);
	const [isOpenMenu, setIsOpenMenu] = useState(false);
	const handleClose = () => setIsOpen(false);
	const handleCloseMenu = () => setIsOpenMenu(false);
	useEffect(() => {
		if (isOpenMenu) {
			document.body.classList.add("no-scroll"); // Thêm lớp no-scroll
		} else {
			document.body.classList.remove("no-scroll"); // Xóa lớp no-scroll
		}
		return () => {
			document.body.classList.remove("no-scroll"); // Dọn dẹp khi component unmount
		};
	}, [isOpenMenu]);
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
	const { data: cartData, refetch: refetchCart } = useQuery({
		queryKey: ["cart", user._id],
		queryFn: async () => {
			const { data } = await instance.get(`/cart/${user._id}`);
			return data;
		},
		enabled: !!user._id,
		refetchInterval: 800,
		refetchOnWindowFocus: true,
	});
	// const [isLoggedIn, setIsLoggedIn] = useState(false);
	const [userName, setUserName] = useState<string>("");
	const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
	useEffect(() => {
		const storedUser = localStorage.getItem("user");
		if (storedUser) {
			const user = JSON.parse(storedUser);
			setUserName(user.userName || "");
			setAvatarUrl(user.avatarUrl || null);
		} else {
			setUserName("");
			setAvatarUrl(null); 
		}
	}, []);
	const getInitials = (name: string) => (name ? name[0].toUpperCase() : "")
	const { isDropdownOpen, setIsDropdownOpen, dropdownRef } = useClickOutside(false);

	const toggleDropdown = () => {
		setIsDropdownOpen(!isDropdownOpen);
	};

	const handleLogout = () => {
		localStorage.removeItem("user");
		localStorage.removeItem("token");
		setUserName(''); // Đặt lại trạng thái userName
		toast.success("Đã đăng xuất thành công!", { duration: 2000 });
		navigate("/login");
	};

	const cartItems =
		cartData?.cart?.filter((item: any) => !item.isDeleted) || [];
	return (
		<>
			<header className="absolute z-10 w-full">
				<div className="flex h-16 container bg-white sm:justify-evenly md:justify-between items-center mx-auto px-4 sm:px-6 lg:px-8">
					{/* Hamburger Menu - Hiển thị khi màn hình nhỏ */}
					<button
						onClick={() => setIsOpenMenu(true)}
						className="block md:hidden text-black focus:outline-none"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							strokeWidth="1.5"
							stroke="currentColor"
							className="w-6 h-6"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M3.75 5.25h16.5m-16.5 7.5h16.5m-16.5 7.5h16.5"
							/>
						</svg>
					</button>

					{/* Logo - Center */}
					<div className="flex-grow md:flex-grow-0 flex justify-center items-center">
						<Link to="/">
							<img
								className="h-12 mx-auto"
								src="/src/assets/images/bg-remove-cf.png"
								alt="Logo"
							/>
						</Link>
					</div>
					<nav className="hidden md:flex items-center text-sm font-semibold ">
						<ul className="flex items-center *:py-5 *:px-5">
							<li>
								<Link className="hover:text-gray-700" to="/tea">
									Trà
								</Link>
							</li>
							<li>
								<Link className="hover:text-gray-700" to="/coffee">
									Cà Phê
								</Link>
							</li>
							<li>
								<Link className="hover:text-gray-700" to="/menu">
									Menu
								</Link>
							</li>
							<li>
								<Link className="hover:text-gray-700" to="/chuyennha">
									Chuyện Nhà
								</Link>
							</li>
						</ul>
					</nav>
					<div className="hidden mb:hidden lg:block ml-[150px]">
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
							className="ư flex items-center text-sm font-semibold"
							id="main-menu"
						>
							{/* User */}
							{
								userName ? (
									<div ref={dropdownRef}
										className="flex items-center gap-x-1 relative">
										<button
											id="dropdownDefaultButton"
											onClick={toggleDropdown}
											className="text-[#000] font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center "
											type="button"
										>
											<h3>{userName}</h3>
										</button>
										{isDropdownOpen && (
											<div className="z-10 bg-white divide-y divide-gray-100 rounded-lg shadow w-48 dark:bg-gray-700 absolute top-full mt-4">
												<ul className="py-2 text-sm text-gray-600 dark:text-gray-200" aria-labelledby="dropdownDefaultButton">
													<li>
														<Link to="account-update" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">
															Cập nhật tài khoản
														</Link>
													</li>

													<li>
														<Link to="tracking" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">
															Theo dôi đơn hàng
														</Link>
													</li>
													<li>
														<Link to="oder-history" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">
															<h3>
																Xem lịch sử mua hàng
															</h3>
														</Link>
													</li>
													<li>
														<button className="w-max px-4 py-2 " onClick={handleLogout}>
															<h3 className="font-bold">
																Đăng xuất
															</h3>
														</button>
													</li>
												</ul>
											</div>
										)}
									</div>
								) : (
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
								)
							}
							{/* Cart */}
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
									<span className="absolute bg-red-500 bottom-3 left-4 rounded-[50%] w-[16px] h-[16px] text-xs text-white flex items-center justify-center">
										{cartItems?.length ? cartItems.length : 0}
									</span>

								</button>
							</div>
						</div>
					</nav>
				</div>
			</header>
			<Drawer
				open={isOpenMenu}
				onClose={handleCloseMenu}
				position="left"
				className="fixed max-w-[270px] px-0 z-50 h-full"
			>
				{/* <Drawer.Header title="" className="border-b-2 px-4" /> */}
				<Drawer.Items>
					<nav className="py-6 border-b-2 ">
					<Link to={"setting"} className="absolute top-3 flex items-center space-x-3 mx-6">
							{
								userName && (
									<div className="flex items-center space-x-3">
										{avatarUrl ? (
											<img
												src={avatarUrl}
												alt={userName}
												className="w-11 h-11 rounded-full object-cover"
											/>
										) : (
											<span
												className="w-10 h-10 text-lg bg-[#ea8025] flex items-center justify-center rounded-full font-semibold text-[#fff] border-2 "
											>
												{getInitials(userName)}
											</span>
										)}
										<h3 className="font-semibold text-[#ea8025]">{userName}</h3>
									</div>
								)
							}
						</Link>
						<button
							onClick={handleCloseMenu}
							className="absolute right-5 top-8 transform -translate-y-1/2 text-black focus:outline-none"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								strokeWidth="1.5"
								stroke="currentColor"
								className="w-7 h-auto"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d="M6 18L18 6M6 6l12 12"
								/>
							</svg>
						</button>
					</nav>
					<nav className=" flex flex-col items-start ml-6 space-y-1 *:w-[92.5%]  *:py-4 ">
						<Link to="/tea" className="block text-lg font-semibold border-b-2 " onClick={toggleMenu}>
							<h3>Trà</h3>
						</Link>
						<Link to="/coffee" className="block text-lg font-semibold border-b-2" onClick={toggleMenu}>
							<h3>Cà Phê</h3>
						</Link>
						<Link to="/menu" className="block text-lg font-semibold border-b-2" onClick={toggleMenu}>
							<h3>Menu </h3>
						</Link>
						<Link to="/chuyennha" className="block text-lg font-semibold border-b-2" onClick={toggleMenu}>
							<h3>Chuyện Nhà </h3>
						</Link>
						{
							userName ? (
								<nav className="flex justify-center">
									<Link to={"cart"} className="p-2 rounded-full border-gray-400 border-2">
										<svg
											xmlns="http://www.w3.org/2000/svg"
											fill="none"
											viewBox="0 0 24 24"
											strokeWidth="1.5"
											stroke="currentColor"
											className="w-6 h-atuo text-gray-700"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
											/>
										</svg>
										<span className="absolute bg-red-500 top-[367px] left-[39%] rounded-[50%] w-[16px] h-[16px] text-xs text-white flex items-center justify-center">
											{cartItems?.length ? cartItems.length : 0}
										</span>
									</Link>
									<div className="px-2"></div>
									<button onClick={handleLogout}
										className="p-2 rounded-full border-gray-400 border-2">
										<svg xmlns="http://www.w3.org/2000/svg"
											fill="none" viewBox="0 0 24 24"
											strokeWidth="1.5" stroke="currentColor"
											className="w-7 h-auto text-gray-700">
											<path strokeLinecap="round"
												strokeLinejoin="round"
												d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15M12 9l3 3m0 0-3 3m3-3H2.25" />
										</svg>
									</button>
								</nav>
							) : (
								<Link to="/login" className="text-lg font-semibold" onClick={toggleMenu}>
									<h3>Tài Khoản </h3>
								</Link>
							)
						}
					</nav>
					
					<div className="flex justify-center mb:hidden mt-4">
						<div className="relative flex items-center  ">
							<input
								type="text"
								className="border rounded-full max-w-[333px] px-6 py-3"
								placeholder="Search"
								value={searchTerm}
								onChange={e => handleSearch(e.target.value)}
							/>
						</div>
						{searchTerm && (<div className="w-full absolute mt-14 bg-gray-100 overflow-y-auto px-2 rounded-lg">
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

				</Drawer.Items>
			</Drawer>
			{/* Cart */}
			<Drawer open={isOpen} onClose={handleClose} position="right">
				<Drawer.Header title="Cart" />
				<Drawer.Items>
					{cartItems.map((item: any) => (
						<CartItem
							key={item._id}
							item={item?.product}
							idcart={cartData?.cart_id}
							quantity={item.quantity}
							onUpdate={refetchCart}
						/>
					))}

					<div className="flex gap-2">
						<Link to={"cart"}>
							<Button className="flex w-[300px] rounded-lg px-4 text-center text-sm font-medium text-white 0 focus:outline-none focus:ring-4 focus:ring-cyan-300 dark:bg-cyan-600">
								Checking
							</Button>
						</Link>
						{/* <Button
							onClick={toggleModal}
							className="inline-flex w-full rounded-lg bg-cyan-700 px-4 text-center text-sm font-medium text-white hover:bg-cyan-800 focus:outline-none focus:ring-4 focus:ring-cyan-300 dark:bg-cyan-600 dark:hover:bg-cyan-700 dark:focus:ring-cyan-800"
						>
							Thanh Toán
						</Button> */}
					</div>
				</Drawer.Items>
			</Drawer>

		</>
	);
};

export default Header;