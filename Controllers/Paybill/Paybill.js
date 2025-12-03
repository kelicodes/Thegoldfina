import axios from "axios";
import moment from "moment";
import dotenv from "dotenv";
dotenv.config();

// ======================== PHONE FORMATTER ========================
const formatPhone = (phone) => {
  let p = phone.toString().trim();
  p = p.replace(/\s+/g, ""); // remove spaces

  if (p.startsWith("+254")) {
    p = p.replace("+", "");
  }

  if (p.startsWith("0")) {
    p = "254" + p.substring(1);
  }

  if (p.startsWith("7")) {
    p = "254" + p;
  }

  return p;
};

// ======================== ACCESS TOKEN ===========================
export const getAccessToken = async () => {
  const consumerKey = process.env.MPESA_KEY;
  const consumerSecret = process.env.MPESA_SECRET;
  const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64");

  try {
    const res = await axios.get(
      "https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
      { headers: { Authorization: `Basic ${auth}` } }
    );

    return res.data.access_token;
  } catch (err) {
    console.error("Access Token Error:", err.response?.data || err.message);
    throw new Error("Failed to get access token");
  }
};

// ======================== STK PUSH (PAYBILL) =====================
export const stkPush = async (req, res) => {
  try {
    const { phone, amount } = req.body;

    if (!phone || !amount) {
      return res.status(400).json({ success: false, message: "Phone and amount are required" });
    }

    const phoneFormatted = formatPhone(phone);

    const accessToken = await getAccessToken();
    const paybill = process.env.MPESA_SHORTCODE;
    const passkey = process.env.MPESA_PASSKEY;
    const accountNumber = process.env.MPESA_ACCOUNT;

    const timestamp = moment().format("YYYYMMDDHHmmss");
    const password = Buffer.from(paybill + passkey + timestamp).toString("base64");

    const data = {
      BusinessShortCode: paybill,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: amount,
      PartyA: phoneFormatted,
      PartyB: paybill,
      PhoneNumber: phoneFormatted,
      CallBackURL: process.env.MPESA_CALLBACK_URL,
      AccountReference: accountNumber,
      TransactionDesc: "Online payment"
    };

    const response = await axios.post(
      "https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
      data,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        }
      }
    );

    return res.status(200).json({
      success: true,
      CheckoutRequestID: response.data.CheckoutRequestID,
      MerchantRequestID: response.data.MerchantRequestID,
      message: "STK Push sent"
    });

  } catch (err) {
    console.error("STK Error:", err.response?.data || err.message);
    return res.status(500).json({ success: false, error: err.response?.data || err.message });
  }
};

// ======================== CALLBACK HANDLER =======================
export const mpesaCallback = async (req, res) => {
  try {
    const callbackData = req.body;

    console.log("========== M-PESA CALLBACK RECEIVED ==========");
    console.log(JSON.stringify(callbackData, null, 2));

    const result = callbackData?.Body?.stkCallback;
    if (!result) return res.status(400).send("Invalid callback");

    const {
      MerchantRequestID,
      CheckoutRequestID,
      ResultCode,
      ResultDesc,
      CallbackMetadata
    } = result;

    if (ResultCode !== 0) {
      console.log("❌ Payment Failed:", ResultDesc);

      return res.status(200).json({
        message: "Callback received",
        status: "failed",
        MerchantRequestID,
        CheckoutRequestID,
        ResultDesc
      });
    }

    let Amount, MpesaReceiptNumber, TransactionDate, PhoneNumber;

    if (CallbackMetadata && CallbackMetadata.Item) {
      const items = CallbackMetadata.Item;
      Amount = items.find(i => i.Name === "Amount")?.Value;
      MpesaReceiptNumber = items.find(i => i.Name === "MpesaReceiptNumber")?.Value;
      TransactionDate = items.find(i => i.Name === "TransactionDate")?.Value;
      PhoneNumber = items.find(i => i.Name === "PhoneNumber")?.Value;
    }

    console.log("✅ PAYMENT SUCCESS");
    console.log({ Amount, MpesaReceiptNumber, PhoneNumber, TransactionDate });

    // MUST SEND SUCCESS RESPONSE
    res.status(200).json({ ResultCode: 0, ResultDesc: "Success" });

  } catch (err) {
    console.error("Callback Error:", err.message);
    res.status(500).send("Server Error");
  }
};
