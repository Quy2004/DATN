import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";

import { Order } from "../../types/order";
import React from "react";
import instance from "../../services/api";
import { useQuery } from "@tanstack/react-query";
import { Alert, Spin } from "antd";
const formatDateTime = (date: string) => {
	const dateObj = new Date(date);

	const hours = dateObj.getHours().toString().padStart(2, "0");
	const minutes = dateObj.getMinutes().toString().padStart(2, "0");

	const day = dateObj.getDate().toString().padStart(2, "0");
	const month = (dateObj.getMonth() + 1).toString().padStart(2, "0");
	const year = dateObj.getFullYear();

	return `${hours}:${minutes} ${day}-${month}-${year}`;
};

const Tracking = () => {
	const { id } = useParams<{ id: string }>();
	const [error, setError] = useState(false);
	const {
		data: order,
		isLoading,
		isError,
	} = useQuery<Order>({
		queryKey: ["orders", id],
		queryFn: async () => {
			const response = await instance.get(`orders/order/${id}`);
			return response.data.data;
		},
		staleTime: 60000,
	});

	if (isLoading) {
		return (
			<div className="flex justify-center items-center h-screen">
				<Spin tip="Đang tải..." />
			</div>
		);
	}

	if (error || !order || isError) {
		return (
			<div className="flex flex-col items-center">
				<Alert
					message="Lỗi"
					description="Đã có lỗi xảy ra. Vui lòng thử lại."
					type="error"
					showIcon
					className="mb-4"
				/>
				<Link
					to="/order-history"
					className="text-blue-600 hover:underline"
				>
					Quay lại lịch sử đơn hàng
				</Link>
			</div>
		);
	}

	if (!order) {
		return (
			<div className="flex flex-col items-center">
				<Alert
					message="Lỗi"
					description="Đã có lỗi xảy ra vui lòng thử lại"
					type="error"
					showIcon
					className="mb-4"
				/>
			</div>
		);
	}
	const getStatusString = (status: string): string => {
		switch (status) {
			case "pending":
				return "Chờ xác nhận";
			case "confirmed":
				return "Đã xác nhận";
			case "shipping":
				return "Đang giao hàng";
			case "delivered":
				return "Đã giao hàng";
			case "completed":
				return "Hoàn thành";
			case "canceled":
				return "Đã hủy";
			default:
				return "Trạng thái không xác định";
		}
	};

	const statusSteps = [
		{
			key: "pending",
			label: "Chờ Xác Nhận",
			icon: (active: string) => (
				<svg
					className={`w-8 h-8 ${active ? "text-green-500" : "text-gray-300"}`}
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
					/>
				</svg>
			),
		},
		{
			key: "confirmed",
			label: "Đã Xác Nhận",
			icon: (active: string) => (
				<svg
					className={`w-8 h-8 ${active ? "text-green-500" : "text-gray-300"}`}
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
					/>
				</svg>
			),
		},
		{
			key: "shipping",
			label: "Đang Giao Hàng",
			icon: (active: string) => (
				<svg
					className={`w-8 h-8 ${active ? "text-green-500" : "text-gray-300"}`}
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"
					/>
				</svg>
			),
		},
		{
			key: "delivered",
			label: "Đã Giao Hàng",
			icon: (active: string) => (
				<svg
					className={`w-8 h-8 ${active ? "text-green-500" : "text-gray-300"}`}
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
					/>
				</svg>
			),
		},
		{
			key: "completed",
			label: "Hoàn Thành",
			icon: (active: string) => (
				<svg
					className={`w-8 h-8 ${active ? "text-green-500" : "text-gray-300"}`}
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
					/>
				</svg>
			),
		},
		{
			key: "canceled",
			label: "Đã Hủy",
			icon: (active: string) => (
				<svg
					className={`w-8 h-8 ${active ? "text-red-500" : "text-gray-300"}`}
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
					/>
				</svg>
			),
		},
	];

	const getActiveStatuses = (currentStatus: string) => {
		const statusOrder = [
			"pending",
			"confirmed",
			"shipping",
			"delivered",
			"completed",
			"canceled",
		];
		const currentStatusIndex = statusOrder.indexOf(currentStatus);

		return statusSteps.map((step, index) => index <= currentStatusIndex);
	};

	const filteredStatusSteps =
		order?.orderStatus === "canceled"
			? statusSteps.filter(step => step.key === "canceled")
			: statusSteps.filter(step => step.key !== "canceled");

	const activeStatuses = getActiveStatuses(order?.orderStatus);
	if (order?.orderStatus === "canceled") {
		return (
			<div className="min-h-screen bg-gray-50 pt-16 ">
				<main className="max-w-6xl mx-auto bg-white shadow-sm rounded-lg">
					<header className="flex justify-between items-center p-6 border-b">
						<button className="flex items-center text-gray-600 hover:text-gray-800 transition">
							<svg
								className="w-5 h-5 mr-2"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M15 19l-7-7 7-7"
								/>
							</svg>
							<Link to={`/oder-history`}>
								<span className="text-sm font-medium">Trở lại</span>
							</Link>
						</button>
						<div className="flex items-center space-x-4">
							<div className="flex items-center text-sm">
								<span className="text-gray-600">MÃ ĐƠN HÀNG:</span>
								<span className="ml-2 text-blue-600 font-medium">
									{order?.orderNumber}
								</span>
							</div>
							<div className="text-sm font-medium text-red-600">
								{getStatusString(order?.orderStatus)}
							</div>
						</div>
					</header>{" "}
					<div className="py-12 px-8">
						{/* Icon hủy đơn và thông báo */}
						<div className="flex flex-col items-center mb-8 border-b border-gray-200 pb-8">
							<div className="w-20 h-20 rounded-full border-4 border-red-500 flex items-center justify-center bg-white">
								<svg
									className="w-12 h-12 text-red-500"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
									/>
								</svg>
							</div>

							<div className="mt-4 text-center">
								<p className="font-medium text-red-500 text-lg">
									Đã Hủy Đơn Hàng
								</p>
								<p className="mt-2 text-gray-600">
									Đơn hàng đã bị hủy vào lúc: {formatDateTime(order?.updatedAt)}
								</p>
								<p className="mt-1 text-gray-600">
									Lý do:{" "}
									{order?.cancellationReason || "Không có lý do được cung cấp"}
								</p>
							</div>
						</div>

						{/* Chi tiết đơn hàng */}
						<div className="px-8 py-6 border-t">
							{order.orderDetail_id?.map((detail, index) => (
								<div
									key={index}
									className="flex justify-between items-center mb-6"
								>
									<div className="flex items-center space-x-4">
										{detail.product_id?.image && (
											<img
												src={detail.product_id.image}
												className="w-20 h-20 object-cover rounded"
												alt={detail.product_id.name || "Product"}
											/>
										)}
										<div>
											<h3 className="font-medium">
												{detail.product_id?.name ||
													"Tên sản phẩm không xác định"}
											</h3>
											<p className="text-sm text-gray-600 mt-1">
												Số lượng: {detail.quantity || 0}
											</p>
											<p className="text-sm text-gray-600">
												Size: {detail.product_size?.name || "N/A"}{" "}
												{detail.product_size?.priceSize
													? `(+${detail.product_size.priceSize.toLocaleString(
															"vi-VN",
													  )} ₫)`
													: ""}
											</p>
											<p className="text-sm text-gray-600">
												Topping:
												{detail.product_toppings.length > 0
													? detail.product_toppings
															.map(
																(topping: any) =>
																	`${
																		topping.topping_id?.nameTopping
																	} (+${topping.topping_id?.priceTopping?.toLocaleString(
																		"vi-VN",
																	)} ₫)`,
															)
															.join(", ")
													: "Không có"}
											</p>
										</div>
									</div>

									<p className="font-medium">
										{detail.sale_price ? (
											<>
												<span className="text-red-600">
													{detail.sale_price.toLocaleString("vi-VN")} ₫
												</span>
												<span className="line-through text-gray-400 ml-2">
													{detail.price?.toLocaleString("vi-VN")} ₫
												</span>
											</>
										) : (
											<span>
												{detail.price?.toLocaleString("vi-VN") || "N/A"} ₫
											</span>
										)}
									</p>
								</div>
							))}
							<div className="border-t pt-4">
								<div className="flex flex-wrap justify-between py-2">
									<span className="text-gray-600">Tổng tiền hàng</span>
									<span className="font-medium">
										{(
											order?.totalPrice + (order?.discountAmount || 0)
										).toLocaleString("vi-VN")}{" "}
										₫
									</span>
								</div>
								<div className="flex flex-wrap justify-between py-2">
									<span className="text-gray-600">Giảm giá Voucher</span>
									<span className="font-medium">
										- {order?.discountAmount?.toLocaleString("vi-VN") || "0"} ₫
									</span>
								</div>
								<div className="flex flex-wrap justify-between py-2 border-t">
									<span className="text-gray-600">Thành tiền</span>
									<span className="text-xl font-medium text-red-600">
										{(
											order?.totalPrice +
											(order?.discountAmount || 0) -
											(order?.discountAmount || 0)
										).toLocaleString("vi-VN")}{" "}
										₫
									</span>
								</div>
							</div>

							<div className="mt-6 p-4 bg-yellow-50 rounded-lg">
								<div className="flex items-center">
									<svg
										className="w-5 h-5 text-yellow-400 mr-2"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
										/>
									</svg>
									<p className="text-gray-700">
										Phương thức thanh toán:{" "}
										<span className="font-medium">
											{(() => {
												switch (order?.paymentMethod) {
													case "cash on delivery":
														return "Thanh toán khi nhận hàng";
													case "momo":
														return "Thanh toán qua MoMo";
													case "zalopay":
														return "Thanh toán qua ZaloPay";
													case "vnpay":
														return "Thanh toán qua VNPay";
													default:
														return "Không xác định";
												}
											})()}
										</span>
									</p>
								</div>
							</div>
						</div>
					</div>
				</main>
			</div>
		);
	}

	return (
		<>
			<div className="min-h-screen bg-gray-50 pt-16">
				<main className="max-w-6xl mx-auto bg-white shadow-sm rounded-lg">
					<header className="flex flex-wrap justify-between items-center p-6 border-b">
						<button className="flex items-center text-gray-600 hover:text-gray-800 transition mb-4 md:mb-0">
							<svg
								className="w-5 h-5 mr-2"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M15 19l-7-7 7-7"
								/>
							</svg>
							<Link to={`/oder-history`}>
								<span className="text-sm font-medium">Trở lại</span>
							</Link>
						</button>
						<div className="flex flex-wrap items-center space-x-4">
							<div className="flex items-center text-sm mb-4 md:mb-0">
								<span className="text-gray-600">MÃ ĐƠN HÀNG:</span>
								<span className="ml-2 text-blue-600 font-medium">
									{order?.orderNumber}
								</span>
							</div>
							<div className="text-sm font-medium text-red-600">
								{getStatusString(order?.orderStatus)}
							</div>
						</div>
					</header>

					<div className="py-12 px-4 sm:px-8">
						<div className="flex flex-wrap justify-between">
							{filteredStatusSteps.map((step, index) => (
								<React.Fragment key={step.key}>
									{index > 0 && order?.orderStatus !== "canceled" && (
										<div className="flex-1 flex items-center justify-center">
											<div
												className={`h-1 w-full ${
													activeStatuses[index] ? "bg-green-500" : "bg-gray-300"
												}`}
											/>
										</div>
									)}
									<div className="flex flex-col items-center relative mb-6 sm:mb-0">
										<div
											className={`w-16 h-16 rounded-full border-4 ${
												step.key === "canceled"
													? "border-red-500"
													: activeStatuses[index]
													? "border-green-500"
													: "border-gray-300"
											} flex items-center justify-center bg-white`}
										>
											{step.icon(activeStatuses[index])}
										</div>
										<div className="mt-3 text-center">
											<p
												className={`font-medium ${
													step.key === "canceled"
														? "text-red-500"
														: activeStatuses[index]
														? ""
														: "text-gray-500"
												}`}
											>
												{step.label}
											</p>
										</div>
									</div>
								</React.Fragment>
							))}
						</div>
					</div>

					<div className="px-4 sm:px-8 py-6 bg-gray-50">
						<h2 className="text-xl font-semibold mb-4">Thông Tin Giao Hàng</h2>
						<div className="flex flex-wrap justify-between items-start">
							<div>
								<h3 className="font-medium">{order?.customerInfo?.name}</h3>
								<p className="text-gray-600 mt-1">
									(+84) {order?.customerInfo?.phone}
								</p>
								<p className="text-gray-600 mt-1 max-w-xl">
									{order?.customerInfo?.address}
								</p>
							</div>
						</div>
					</div>

					<div className="px-4 sm:px-8 py-6 border-t">
						{order.orderDetail_id?.map((detail, index) => (
							<div
								key={index}
								className="flex flex-wrap justify-between items-center mb-6"
							>
								<div className="flex items-center space-x-4">
									{detail.product_id?.image && (
										<img
											src={detail.product_id.image}
											className="w-20 h-20 object-cover rounded"
											alt={detail.product_id.name || "Product"}
										/>
									)}
									<div>
										<h3 className="font-medium">
											{detail.product_id?.name || "Tên sản phẩm không xác định"}
										</h3>
										<p className="text-sm text-gray-600 mt-1">
											Số lượng: {detail.quantity || 0}
										</p>
										<p className="text-sm text-gray-600">
											Size: {detail.product_size?.name || "N/A"}{" "}
											{detail.product_size?.priceSize
												? `(+${detail.product_size.priceSize.toLocaleString(
														"vi-VN",
												  )} ₫)`
												: ""}
										</p>
										<p></p>
										<p className="text-sm text-gray-600">
											Topping:
											{detail.product_toppings.length > 0
												? detail.product_toppings
														.map(
															topping =>
																`${
																	topping.topping_id?.nameTopping
																} (+${topping.topping_id?.priceTopping?.toLocaleString(
																	"vi-VN",
																)} ₫)`,
														)
														.join(", ")
												: "Không có"}
										</p>
									</div>
								</div>
								{order.orderStatus === "completed" ? (
									<p className="font-medium mt-4 sm:mt-0 w-[200px] justify-between">
										{detail.price &&
										detail.sale_price &&
										detail.sale_price !== detail.price ? (
											<>
												<span className="text-red-600 ml-[-20px]">
													{detail.sale_price.toLocaleString("vi-VN")} ₫
												</span>
												<span className="line-through text-gray-400 ml-2">
													{detail.price.toLocaleString("vi-VN")} ₫
												</span>
											</>
										) : (
											<span className="text-red-600 ml-[-20px]">
												{detail.price?.toLocaleString("vi-VN") ||
													detail.sale_price?.toLocaleString("vi-VN") ||
													"N/A"}{" "}
												₫
											</span>
										)}
										<Link
											to={`/review/${detail.product_id._id}`}
											className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-300"
										>
											Đánh giá
										</Link>
									</p>
								) : (
									<p className="font-medium mt-4 sm:mt-0 ">
										{detail.price &&
										detail.sale_price &&
										detail.sale_price !== detail.price ? (
											<>
												<span className="text-red-600 ml-[-20px]">
													{detail.sale_price.toLocaleString("vi-VN")} ₫
												</span>
												<span className="line-through text-gray-400 ml-2">
													{detail.price.toLocaleString("vi-VN")} ₫
												</span>
											</>
										) : (
											<span className="text-red-600 ml-[-20px]">
												{detail.price?.toLocaleString("vi-VN") ||
													detail.sale_price?.toLocaleString("vi-VN") ||
													"N/A"}{" "}
												₫
											</span>
										)}
									</p>
								)}
							</div>
						))}
						<div className="border-t pt-4">
							<div className="flex flex-wrap justify-between py-2">
								<span className="text-gray-600">Tổng tiền hàng</span>
								<span className="font-medium">
									{(
										order?.totalPrice + (order?.discountAmount || 0)
									).toLocaleString("vi-VN")}
									₫
								</span>
							</div>
							<div className="flex flex-wrap justify-between py-2">
								<span className="text-gray-600">Giảm giá Voucher</span>
								<span className="font-medium">
									- {order?.discountAmount?.toLocaleString("vi-VN") || "0"} ₫
								</span>
							</div>
							<div className="flex flex-wrap justify-between py-2 border-t">
								<span className="text-gray-600">Thành tiền</span>
								<span className="text-xl font-medium text-red-600">
									{(
										order?.totalPrice +
										(order?.discountAmount || 0) -
										(order?.discountAmount || 0)
									).toLocaleString("vi-VN")}{" "}
									₫
								</span>
							</div>
						</div>
						{order.note && (
							<div className="mt-6 p-4 bg-gray-50 rounded-lg border">
								<h4 className="text-lg font-normal mb-2">Ghi chú đơn hàng</h4>
								<p className="text-gray-700">{order.note}</p>
							</div>
						)}
						<div className="mt-6 p-4 bg-yellow-50 rounded-lg">
							<div className="flex items-center">
								<svg
									className="w-5 h-5 text-yellow-400 mr-2"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
									/>
								</svg>
								<p className="text-gray-700">
									Phương thức thanh toán:{" "}
									<span className="font-medium">
										{(() => {
											switch (order?.paymentMethod) {
												case "cash on delivery":
													return "Thanh toán khi nhận hàng";
												case "momo":
													return "Thanh toán qua MoMo";
												case "zalopay":
													return "Thanh toán qua ZaloPay";
												case "vnpay":
													return "Thanh toán qua VNPay";
												default:
													return "Không xác định";
											}
										})()}
									</span>
								</p>
							</div>
						</div>
					</div>
				</main>
			</div>
		</>
	);
};

export default Tracking;
