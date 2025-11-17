import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

// ===== Get Access Token from Daraja =====
export const getAccessToken = async () => {
  const consumerKey = process.env.CONSUMER_KEY;
  const consumerSecret = process.env.CONSUMER_SECRET;

  if (!consumerKey || !consumerSecret) {
    throw new Error("Missing CONSUMER_KEY or CONSUMER_SECRET in .env");
  }

  const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64");

  try {
    const response = await axios.get(
      "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
      { headers: { Authorization: `Basic ${auth}` } }
    );

    console.log("✅ Access token generated successfully");
    return response.data.access_token;
  } catch (error) {
    console.error("❌ Error generating access token:", error.response?.data || error.message);
    throw new Error("Could not generate access token");
  }
};

// ===== STK Push Payment =====
export const lipaNaMpesaOnline = async (req, res) => {
  const { phoneNumber, amount, orderId } = req.body;

  // Validate input
  if (!phoneNumber || !amount || !orderId) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const token = await getAccessToken();

    const timestamp = new Date()
      .toISOString()
      .replace(/[-:TZ.]/g, "")
      .slice(0, 14); // YYYYMMDDHHMMSS

    const password = Buffer.from(`${process.env.SHORTCODE}${process.env.PASSKEY}${timestamp}`).toString("base64");

    const stkPushBody = {
      BusinessShortCode: process.env.SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: amount,
      PartyA: phoneNumber,
      PartyB: process.env.SHORTCODE,
      PhoneNumber: phoneNumber,
      CallBackURL: `${process.env.BACKEND_URL}/api/pesa/callback`,
      AccountReference: `Order-${orderId}`,
      TransactionDesc: "Payment for order",
    };

    console.log("📤 Sending STK Push request:", stkPushBody);

    const response = await axios.post(
      "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
      stkPushBody,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    console.log("✅ STK Push initiated successfully:", response.data);
    res.status(200).json({ message: "STK Push initiated", data: response.data });

  } catch (error) {
    console.error("❌ STK Push failed:", error.response?.data || error.message);
    res.status(500).json({ message: "Error initiating STK Push", error: error.response?.data || error.message });
  }
};

// ===== MPESA Callback =====
export const mpesaCallback = async (req, res) => {
  console.log("📩 MPESA Callback received:", JSON.stringify(req.body, null, 2));

  // Update order payment status here based on req.body.Body.stkCallback.ResultCode

  res.status(200).send("Received");
};
