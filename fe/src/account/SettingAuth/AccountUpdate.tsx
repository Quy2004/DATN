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
            setAvatar(userData.avatars[0]);
            setAvatarsList(
                userData.avatars.length > 0
                    ? [
                          {
                              uid: "0",
                              name: "avatar.jpg",
                              status: "done",
                              url: userData.avatars[0],
                          },
                      ]
                    : []
            );
        }
    }, [userData, form]);

    const updateUserMutation = useMutation({
        mutationFn: async (values: any) => {
            const { userName, email } = values;
            const formData = new FormData();
            formData.append("userName", userName);
            formData.append("email", email);
            formData.append("avatars", avatar || "");
            const response = await instance.put(`users/${user._id}`, formData);
            return response.data;
        },
    });

    const uploadImage = async (file: RcFile) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", "duan_totnghiep");

        try {
            const res = await axios.post(
                "https://api.cloudinary.com/v1_1/duantotnghiep/image/upload",
                formData
            );
            setAvatar(res.data.secure_url);
            setAvatarUrl(res.data.secure_url);
            return res.data.secure_url;
        } catch (error) {
            message.error("Upload ảnh thất bại!");
        }
    };

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
            notification.success({ message: "Cập nhật thông tin thành công!" });
        } catch (error) {
            notification.error({ message: "Cập nhật thông tin không thành công!" });
        }
    };

    if (userLoading || addressLoading) return <p>Đang tải...</p>;
    if (userError || addressError) return <p>Đã có lỗi xảy ra.</p>;

    const firstAddress = addressData?.[0];

    return (
        <div className="mt-20 mb-8 flex justify-center mx-auto">
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
                        <h1 className="text-2xl font-semibold mb-4">Cập nhật thông tin</h1>
                            <div className="space-y-2 flex items-start gap-3 h-[230px]">
                                <div className="flex-1">
                                <label className="mb-2">Avatar</label>
                                <Form.Item name="avatars">
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
                                <Form.Item name="userName">
                                    <Input placeholder="Nhập họ tên" className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"/>
                                </Form.Item>
                            </div>
                        </div>
                        <label>Email</label>
                        <Form.Item name="email">
                            <Input placeholder="Nhập email" className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400" />
                        </Form.Item>
                        <label>Địa chỉ</label>
                        <Form.Item name="address">
                            <Input placeholder="Nhập địa chỉ" className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400" />
                        </Form.Item>
                        <label>Tên người nhận</label>
                        <Form.Item name="name">
                            <Input placeholder="Nhập tên người nhận" className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400" />
                        </Form.Item>
                        <label>Số điện thoại người nhận</label>
                        <Form.Item name="phone">
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
