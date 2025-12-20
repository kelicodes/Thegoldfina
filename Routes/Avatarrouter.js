// routes/avatarRoutes.js
import express from "express";
import { uploadAvatar, getAvatar } from "../Controllers/Avatarcontroller.js"; 
import UserAuth from "../Middleware/userAuth.js";
import fileUpload from "express-fileupload";

const avatarRouter = express.Router();

// Middleware for handling file uploads
avatarRouter.use(
  fileUpload({
    useTempFiles: true, // stores uploaded files temporarily
    tempFileDir: "/tmp/", // optional temp directory
  })
);

// ======== Upload Avatar ========
avatarRouter.post("/upload", UserAuth, uploadAvatar);

// ======== Get User Avatar ========
avatarRouter.get("/", UserAuth, getAvatar);

export default avatarRouter;
