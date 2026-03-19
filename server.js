import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoute from "./routes/auth.js";
import { connectDB } from "./config/db.js";
import tutorRoute from "./routes/tutor.js";
import adminRoute from "./routes/admin.js";
import parentRoute from "./routes/parent.js";
import paymentRoute from "./routes/payment.js";
import "./utils/paymentCron.js";
import "./utils/releaseTutorEarnings.js";
import logger from "./middlewares/logger.js";
import { initPlatformSettings } from "./utils/initPlatformSettings.js";
dotenv.config();
connectDB();


const app = express();
const port = process.env.PORT;
await initPlatformSettings();
app.use(logger); 
app.use(express.json());

// app.use(
//   cors({
//     origin: true,
//     credentials: true,
//   }),
// );
app.use(
  cors({
    origin: [
      "http://localhost:4000",
      "https://eduflow-2nd-project-front-end.vercel.app",
    ],
    credentials: true,
  })
);



app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("hello guysss");
});
app.use("/tutor", tutorRoute);
app.use("/auth", authRoute);
app.use("/admin", adminRoute);
app.use("/parent", parentRoute);
app.use("/payments", paymentRoute);
app.listen(port, () => {
  console.log(`your port is running on http://localhost:${port}`);
});
