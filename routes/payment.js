
import express from "express";
import { createOrder,verifyFirstPayment,verifyNextPayment,getParentPayments } from "../controllers/tutor/payment.js";
const router = express.Router();

import { protect } from "../middlewares/auth.js";
router.post("/create-order",protect(["parent"]), createOrder);
router.post("/verify-first", protect(["parent"]), verifyFirstPayment);
router.post("/verify-next", protect(["parent"]), verifyNextPayment);
router.get("/parent/payments", protect(["parent"]), getParentPayments);

export default router;