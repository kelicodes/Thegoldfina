import express from "express";
import  UserAuth from "../Middleware/userAuth.js"
import {
  createOrder,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
  getAllOrders,
  checkPaymentStatus
} from "../Controllers/Orderscontroller.js"

const OrderRouter = express.Router();

OrderRouter.post("/create", UserAuth, createOrder);
OrderRouter.get("/userorders", UserAuth, getUserOrders);
OrderRouter.get('/all',UserAuth,getAllOrders)
OrderRouter.get("/:orderId", UserAuth, getOrderById);
OrderRouter.put("/:orderId/status", UserAuth, updateOrderStatus); // Admin logic optional
// Check payment status
OrderRouter.get("/check-payment/:checkoutRequestID", UserAuth, checkPaymentStatus);


// This will handle Safaricom callback after STK push
OrderRouter.post("/mpesa/callback", async (req, res) => {
  try {
    const data = req.body;

    // Extract necessary info
    const checkoutRequestID = data.Body.stkCallback.CheckoutRequestID;
    const resultCode = data.Body.stkCallback.ResultCode;

    // Find the order
    const order = await Order.findOne({ checkoutRequestID });
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    // Update status if payment successful
    if (resultCode === 0) {
      order.status = "Completed";
      await order.save();
      console.log(`Order ${order._id} marked as Completed.`);
    } else {
      console.log(`STK push failed for order ${order._id}`);
    }

    res.json({ success: true });
  } catch (err) {
    console.error("MPESA callback error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});
// PATCH /orders/update-checkout/:orderId
OrderRouter.patch("/update-checkout/:orderId", UserAuth, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { checkoutRequestID } = req.body;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    order.checkoutRequestID = checkoutRequestID;
    await order.save();

    res.json({ success: true, message: "CheckoutRequestID saved." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});



export default OrderRouter;
