import { CategoryPost } from "./categoryPost";

export interface Post {
    _id: string;
    title: string;
    categoryPost: CategoryPost
    excerpt: string;
    imagePost: string;
    galleryPost: string[];
    content: string;
    isDeleted: boolean;
    slug?: string;
    createdAt: string;
    updatedAt: string;
}