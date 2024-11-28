import { FileImageOutlined } from "@ant-design/icons";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button, Form, Input, message, notification, Upload } from "antd";
import { RcFile, UploadFile } from "antd/es/upload";
import { useEffect, useState } from "react";
import instance from "../../services/api";
import axios from "axios";

const AccountUpdate = () => {
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [avatarsList, setAvatarsList] = useState<UploadFile[]>([]);
    const [avatar, setAvatar] = useState<string>("");

    const [form] = Form.useForm();

    // Lấy thông tin người dùng từ localStorage
    const storedUser = localStorage.getItem("user");
    const user = storedUser ? JSON.parse(storedUser) : {};

    // Lấy thông tin người dùng từ API
    const { data: userData, isLoading: userLoading, isError: userError } = useQuery({
        queryKey: ["user", user._id],
        queryFn: async () => {
            const response = await instance.get(`users/${user._id}`);
            return response.data;
        },
    });

    // Lấy danh sách địa chỉ của người dùng
    const { data: addressData, isLoading: addressLoading, isError: addressError } = useQuery({
        queryKey: ["addresses", user._id],
        queryFn: async () => {
            const response = await instance.get(`address/user/${user._id}`);
            return response.data.data;
        },
    });

    useEffect(() => {
        if (userData) {
            form.setFieldsValue({
                userName: userData.userName,
                email: userData.email,
            });

            // Kiểm tra nếu avatar có tồn tại và là blob URL, sau đó thay thế bằng URL thật
            const avatarUrl = userData.avatars[0]?.url;
            if (avatarUrl && avatarUrl.startsWith("blob:")) {
                // Lưu trữ lại URL của ảnh đã tải lên (nếu cần, bạn có thể tải lại ảnh từ blob)
                // Ở đây có thể cần chuyển đổi hoặc sử dụng một dịch vụ lưu trữ ảnh
                setAvatar(""); // Cần xử lý với URL vĩnh viễn từ Cloudinary hoặc API khác
            } else {
                setAvatar(avatarUrl || ""); // Nếu URL hợp lệ, sử dụng trực tiếp
            }

            // Cập nhật danh sách avatars
            setAvatarsList(
                userData.avatars.length > 0
                    ? [
                        {
                            uid: "0",
                            name: "avatar.jpg",
                            status: "done",
                            url: avatarUrl, // Đảm bảo URL là ổn định, không phải blob URL
                        },
                    ]
                    : []
            );
        }
    }, [userData]);

    const updateUserMutation = useMutation({
        mutationFn: async (values: any) => {
            const { userName, email } = values;
            const formData = new FormData();
            formData.append("userName", userName);
            formData.append("email", email);
            formData.append("avatars.url", avatar || "");
            const response = await instance.put(`users/${user._id}`, formData);
            return response.data;
        },
    });

    const uploadImage = async (file: RcFile) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", "duan_totnghiep");

        try {
            // Upload lên Cloudinary hoặc dịch vụ lưu trữ khác
            const res = await axios.post(
                "https://api.cloudinary.com/v1_1/duantotnghiep/image/upload",
                formData
            );
            const imageUrl = res.data.secure_url; // Lấy URL ổn định từ Cloudinary
            setAvatar(imageUrl); // Cập nhật URL avatar ổn định
            setAvatarUrl(imageUrl); // Cập nhật URL trong state
            return imageUrl;
        } catch (error) {
            message.error("Upload ảnh thất bại!");
        }
    };

    // API call để cập nhật địa chỉ
    const updateAddressMutation = useMutation({
        mutationFn: async (values: any) => {
            const { address, phone, name } = values;

            const formData = new FormData();
            formData.append("address", address);
            formData.append("phone", phone);
            formData.append("name", name);

            const response = await instance.put(`address/${user._id}`, formData); // Cập nhật địa chỉ
            return response.data;
        },
    });

    const createAddressMutation = useMutation({
        mutationFn: async (values: any) => {
            const { address, phone, name } = values;

            const formData = new FormData();
            formData.append("user_id", user._id); // Sử dụng user_id từ localStorage
            formData.append("address", address);
            formData.append("phone", phone);
            formData.append("name", name);

            const response = await instance.post(`address`, formData);
            return response.data;
        },
    });


    const handleAvatars = ({ fileList }: { fileList: UploadFile[] }) => {
        setAvatarsList(fileList);
        if (fileList.length > 0) {
            const newAvatar = fileList[0].url
                ? fileList[0].url
                : URL.createObjectURL(fileList[0].originFileObj!);
            setAvatar(newAvatar);
        }
    };

    const onFinish = async (values: any) => {
        try {
            await updateUserMutation.mutateAsync(values);
            if (!addressData || addressData.length === 0) {
                await createAddressMutation.mutateAsync(values);
            } else {
                // Nếu có địa chỉ, cập nhật
                await updateAddressMutation.mutateAsync(values);
            }
            notification.success({ message: "Cập nhật thông tin thành công!" });
        } catch (error) {
            notification.error({ message: "Cập nhật thông tin không thành công!" });
        }
    };

    if (userLoading || addressLoading) return <p>Đang tải...</p>;
    if (userError || addressError) return <p>Đã có lỗi xảy ra.</p>;

    const firstAddress = addressData?.[0];

    return (
        <div className="mt-14 mb-8 flex justify-center mx-auto md:mt-20">
            <div className="w-[1200px] *:mx-auto">
                <section className="md:w-1/2 bg-white rounded-lg shadow-2xl p-6">
                    <Form
                        initialValues={{
                            userName: userData?.userName,
                            email: userData?.email,
                            address: firstAddress ? firstAddress.address : "",
                            phone: firstAddress ? firstAddress.phone : "",
                            name: firstAddress ? firstAddress.name : "",
                        }}
                        onFinish={onFinish}
                        form={form}
                    >
                        <h1 className="text-xl md:text-2xl font-semibold mb-4">Cập nhật thông tin</h1>
                        <div className="space-y-2 h-[230px] md:flex md:items-start md:gap-3">
                            <div className=" md:flex-1">
                                <label className="hidden md:block mb-2">Avatar</label>
                                <Form.Item name="avatars" className="flex justify-center md:flex-none md:justify-start">
                                    <Upload
                                        name="file"
                                        listType="picture-card"
                                        multiple={false}
                                        fileList={avatarsList}
                                        beforeUpload={(file) => {
                                            uploadImage(file);
                                            return false;
                                        }}
                                        onChange={handleAvatars}
                                        maxCount={1}
                                    >
                                        {avatarsList.length === 0 ? (
                                            <Button icon={<FileImageOutlined />}>
                                                Tải ảnh lên
                                            </Button>
                                        ) : null}
                                    </Upload>
                                </Form.Item>
                            </div>
                            <div className="flex-1">
                                <label className="space-y-2 mb-4">Họ và tên</label>
                                <Form.Item className="mt-1 md:mt-0" name="userName">
                                    <Input placeholder="Nhập họ tên" className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400" />
                                </Form.Item>
                            </div>
                        </div>
                        <label className="">Email</label>
                        <Form.Item className="mt-1 md:mt-0" name="email">
                            <Input placeholder="Nhập email" className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400" />
                        </Form.Item>
                        <label className="">Địa chỉ</label>
                        <Form.Item className="mt-1 md:mt-0" name="address">
                            <Input placeholder="Nhập địa chỉ" className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400" />
                        </Form.Item>
                        <label className="">Tên người nhận</label>
                        <Form.Item className="mt-1 md:mt-0" name="name">
                            <Input placeholder="Nhập tên người nhận" className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400" />
                        </Form.Item>
                        <label className="">Số điện thoại người nhận</label>
                        <Form.Item className="mt-1 md:mt-0" name="phone">
                            <Input placeholder="Nhập số điện thoại" className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400" />
                        </Form.Item>
                        <Button
                            htmlType="submit"
                            className="w-full h-12 my-7 p-3 text-white bg-blue-600 rounded-md hover:bg-blue-700"
                        >
                            Lưu thay đổi
                        </Button>
                    </Form>
                </section>
            </div>
        </div>
    );
};

export default AccountUpdate;
