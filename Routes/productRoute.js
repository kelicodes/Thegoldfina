import express from "express";
import upload from "../Middleware/Multer.js"; // use cloudinary middleware
import { fetchproduct, fetchproducts, productUpload, removeProduct,fetchProductsByCategory } from "../Controllers/Productcontroller.js";

const productRouter = express.Router();

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

productRouter.get("/fetch/:productId", fetchproduct)
productRouter.get("/fetch", fetchproducts);
productRouter.delete("/remove/:itemId", removeProduct);
productRouter.get('/category/:cat',fetchProductsByCategory)

export default productRouter;
