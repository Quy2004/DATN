import {
	Table,
	Typography,
	Spin,
	Alert,
	Popconfirm,
	Button,
	message,
	Select,
} from "antd";

import instance from "../../services/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PlusCircleFilled } from "@ant-design/icons";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Search from "antd/es/input/Search";

const { Title } = Typography;
const { Option } = Select;

const ClientAdmin = () => {
	const [messageApi, contextHolder] = message.useMessage();
	const queryClient = useQueryClient();
	const [filterStatus, setFilterStatus] = useState("active");
	const [searchTerm, setSearchTerm] = useState("");

	const navigate = useNavigate();
	const location = useLocation();

	const updateUrlParams = () => {
		const searchParams = new URLSearchParams();
		if (searchTerm) searchParams.set("search", searchTerm);
		searchParams.set("filterStatus", filterStatus);
		navigate({ search: searchParams.toString() });
	};

	useEffect(() => {
		updateUrlParams();
	}, [filterStatus, searchTerm]);

	const { data, isLoading, isError, error } = useQuery({
		queryKey: ["user", filterStatus, searchTerm],
		queryFn: async () => {
			try {
				const response = await instance.get(
					`/user?isDeleted=${filterStatus === "deleted" ? true : false}&all=${
						filterStatus === "all" ? true : false
					}&search=${searchTerm}`,
				);
				return response.data;
			} catch (error) {
				throw new Error("Lỗi khi tải dữ liệu từ API");
			}
		},
	});

    // Soft delete user
    const mutationSoftDeleteUser = useMutation<void, Error, string>({
        mutationFn: async (_id: string) => {
          try {
            return await instance.patch(`/user/${_id}/soft-delete`);
          } catch (error) {
            throw new Error("Xóa mềm user thất bại");
          }
        },
        onSuccess: () => {
          messageApi.success("Xóa mềm user thành công");
          queryClient.invalidateQueries({ queryKey: ["user"] });
        },
        onError: (error) => {
          messageApi.error(`Lỗi: ${error.message}`);
        },
      });

      // Restore user
    const mutationRestoreUser = useMutation<void, Error, string>({
        mutationFn: async (_id: string) => {
          try {
            return await instance.patch(`/user/${_id}/restore`);
          } catch (error) {
            throw new Error("Khôi phục user thất bại");
          }
        },
        onSuccess: () => {
          messageApi.success("Khôi phục user thành công");
          queryClient.invalidateQueries({ queryKey: ["user"] });
        },
        onError: (error) => {
          messageApi.error(`Lỗi: ${error.message}`);
        },
      });
    

	const handleFilterChange = (value: string) => {
		setFilterStatus(value);
	};

	const handleSearch = (value: string) => {
		setSearchTerm(value);
	};

	const columns = [
		{
			title: "STT",
			dataIndex: "key",
			key: "key",
		},
		{
			title: "Tên",
			dataIndex: "userName",
			key: "userName",
		},
		{
			title: "Email",
			dataIndex: "email",
			key: "email",
		},
		{
			title: "Hình ảnh",
			dataIndex: "avatar",
			key: "avatar",
		},
		{
			title: "Trạng thái",
			dataIndex: "role",
			key: "role",
		},
		{
			title: "Hành động",
			dataIndex: "action",
			render: (_: any, user: any) => (
				<div className="flex flex-wrap gap-4">
					{user.isDeleted ? (
                  <Popconfirm
                    title="Khôi phục user"
                    description="Bạn có chắc muốn mở khóa tài khoản này không?"
                    onConfirm={() => mutationRestoreUser.mutate(user._id)}
                    okText="Yes"
                    cancelText="No"
                  >
                    <Button className="bg-blue-500 text-white hover:bg-blue-600 focus:ring-2 focus:ring-blue-300">
                      Mở khóa
                    </Button>
                  </Popconfirm>
                ) : (
                  <Popconfirm
                    title="Khóa user"
                    description="Bạn có chắc muốn khóa tài khoản này không?"
                    onConfirm={() => mutationSoftDeleteUser.mutate(user._id)}
                    okText="Yes"
                    cancelText="No"
                  >
                    <Button className="bg-yellow-500 text-white hover:bg-yellow-600 focus:ring-2 focus:ring-yellow-300">
                      Khóa tài khoản
                    </Button>
                  </Popconfirm>
                )}

					<Button className="bg-green-500 text-white hover:bg-green-600 focus:ring-2 focus:ring-green-300">
						<Link to={`/admin/user/${user._id}/update`}>Cập nhật</Link>
					</Button>
				</div>
			),
		},
	];

	const dataSource = data?.data?.map((item: any, index: number) => ({
		_id: item._id,
		key: index + 1,
		userName: item.userName,
		email: item.email,
		avatar: item.avatar,
		role: item.role,
		isDeleted: item.isDeleted,
	}));

	if (isLoading) {
        return (
          <div style={{ textAlign: "center", padding: "20px" }}>
            <Spin size="large" tip="Đang tải dữ liệu..." />
          </div>
        );
      }

	if (isError) {
		return (
			<div style={{ margin: "20px 0" }}>
				<Alert
					message="Lỗi"
					description={`Có lỗi xảy ra khi tải dữ liệu: ${error.message}`}
					type="error"
					showIcon
				/>
			</div>
		);
	}

	return (
        <>
        {contextHolder}
        <div className="flex items-center justify-between mb-5">
          <Title level={3}>Danh sách user</Title>
  
          <div className="flex space-x-3">
            <Search
              placeholder="Tìm kiếm user"
              onSearch={handleSearch}
              allowClear
              style={{ width: 300 }}
            />
            <Select
              value={filterStatus}
              style={{ width: 200 }}
              onChange={handleFilterChange}
            >
              <Option value="all">Tất cả user</Option>
              <Option value="active">User hoạt động</Option>
              <Option value="deleted">User đã bị khóa</Option>
            </Select>
            
          </div>
        </div>
        <Table dataSource={dataSource} columns={columns} />
      </>
    )
};
export default ClientAdmin;
