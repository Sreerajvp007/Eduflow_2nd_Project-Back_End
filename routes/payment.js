import express from "express";
import { protect } from "../middlewares/auth.js";
import {
  createOrder,
  verifyFirstPayment,
  verifyNextPayment,
  getParentPayments,
} from "../controllers/payment.js";

const router = express.Router();

router.post("/create-order", protect(["parent"]), createOrder);
router.post("/verify-first", protect(["parent"]), verifyFirstPayment);
router.post("/verify-next", protect(["parent"]), verifyNextPayment);
router.get("/parent/payments", protect(["parent"]), getParentPayments);


export default router;
