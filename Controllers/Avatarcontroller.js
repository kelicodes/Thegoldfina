import { generateAnimeAvatar } from "../Middleware/Anime.js";
import Avatar from "../Models/Avatar.js";
import cloudinary from "cloudinary";
import fs from "fs";

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Upload avatar details and original image only
export const uploadAvatar = async (req, res) => {
  try {
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

    if (!req.file) {
      return res.status(400).json({ success: false, message: "No image uploaded" });
    }

    // Upload original image to Cloudinary
    const originalResult = await cloudinary.v2.uploader.upload(req.file.path, {
      folder: "wardrobe_original",
    });

    // Save profile data to DB without anime version yet
    const newAvatar = new Avatar({
      user: req.user._id,
      originalImage: originalResult.secure_url,
      imageUrl: "", // Anime version will be generated later
      height,
      weight,
      clothingSize,
      shoeSize,
      favoriteColor,
      stylePreference,
      budgetRange,
      bodyType,
    });

    await newAvatar.save();

    // Remove local file
    fs.unlinkSync(req.file.path);

    res.status(201).json({
      success: true,
      message: "Profile saved! Animated avatar will be created in ~5 mins",
      avatar: newAvatar,
    });

    // Optional: trigger async avatar generation (e.g., queue or background worker)
    // generateAnimeAvatar(newAvatar._id, originalResult.secure_url);

    generateAnimeAvatar(newAvatar._id, originalResult.secure_url);

        fs.unlinkSync(req.file.path);

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Avatar upload failed" });
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
