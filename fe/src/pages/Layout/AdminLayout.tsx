import { useState } from "react";
import { Link, Outlet } from "react-router-dom"


const AdminLayout = () => {
    const [activeTab, setActiveTab] = useState('Tất cả');

    const tabs = [
        { name: 'Quản lí danh mục', link: 'category' },
        { name: 'Quản lí sản phẩm', link: 'product' },
        { name: 'Quản lí đơn hàng', link: 'order' },
        { name: 'Quản lí bình luận', link: 'comment' },
        { name: 'Quản lí tài khoản', link: 'client' }
    ];
    return (
        <>
            <h1 >AdminLayout</h1>
            {/* <ul className="">
                <li>
                    <Link to={"product"}>Product</Link>
                </li>
                <li>
                    <Link to={"category"}>Category</Link>
                </li>
                <li>
                    <Link to={"comment"}>Comment</Link>
                </li>
                <li>
                    <Link to={"user"}></Link>
                </li>
                <li></li>
                <li></li>
            </ul> */}
            <div className="flex w-full" >
                <aside className="sidebar p-[20px] w-[250px] h-dvh bg-[#33418E]">
                    <div className="logo mb-[50px] w-full *:mx-auto text-center">
                        <img className="w-[90x] h-[90px] rounded-[50%]"
                            src="data:image/jpeg;base64,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" alt="The Coffee House" />
                        <p className="mt-[15px] text-white font-semibold">THE COFFEE HOUSE</p>
                    </div>
                    {/* <ul className="list-none p-0 *:my-[5px] *:p-[15px] text-left *:text-white *:font-medium ">
                        <li className="hover:bg-[#AFD4FF] hover:rounded-[5px] hover:text-black ">
                            <Link to={"category"}>Quản lý danh mục</Link></li>
                        <li className="hover:bg-[#AFD4FF] hover:rounded-[5px]">
                            <Link to={""}>Quản lý sản phẩm</Link></li>
                        <li className="hover:bg-[#AFD4FF] hover:rounded-[5px]">
                            <Link to={""}>Quản lý đơn hàng</Link></li>
                        <li className="hover:bg-[#AFD4FF] hover:rounded-[5px]">
                            <Link to={""}>Quản lý bình luận</Link></li>
                        <li className="hover:bg-[#AFD4FF] hover:rounded-[5px]">
                            <Link to={""}>Quản lý khách hàng</Link></li>
                    </ul> */}
                    <ul className="list-none p-0 *:my-[5px] *:p-[15px] text-left *:text-white *:font-medium *:text-[14px] ">
                        {tabs.map(tab => (
                            <li
                                // hover:bg-[#AFD4FF] hover:rounded-[5px] hover:text-black
                                key={tab.name}
                                className={`${activeTab === tab.name ? 'bg-[#AFD4FF] text-black' : ""} rounded-[5px] py-1.5 `}
                                onClick={() => setActiveTab(tab.name)}
                            >
                                <Link to={tab.link} className={`px-8 py-[10px] ${activeTab === tab.name ? 'text-black' : ''}`}>
                                    {tab.name}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </aside>
                <main className="main-content w-full flex-1">
                    <div className="header">
                        <h1>Danh sách danh mục</h1>
                    </div>
                    <div className="breadcrumb">
                        <span>Danh Sách Danh Mục / Thêm danh mục</span>
                        <span className="date-time">Thứ , Ngày/Tháng/Năm - Giờ/Phút/Giây</span>
                    </div>
                    {/* <div className="form">
                        <div className="form-group">
                            <label>Mã danh mục</label>
                            <input type="text" value="Tự tăng" disabled />
                        </div>
                        <div className="form-group">
                            <label>Tên danh mục</label>
                            <input
                                type="text"
                                value={categoryName}
                                onChange={(e) => setCategoryName(e.target.value)}
                            />
                        </div>
                        <button onClick={addCategory} className="btn btn-add">Thêm mới</button>
                        <button className="btn btn-list">Danh sách</button>
                    </div> */}
                    {/* <ul className="category-list">
                        {categories.map((category) => (
                            <li key={category.id}>{category.name}</li>
                        ))}
                    </ul> */}
                    <Outlet />
                </main>
            </div>
        </>
    )
}
export default AdminLayout