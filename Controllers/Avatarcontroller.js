// controllers/Avatarcontroller.js
import Avatar from "../Models/Avatar.js";
import fs from "fs";
import cloudinary from "cloudinary";
import axios from "axios";
import FormData from "form-data";

// Configure Cloudinary
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


// ======== Upload Avatar ========
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

    // Call DeepAI AnimeGAN API to generate anime avatar
    const formData = new FormData();
    formData.append("image", fs.createReadStream(req.file.path));

    const animeRes = await axios.post("https://api.deepai.org/api/animegan", formData, {
      headers: {
        "Api-Key": process.env.DEEP_AI_KEY, // your DeepAI key
        ...formData.getHeaders(),
      },
    });

    const animeUrl = animeRes.data.output_url;

    // Remove local temp file
    fs.unlinkSync(req.file.path);

    // Save to DB
    const newAvatar = new Avatar({
      user: req.user._id,
      imageUrl: animeUrl,
      originalImage: originalResult.secure_url,
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

    res.status(201).json({ success: true, message: "Profile saved!", avatar: newAvatar });
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
