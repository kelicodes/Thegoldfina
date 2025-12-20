import cloudinary from "cloudinary";
import Avatar from "../Models/Avatar.js";


export const generateAnimeAvatar = async (avatarId, originalImageUrl) => {
  try {
    // Anime-style transformation (cartoon / illustration look)
    const animeUrl = cloudinary.v2.url(originalImageUrl, {
      transformation: [
        { effect: "cartoonify:80" },
        { effect: "outline:100" },
        { quality: "auto" },
        { fetch_format: "auto" }
      ],
    });

    // Save anime avatar URL
    await Avatar.findByIdAndUpdate(avatarId, {
      imageUrl: animeUrl,
    });

    console.log("✅ Anime avatar generated");

  } catch (error) {
    console.error("❌ Anime generation failed:", error);
  }
};
