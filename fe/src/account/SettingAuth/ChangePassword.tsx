import React, { useState } from "react";
import { Button, Form, Input, message } from "antd";
import { useMutation } from "@tanstack/react-query";
import instance from "../../services/api";
import { useNavigate } from "react-router-dom";

const ChangePassword = () => {
	const [currentPassword, setCurrentPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmNewPassword, setConfirmNewPassword] = useState("");

	// Lấy thông tin người dùng từ localStorage
	const storedUser = localStorage.getItem("user");
	const user = storedUser ? JSON.parse(storedUser) : {};
	const nav = useNavigate();

	// State để kiểm soát trạng thái loading của mutation
	// Mutation để gọi API đổi mật khẩu
	const changePasswordMutation = useMutation({
		mutationFn: async (passwordData: {
			currentPassword: string;
			newPassword: string;
		}) => {
			const response = await instance.post(
				`users/${user._id}/change-password`,
				passwordData,
			);
			return response.data;
		},
		onSuccess: () => {
			message.success("Mật khẩu đã được thay đổi!");
			setCurrentPassword("");
			setNewPassword("");
			setConfirmNewPassword("");
			nav("/"); // Chuyển hướng về trang chủ
		},
		onError: error => {
			message.error(
				error?.response?.data?.message || "Mật khẩu không chính xác.",
			);
		},
	});

	const handleSubmit = () => {
		if (newPassword !== confirmNewPassword) {
			message.error("Mật khẩu mới và mật khẩu xác nhận không khớp.");
			return;
		}

		const passwordData = {
			currentPassword,
			newPassword,
		};

		// Gọi API để thay đổi mật khẩu
		changePasswordMutation.mutate(passwordData);
	};

	return (
		<div className="relative bg-cover bg-center h-screen flex items-center justify-center bg-orange-200">
			{/* Lớp che phủ mờ cho toàn bộ nền */}
			<div className="absolute inset-0 bg-black opacity-50"></div>{" "}
			{/* Độ mờ 50% */}
			<div className="relative mt-[300px] mb-[241px] w-full max-w-md p-6 bg-white shadow-md rounded-lg opacity-80">
				<h3 className="text-center text-2xl font-semibold ">
					Đổi Mật Khẩu
				</h3>{" "}
				{/* Màu chữ trắng */}
				<Form
					layout="vertical"
					onFinish={handleSubmit}
					
				>
					{" "}
					{/* Màu chữ trong toàn bộ form */}
					<Form.Item
						label="Mật khẩu cũ"
						name="currentPassword"
						rules={[{ required: true, message: "Vui lòng nhập mật khẩu cũ!" }]}
						
					>
						<Input.Password
							value={currentPassword}
							onChange={e => setCurrentPassword(e.target.value)}
							placeholder="Nhập mật khẩu cũ"
							className="border rounded-md text-white"
						/>
					</Form.Item>
					<Form.Item
						label="Mật khẩu mới"
						name="newPassword"
						rules={[{ required: true, message: "Vui lòng nhập mật khẩu mới!" }]}
						
					>
						<Input.Password
							value={newPassword}
							onChange={e => setNewPassword(e.target.value)}
							placeholder="Nhập mật khẩu mới"
							className="border rounded-md text-white"
						/>
					</Form.Item>
					<Form.Item
						label="Nhập lại mật khẩu mới"
						name="confirmNewPassword"
						rules={[
							{ required: true, message: "Vui lòng xác nhận mật khẩu mới!" },
						]}
						
					>
						<Input.Password
							value={confirmNewPassword}
							onChange={e => setConfirmNewPassword(e.target.value)}
							placeholder="Nhập lại mật khẩu mới"
							className="border rounded-md text-white"
						/>
					</Form.Item>
					<Button
						type="primary"
						htmlType="submit"
						className="w-full bg-red-600 text-white hover:bg-red-700 rounded-md"
					>
						Đổi mật khẩu
					</Button>
				</Form>
			</div>
		</div>
	);
};

export default ChangePassword;
