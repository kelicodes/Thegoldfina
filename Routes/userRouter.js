import {userRegistration,userSignin,logout,fecthme} from "../Controllers/userController.js"
import express from "express"

const userRouter=express.Router()

userRouter.post('/login',userSignin)
userRouter.post('/reg',userRegistration)
userRouter.post("/logout",logout)
userRouter.get("/me",fecthme)


export default userRouter