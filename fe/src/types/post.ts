export interface Post {
    _id: string;
    title: string;
    categoryPost: {
        title: string;
    };
    excerpt ?: string;
    imagePost: string;
    isDeleted: boolean;
    createdAt ?: string;
    updatedAt ?: string;
}