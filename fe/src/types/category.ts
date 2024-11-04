export interface Category {
    _id: string;
    title: string;
    parent_id: { title: string, _id:string } | null; // Nếu không có danh mục cha, thì là null
    slug: string;
    isDeleted: boolean;
}
export interface PaginationData {
    current: number;
    pageSize: number;
}