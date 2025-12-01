import express from "express";
import upload from "../Middleware/Multer.js"; // Cloudinary middleware
import { 
  fetchproduct, 
  fetchproducts, 
  productUpload, 
  removeProduct,
  fetchProductsByCategory 
} from "../Controllers/Productcontroller.js";
import redis from "redis";

const productRouter = express.Router();

// ------------------ Redis Setup ------------------
const redisClient = redis.createClient({ url: process.env.REDIS_URL || "redis://localhost:6379" });

redisClient.on("error", (err) => console.log("Redis Client Error", err));
redisClient.connect();

// ------------------ Routes ------------------

// Upload product images
productRouter.post(
  "/upload",
  upload.fields([
    { name: "image1", maxCount: 1 },
    { name: "image2", maxCount: 1 },
    { name: "image3", maxCount: 1 },
    { name: "image4", maxCount: 1 },
  ]),
  productUpload
);

// Fetch a single product
productRouter.get("/fetch/:productId", fetchproduct);

// Fetch all products with Redis caching
productRouter.get("/fetch", async (req, res) => {
  const cacheKey = "all_products";

  try {
    // Check Redis cache first
    const cachedProducts = await redisClient.get(cacheKey);
    if (cachedProducts) {
      console.log("Serving products from Redis cache");
      return res.json({ products: JSON.parse(cachedProducts) });
    }

    // Fetch from MongoDB using existing controller
    const products = await fetchproducts(req, res, true); // true = return data instead of sending response

    // Cache the result in Redis for 10 minutes (600 seconds)
    await redisClient.setEx(cacheKey, 600, JSON.stringify(products));

    console.log("Serving products from MongoDB and caching to Redis");
    res.json({ products });
  } catch (err) {
    console.error("Error fetching products:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Delete a product
productRouter.delete("/remove/:itemId", removeProduct);

// Fetch products by category
productRouter.get("/category/:cat", fetchProductsByCategory);

export default productRouter;
