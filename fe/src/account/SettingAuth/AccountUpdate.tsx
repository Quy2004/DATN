
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

    const onFinish = async () => {
        try {
            const values = await form.validateFields();
            await updateUserMutation.mutateAsync(values);
            notification.success({ message: "Cập nhật thông tin thành công!" });
            window.location.reload()
        } catch (error) {
            notification.error({ message: "Mật khẩu không đúng. Vui lòng thử lại." });
        }
    };

    if (userLoading || addressLoading) return <p>Đang tải...</p>;
    if (userError || addressError) return <p>Đã có lỗi xảy ra.</p>;

    const firstAddress = addressData?.[0];

    return (
        <div className="mt-14 mb-8 flex justify-center mx-auto">
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
                        <h1 className="text-xl md:text-2xl font-semibold mb-1">Cập nhật thông tin</h1>
                        <p className="mb-4 border-b-orange-400 w-[170px] md:w-[205px] border-b-[4px]"></p>
                        <div className="flex justify-center items-start gap-3 h-auto">
                            <div>
                                <label className="mb-2 mx-1 font-medium">Avatar</label>
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
                                            <Button className="mx-2" icon={<FileImageOutlined />}>
                                                Tải ảnh lên
                                            </Button>
                                        ) : null}
                                    </Upload>
                                </Form.Item>
                            </div>
                        </div>
                        <div className="">
                            <label className="space-y-2 mb-4 mx-1 font-medium">
                                Họ và tên <span className="text-red-500">*</span>
                            </label>

                            <Form.Item
                                name="userName"
                                rules={[
                                    { required: true, message: "Họ tên không được để trống" }, // Bắt buộc nhập
                                    { min: 3, message: "Họ tên phải có ít nhất 3 ký tự" }, // Độ dài tối thiểu
                                    { max: 50, message: "Họ tên không được vượt quá 50 ký tự" }, // Độ dài tối đa
                                    {
                                        pattern: /^[a-zA-Z\sÀ-Ỵà-ỵ]+$/,
                                        message: "Họ tên chỉ được chứa chữ cái và khoảng trắng", // Kiểm tra định dạng
                                    },
                                ]}
                            >
                                <Input
                                    className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:placeholder-gray-400 dark:text-white"
                                    placeholder="Nhập họ tên"
                                />
                            </Form.Item>

                        </div>
                        <label className="space-y-2 mb-4 mx-1 font-medium">Email</label>
                        <Form.Item name="email">
                            <Input placeholder="Nhập email" disabled className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:placeholder-gray-400 dark:text-white" />
                        </Form.Item>

                        <Button htmlType="submit" className="w-full mt-2 px-4 py-5 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition">
                            Lưu thay đổi
                        </Button>
                    </Form>
                </section>
            </div>
        </div>
    );
};

export default AccountUpdate;
