import { FileImageOutlined } from "@ant-design/icons"
import { Avatar, Button, Form, Upload } from "antd"
import { RcFile } from "antd/es/upload";
import { useState } from "react";


const AccountUpdate = () => {
    const [hasAvatar, setHasAvatar] = useState(false); // Trạng thái xác định đã có avatar chưa
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null); // Lưu URL của avatar

    // Hàm xử lý khi upload ảnh
    const uploadAvatar = (file: RcFile) => {
        const objectUrl = URL.createObjectURL(file);
        setAvatarUrl(objectUrl); // Lưu URL của ảnh
        setHasAvatar(true); // Đặt trạng thái là đã có avatar
        return false; // Ngăn upload mặc định của antd
    };

    // Hàm xử lý khi đổi avatar
    const changeAvatar = () => {
        setHasAvatar(false); // Đặt lại trạng thái để cho phép upload avatar mới
        setAvatarUrl(null); // Xóa URL avatar
    };
    return (
        <>
            <div className="mt-20 mb-8 flex justify-center mx-auto">
                <div className="w-[1200px] *:mx-auto">
                    <section className=" md:w-1/2 bg-white rounded-lg shadow-2xl p-6">
                        <form className="">
                            <h1 className="text-2xl font-semibold mb-4">Cập nhật thông tin</h1>
                            <div className="space-y-2 flex items-start gap-3 h-[230px]">
                                <div className="flex-1">
                                    <label htmlFor="" className="mb-2">Avatar</label>
                                    <Form.Item name="image">
                                        {hasAvatar ? (
                                            <div className="flex flex-col items-center justify-center">
                                                <Avatar
                                                    src={avatarUrl}
                                                    style={{ width: '150px', height: '150px' }}
                                                />
                                                <Button onClick={changeAvatar} className="mt-2 duration-700">Đổi avatar</Button>
                                            </div>
                                        ) : (
                                            <Upload
                                                name="file"
                                                listType="picture-card"
                                                beforeUpload={uploadAvatar}
                                                maxCount={1}
                                                showUploadList={false} // Ẩn danh sách sau khi tải
                                            >
                                                <Button icon={<FileImageOutlined />} />
                                            </Upload>
                                        )}
                                    </Form.Item>
                                </div>
                                <div className="flex-1">
                                    <div className="space-y-2 mb-4">
                                        <label className="block text-sm font-medium text-gray-700">Họ và tên</label>
                                        <input type="text" placeholder="Nhập họ tên" className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-700">Số điện thoại</label>
                                        <input type="text" placeholder="Nhập số điện thoại" className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400" />
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-2 mb-3">
                                <label className="block text-sm font-medium text-gray-700">Địa chỉ</label>
                                <input type="text" placeholder="Nhập địa chỉ" className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400" />
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">Email</label>
                                <input type="text" placeholder="Nhập email" className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400" />
                            </div>
                            <button type="submit" className="w-full my-7 p-3 text-white bg-blue-600 rounded-md hover:bg-blue-700">
                                Xác nhận
                            </button>
                        </form>
                    </section>
                </div>
            </div>
        </>
    )
}
export default AccountUpdate