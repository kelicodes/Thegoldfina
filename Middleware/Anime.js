import { v2 as cloudinary } from "cloudinary";
import Avatar from "../Models/Avatar.js";

// make sure config is done ONCE (preferably in a config file)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const generateAnimeAvatar = async (avatarId, originalImageUrl) => {
  try {
    const uploadResult = await cloudinary.uploader.upload(originalImageUrl, {
      folder: "wardrobe_anime",
      transformation: [
        { effect: "remove_background" },
        { effect: "cartoonify:80" },
        { effect: "outline:100" },
        { quality: "auto" },
        { fetch_format: "auto" }
      ],
    });

    await Avatar.findByIdAndUpdate(avatarId, {
      imageUrl: uploadResult.secure_url,
    });

    console.log("✅ Anime avatar generated");
  } catch (error) {
    console.error("❌ Anime generation faile", error);
  }
};
