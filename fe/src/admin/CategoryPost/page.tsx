import { Button, Table, message, Spin, Alert, Space, Popconfirm, Image } from "antd";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CategoryPost } from "../../types/categoryPost";
import instance from "../../services/api";
import Title from "antd/es/typography/Title";
import { Link, useNavigate } from "react-router-dom";
import { DeleteOutlined, PlusCircleFilled } from "@ant-design/icons";
import Search from "antd/es/input/Search";
import { useCallback, useEffect, useState } from "react";

const CategoryPostManagerPage = () => {
	const queryClient = useQueryClient();
    const [messageApi, contextHolder] = message.useMessage();
    const [isDelete, setIsDelete] = useState(false);
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const navigate = useNavigate();

    const updateUrlParams = useCallback(() => {
        const params = new URLSearchParams();
        if (searchTerm) params.set("search", searchTerm);
        if (isDelete) params.set("isDelete", "true");
        params.set("page", currentPage.toString());
        params.set("limit", pageSize.toString());
        navigate({ search: params.toString() }, { replace: true });
    }, [searchTerm, currentPage, pageSize, isDelete, navigate]);

    useEffect(() => {
        updateUrlParams();
    }, [searchTerm, currentPage, pageSize, isDelete, updateUrlParams]);

    const {
        data: categoryPost,
        isLoading,
        isError,
    } = useQuery({
        queryKey: ["categoryPost", searchTerm, currentPage, pageSize, isDelete],
        queryFn: async () => {
            const trashParam = isDelete ? `&isDeleted=true` : "";
            const response = await instance.get(
                `categoryPost?search=${searchTerm}&page=${currentPage}&limit=${pageSize}${trashParam}`
            );
            return response.data.data; // Ensure this has the fields you need
        },
    });


    const mutationSoftDelete = useMutation<void, Error, string>({
		mutationFn: async (_id: string) => {
			try {
				return await instance.patch(`/categoryPost/${_id}/soft-delete`);
			} catch (error) {
				throw new Error("Xóa mềm category post thất bại");
			}
		},
		onSuccess: () => {
			messageApi.success("Xóa mềm category post thành công");
			queryClient.invalidateQueries({ queryKey: ["categoryPost"] });
		},
		onError: error => {
			messageApi.error(`Lỗi: ${error.message}`);
		},
	});

	// Khôi phục category post
	const mutationRestore = useMutation<void, Error, string>({
		mutationFn: async (_id: string) => {
			try {
				return await instance.patch(`/categoryPost/${_id}/restore`);
			} catch (error) {
				throw new Error("Khôi phục category post thất bại");
			}
		},
		onSuccess: () => {
			message.success("Khôi phục category post thành công");
			queryClient.invalidateQueries({ queryKey: ["categoryPost"] });
		},
		onError: error => {
			message.error(`Lỗi: ${error.message}`);
		},
	});

	const mutationHardDelete = useMutation<void, Error, string>({
		mutationFn: async (_id: string) => {
			try {
				return await instance.delete(`/categoryPost/${_id}`);
			} catch (error) {
				throw new Error("Xóa cứng category post thất bại");
			}
		},
		onSuccess: () => {
			messageApi.success("Xóa cứng category post thành công");
			queryClient.invalidateQueries({ queryKey: ["categoryPost"] });
		},
		onError: error => {
			messageApi.error(`Lỗi: ${error.message}`);
		},
	});

    const handleSearch = (value: string) => {
        setSearchTerm(value);
        setCurrentPage(1);
    };

    const dataSource = categoryPost?.map((item: CategoryPost, index: number) => ({
        _id: item._id,
        key: index + 1,
        title: item.title,
        description: item.description, // Make sure this is included in the response
        thumbnail: item.thumbnail, // Changed to use the correct key
        isDeleted: item.isDeleted,
    }));

    const columns = [
        {
            title: "STT",
            dataIndex: "key",
            key: "key",
        },
        {
            title: "Tiêu đề",
            dataIndex: "title",
            key: "title",
        },
        {
            title: "Mô tả",
            dataIndex: "description", // Đảm bảo rằng điều này được ánh xạ chính xác
            key: "description",
            render: (text: any) => (
                <div
                    dangerouslySetInnerHTML={{
                        __html: text,
                    }}
                />
            ),
        },
        
        {
            title: "Ảnh sản phẩm",
            dataIndex: "thumbnail",
            key: "thumbnail",
            render: (thumbnail: string) => (
              <Image
                src={thumbnail}
                alt="Category"
                style={{ width: "100px", height: "auto" }}
              />
            ),
          },
        {
			title: "Hành động",
			key: "action",
			render: (_: string, categoryPost: CategoryPost) => (
				<Space size="middle">
					{isDelete ? (
						<>
							<Popconfirm
								title="Khôi phục category post"
								description="Bạn có chắc chắn muốn khôi phục category post này?"
								onConfirm={() => mutationRestore.mutate(categoryPost._id)}
								okText="Có"
								cancelText="Không"
							>
								<Button className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-all">
									Khôi phục
								</Button>
							</Popconfirm>
							<Popconfirm
								title="Xóa cứng category post"
								description="Bạn có chắc chắn muốn xóa category post này vĩnh viễn?"
								onConfirm={() => mutationHardDelete.mutate(categoryPost._id)}
								okText="Có"
								cancelText="Không"
							>
								<Button className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-all">
									Xóa vĩnh viễn
								</Button>
							</Popconfirm>
						</>
					) : (
						<>
							<Popconfirm
								title="Xóa mềm category post"
								description="Bạn có chắc chắn muốn xóa mềm category post này?"
								onConfirm={() => mutationSoftDelete.mutate(categoryPost._id)}
								okText="Có"
								cancelText="Không"
							>
								<Button className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-all">
									Xóa
								</Button>
							</Popconfirm>
							<Link to={`/admin/categoryPost/${categoryPost._id}/update`}>
								<Button className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-all">
									Cập nhật
								</Button>
							</Link>
						</>
					)}
				</Space>
			),
		},
    ];

    return (
        <div>
            <div className="flex items-center justify-between mb-5">
                <Title level={3}>Danh sách category post</Title>
                {contextHolder}
                <div className="flex space-x-3">
                    <Search
                        placeholder="Tìm kiếm category post"
                        onSearch={handleSearch}
                        allowClear
                        style={{ width: 300 }}
                    />
                    <Button
                        type="primary"
                        icon={<DeleteOutlined />}
                        onClick={() => setIsDelete(!isDelete)}
                    >
                    </Button>
                    <Button
                        type="primary"
                        icon={<PlusCircleFilled />}
                    >
                        <Link to="/admin/categoryPost/add" style={{ color: "white" }}>
                            Thêm category post
                        </Link>
                    </Button>
                </div>
            </div>

            {isLoading ? (
                <Spin size="large" />
            ) : isError ? (
                <Alert message="Lỗi khi tải danh sách banner" type="error" showIcon />
            ) : (
                <Table
                    dataSource={dataSource}
                    columns={columns}
                    pagination={{
                        current: currentPage,
                        pageSize: pageSize,
                        total: categoryPost?.pagination?.totalItems || 0,
                        showSizeChanger: true,
                        pageSizeOptions: ["10", "20", "50", "100"],
                        onChange: (page, pageSize) => {
                            setCurrentPage(page);
                            setPageSize(pageSize);
                        },
                    }}
                    scroll={{ y: 300 }} // Chỉ cần chiều cao
                    style={{ tableLayout: "fixed"}} // Giữ chiều rộng ổn định
                />
            )}
        </div>
    );
};

export default CategoryPostManagerPage;
