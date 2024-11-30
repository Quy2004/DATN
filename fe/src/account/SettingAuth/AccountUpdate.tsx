import { FileImageOutlined } from "@ant-design/icons";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button, Form, Input, message, notification, Upload, Modal } from "antd";
import { RcFile, UploadFile } from "antd/es/upload";
import { useEffect, useState } from "react";
import instance from "../../services/api";
import axios from "axios";

const AccountUpdate = () => {
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [avatarsList, setAvatarsList] = useState<UploadFile[]>([]);
    const [avatar, setAvatar] = useState<string>("");
    const [isPasswordModalOpen, setPasswordModalOpen] = useState(false);
    const [password, setPassword] = useState("");

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

            const avatarUrl = userData.avatars[0]?.url;
            if (avatarUrl && avatarUrl.startsWith("blob:")) {
                setAvatar("");
            } else {
                setAvatar(avatarUrl || "");
            }

            setAvatarsList(
                userData.avatars.length > 0
                    ? [
                          {
                              uid: "0",
                              name: "avatar.jpg",
                              status: "done",
                              url: avatarUrl,
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
            const res = await axios.post(
                "https://api.cloudinary.com/v1_1/duantotnghiep/image/upload",
                formData
            );
            const imageUrl = res.data.secure_url;
            setAvatar(imageUrl);
            setAvatarUrl(imageUrl);
            return imageUrl;
        } catch (error) {
            message.error("Upload ảnh thất bại!");
        }
    };

    const updateAddressMutation = useMutation({
        mutationFn: async (values: any) => {
            const { address, phone, name } = values;

            const formData = new FormData();
            formData.append("address", address);
            formData.append("phone", phone);
            formData.append("name", name);

            const response = await instance.put(`address/${user._id}`, formData);
            return response.data;
        },
    });

    const createAddressMutation = useMutation({
        mutationFn: async (values: any) => {
            const { address, phone, name } = values;

            const formData = new FormData();
            formData.append("user_id", user._id);
            formData.append("address", address);
            formData.append("phone", phone);
            formData.append("name", name);

            const response = await instance.post(`address`, formData);
            return response.data;
        },
    });

    const checkPasswordMutation = useMutation({
        mutationFn: async (password: string) => {
            const response = await instance.post(`users/${user._id}/check`, { password });
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

    const handlePasswordSubmit = async () => {
        try {
            await checkPasswordMutation.mutateAsync(password);
            setPasswordModalOpen(false);
            const values = await form.validateFields();
            await updateUserMutation.mutateAsync(values);
            if (!addressData || addressData.length === 0) {
                await createAddressMutation.mutateAsync(values);
            } else {
                await updateAddressMutation.mutateAsync(values);
            }
            notification.success({ message: "Cập nhật thông tin thành công!" });
        } catch (error) {
            notification.error({ message: "Mật khẩu không đúng. Vui lòng thử lại." });
        }
    };

    const onFinish = async () => {
        setPasswordModalOpen(true);
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
                                    <Input placeholder="Nhập họ tên" />
                                </Form.Item>
                            </div>
                        </div>
                        <label>Email</label>
                        <Form.Item name="email">
                            <Input placeholder="Nhập email" />
                        </Form.Item>
                        <label>Địa chỉ</label>
                        <Form.Item name="address">
                            <Input placeholder="Nhập địa chỉ" />
                        </Form.Item>
                        <label>Tên người nhận</label>
                        <Form.Item name="name">
                            <Input placeholder="Nhập tên người nhận" />
                        </Form.Item>
                        <label>Số điện thoại người nhận</label>
                        <Form.Item name="phone">
                            <Input placeholder="Nhập số điện thoại" />
                        </Form.Item>
                        <Button htmlType="submit" className="w-full h-12 my-7 bg-blue-600">
                            Lưu thay đổi
                        </Button>
                    </Form>
                </section>
            </div>

            {/* Modal kiểm tra mật khẩu */}
            <Modal
                title="Nhập mật khẩu"
                visible={isPasswordModalOpen}
                onCancel={() => setPasswordModalOpen(false)}
                onOk={handlePasswordSubmit}
                okText="Xác nhận"
                cancelText="Hủy"
            >
                <Input.Password
                    placeholder="Nhập mật khẩu của bạn"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
            </Modal>
        </div>
    );
};

export default AccountUpdate;
