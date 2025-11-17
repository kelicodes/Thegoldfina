import express from "express";
import  UserAuth from "../Middleware/userAuth.js"
import {
  createOrder,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
  getAllOrders
} from "../Controllers/Orderscontroller.js"

const OrderRouter = express.Router();

OrderRouter.post("/create", UserAuth, createOrder);
OrderRouter.get("/userorders", UserAuth, getUserOrders);
OrderRouter.get('/all',UserAuth,getAllOrders)
OrderRouter.get("/:orderId", UserAuth, getOrderById);
OrderRouter.put("/:orderId/status", UserAuth, updateOrderStatus); // Admin logic optional

export default OrderRouter;
