import express from "express";
import UserController from "../controllers/user.js";

const userRouter= express.Router()
const userController= new UserController()

userRouter.get('/', userController.getAllUsers)
userRouter.patch('/:id/soft-delete', userController.deleteUser)
userRouter.patch('/:id/restore', userController.restoreUser)

export default userRouter