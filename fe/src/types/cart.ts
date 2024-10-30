export interface CartItem{
    product : string,
    quantity : number
}
export interface Cart{
    _id?: string;
    userId: string;
    products : [CartItem],
    totalprice : number
}