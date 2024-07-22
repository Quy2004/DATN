
export const Category = () => {
    return (
        <>
            <div className="form border-solid border-2 w-[1150px] mx-auto">
                <div className="title border-b-2 border-[#E8C300]">
                    <h1>Tạo Mới Danh Mục</h1>
                </div>
                <div className="form-group">
                    <label>Mã danh mục</label>
                    <input type="text" value="Tự tăng" disabled />
                </div>
                <div className="form-group">
                    <label>Tên danh mục</label>
                    <input
                        type="text"
                        // value={categoryName}
                        // onChange={(e) => setCategoryName(e.target.value)}
                    />
                </div>
                {/* <button onClick={addCategory} className="btn btn-add">Thêm mới</button> */}
                <button className="btn btn-list">Danh sách</button>
            </div>
            {/* <ul className="category-list">
                {categories.map((category) => (
                    <li key={category.id}>{category.name}</li>
                ))}
            </ul> */}
        </>
    )
}