import { generateAnimeAvatar } from "../Middleware/Anime.js";
import Avatar from "../Models/Avatar.js";
import { v2 as cloudinary } from "cloudinary";


import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Upload avatar details and original image only
export const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No image uploaded" });
    }

    const {
      height,
      weight,
      clothingSize,
      shoeSize,
      favoriteColor,
      stylePreference,
      budgetRange,
      bodyType,
    } = req.body;

    // Upload to Cloudinary
    const uploadResult = await cloudinary.v2.uploader.upload(req.file.path, {
      folder: "wardrobe_original",
    });

    // ✅ UPSERT: create if not exists, update if exists
    const avatar = await Avatar.findOneAndUpdate(
      { user: req.user._id },
      {
        user: req.user._id,
        originalImage: uploadResult.secure_url,
        imageUrl: "",
        height,
        weight,
        clothingSize,
        shoeSize,
        favoriteColor,
        stylePreference,
        budgetRange,
        bodyType,
      },
      { new: true, upsert: true }
    );

    // ✅ Delete local file ONCE
    fs.unlinkSync(req.file.path);

    // Background task (non-blocking)
    generateAnimeAvatar(avatar._id, uploadResult.secure_url);

    return res.status(201).json({
      success: true,
      message: "Profile saved successfully",
      avatar,
    });

  } catch (error) {
    console.error("UPLOAD ERROR:", error);
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
