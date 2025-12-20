import cloudinary from "cloudinary";
import Avatar from "../Models/Avatar.js";

export const generateAnimeAvatar = async (avatarId, originalImageUrl) => {
  try {
    // 1️⃣ Upload original image again to apply AI background removal
    const uploadResult = await cloudinary.v2.uploader.upload(originalImageUrl, {
      folder: "wardrobe_anime",
      transformation: [
        { effect: "remove_background" }, // old-style (lower quality)
        { effect: "cartoonify:80" },       // anime/cartoon look
        { effect: "outline:100" },
        { quality: "auto" },
        { fetch_format: "auto" },
      ],
    });

    // 2️⃣ Save anime avatar URL
    await Avatar.findByIdAndUpdate(avatarId, {
      imageUrl: uploadResult.secure_url,
    });

    console.log("✅ Anime avatar with background removed generated");

  } catch (error) {
    console.error("❌ Anime generation failed:", error);
  }
};
