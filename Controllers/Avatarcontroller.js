// controllers/Avatarcontroller.js
import Avatar from "../Models/Avatar.js";
import fs from "fs";
import cloudinary from "cloudinary";

// Configure Cloudinary
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ======== Upload Avatar ========
export const uploadAvatar = async (req, res) => {
  try {
    const { height, weight, bodyShape } = req.body;

    if (!req.file) {
      return res.status(400).json({ success: false, message: "No avatar uploaded" });
    }

    // Upload to Cloudinary
    const result = await cloudinary.v2.uploader.upload(req.file.path, {
      folder: "wardrobe_avatars",
      transformation: [{ width: 500, height: 1500, crop: "limit" }],
    });

    // Remove temp file from server
    fs.unlinkSync(req.file.path);

    // Save avatar in DB
    const newAvatar = new Avatar({
      user: req.user._id,
      imageUrl: result.secure_url,
      height,
      weight,
      bodyShape,
    });

    await newAvatar.save();

    return res.status(201).json({
      success: true,
      message: "Avatar uploaded successfully",
      avatar: newAvatar,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Avatar upload failed" });
  }
};

// ======== Get User Avatar ========
export const getAvatar = async (req, res) => {
  try {
    const avatar = await Avatar.findOne({ user: req.user._id });

    if (!avatar) {
      return res.status(404).json({ success: false, message: "Avatar not found" });
    }

    return res.status(200).json({ success: true, avatar });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Failed to fetch avatar" });
  }
};
