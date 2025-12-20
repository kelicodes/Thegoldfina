import mongoose from "mongoose";

const AvatarSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  imageUrl: { type: String, required: true },        // Anime/Ghibli avatar URL
  originalImage: { type: String },                   // Original uploaded image URL
  height: { type: Number },                          // optional
  weight: { type: Number },                          // optional
  bodyShape: { type: String },                       // optional, e.g., 'apple', 'pear'
  shoeSize: { type: Number },                        // optional
  favColor: { type: String },                        // optional
  otherQuestions: { type: Map, of: String },        // optional, e.g., { "favoriteFood": "Pizza", "hobby": "Reading" }
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Avatar", AvatarSchema);
