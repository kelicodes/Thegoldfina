import express from "express";
import { stkPush, mpesaCallback } from "../Controllers/mpesaController.js";

const Paybillrouter = express.Router();

// === STK PUSH ===
Paybillrouter.post("/stkpush", stkPush);

// === CALLBACK (Safaricom sends POST here) ===
Paybillrouter.post("/callback", mpesaCallback);

export default Paybillrouter;
