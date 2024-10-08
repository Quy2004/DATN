import Size from "../models/Size.js"

class SizeController{
    // hiển thị toàn bộ danh mục

    async getAllSize(req, res){
        try {
            const size= await Size.find({})
            res.status(200).json({
                message: "Get Size Done",
                data: size
            })
        } catch (error) {
           res.status(400).json({message: error.message}) 
        }
    }

    // hiển thị chi tiết 1 danh mục
    async getSizeById(req, res){
        try {
            const {id}= req.params;
            const size= await Size.findById(id);
            if(!size){
                return res.status(404).json({message: "Size không tìm thấy"})
            }
            res.status(200).json({
                message: "Get Size Details Done",
                data: size
            })
        } catch (error) {
            res.status(400).json({message: error.message})
        }
    }

    // thêm mới size
    async createSize(req, res) {
        try {
            // Thêm giá trị mặc định cho priceSize nếu nó không có trong request body
            const { name, priceSize = null, status = "active" } = req.body;
    
            const size = await Size.create({ name, priceSize, status });
    
            res.status(201).json({
                message: "Create Size Successfully",
                data: size
            });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
    

    
}

export default SizeController