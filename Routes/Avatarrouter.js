import express from "express";
import upload from "../Middleware/Multer.js"; // Multer middleware for file upload
import { uploadAvatar, getAvatar,fetchAllAvatars} from "../Controllers/Avatarcontroller.js";
import UserAuth from "../Middleware/userAuth.js";

const avatarRouter = express.Router();

// Upload avatar (single file field: "avatar")
avatarRouter.post("/upload", UserAuth, upload.single("file"), uploadAvatar);


// Get current user's avatar
avatarRouter.get("/", UserAuth, getAvatar);
avatarRouter.get("/all", fetchAllAvatars)

export default avatarRouter;
