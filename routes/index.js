import express from "express";

import authRoutes from "./auth.js";
import adminRoutes from "./admin.js";
import parentRoutes from "./parent.js";
import tutorRoutes from "./tutor.js";

const router = express.Router();



router.use("/auth", authRoutes);
router.use("/admin", adminRoutes);
router.use("/parent", parentRoutes);
router.use("/tutor", tutorRoutes);

export default router;