import {userRegistration,userSignin,logout} from "../Controllers/userController.js"
import express from "express"

const userRouter=express.Router()

userRouter.post('/login',userSignin)
userRouter.post('/reg',userRegistration)
userRouter.post("/logout",logout)


export default userRouter