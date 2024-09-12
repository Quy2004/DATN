import User from "../models/user";

class UserController {
    // Hiện thị tòàn bộ danh sách người dùng
    async getAllUsers(req, res) {
        try {
            const user= await User.find({})
            res.status(200).json({
                message: "Get Users Done",
                data: user
            })
        } catch (error) {
            res.status(400).json({message: error.message})
        }
    }
    // Hiển thị chi tiết người dùng
    // async getUserById(req, res) {
    //     try {
    //         const {id}= User.findById()
    //     } catch (error) {
    //         res.status(400).json({message: error.message});
    //     }
    // }

    // Xóa người dùng(xóa mềm)
    async deleteUser(req, res){
        try {
            const {id}= req.params
            const user= await User.findById(id)
            if(!user || user.status == 'inactive'){
                res.status(400).json({message: "Người dùng không tồn tại hoặc đã bị xóa"})
            }
            user.status = 'inactive'
            await user.save()
            res.status(200).json({message: "Xóa người dùng thành công"})
        } catch (error) {
            res.status(404).json({message: error.message});
        }
    }
    // Khôi phục tài khoản 
    async restoreUser(req, res){
        try {
            const {id}= req.params
            const user= await User.findById(id)
            if(!user || user.status == 'active'){
                res.status(400).json({message: "Người dùng đang hoạt động"})
            }
            user.status = 'active'
            await user.save()
            res.status(200).json({message: "Khôi phục người dùng thành công"})
        } catch (error) {
            res.status(404).json({message: error.message});
        }
    }
}

export default UserController