

export interface User {
    _id: string; // ID người dùng
    email: string; // Địa chỉ email
    userName: string; // Tên người dùng
    avatars: string,
    password: string; // Mật khẩu người dùng
    isDeleted: boolean; // Trạng thái xóa
    role: 'user' | 'admin' | 'manager'; // Vai trò người dùng
    createdAt: string; // Thời gian tạo
    updatedAt: string; // Thời gian cập nhật
}
