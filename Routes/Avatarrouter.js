// routes/avatarRoutes.js
import express from "express";
import upload from "../Middleware/Multer.js"; // Cloudinary Multer middleware
import { uploadAvatar, getAvatar } from "../Controllers/Avatarcontroller.js";
import UserAuth from "../Middleware/userAuth.js";

const avatarRouter = express.Router();

// ======== Upload Avatar ========
// Single file field: "avatar"
avatarRouter.post("/upload", UserAuth, upload.single("avatar"), uploadAvatar);

// ======== Get User Avatar ========
avatarRouter.get("/", UserAuth, getAvatar);

export default avatarRouter;
