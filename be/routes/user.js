import express from "express";
import UserController from "../controllers/user.js";

const userRouter= express.Router()
const userController= new UserController()

userRouter.get('/', userController.getAllUsers)
userRouter.get('/:id', userController.getUserById)
// userRouter.delete('/:id', userController.deleteUserPermanently)
userRouter.patch('/:id/soft-delete', userController.deleteUser)
userRouter.patch('/:id/restore', userController.restoreUser)
// userRouter.patch('/:id/manager', userController.managerUser)
userRouter.patch('/:id/admin', userController.adminUser)
userRouter.patch('/:id/user', userController.customerUser)

export default userRouter