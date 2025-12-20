import express from "express";
import upload from "../Middleware/Multer.js"; // Multer middleware for file upload
import { uploadAvatar, getAvatar } from "../Controllers/Avatarcontroller.js";
import UserAuth from "../Middleware/userAuth.js";

const router = express.Router();

// Upload avatar (single file field: "avatar")
router.post("/upload", UserAuth, upload.single("avatar"), uploadAvatar);

// Get current user's avatar
router.get("/", UserAuth, getAvatar);

export default router;
