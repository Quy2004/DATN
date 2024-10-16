export interface Category {
    _id: string;
    title: string;
    slug: string;
    parent_id: string | null;
    isDeleted: boolean;
}