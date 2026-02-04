import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from "cookie-parser";
import authRoute from './routes/auth.js';
import {connectDB} from './config/db.js'
import tutorRoute from './routes/tutor.js';
import adminRoute from './routes/admin.js';

dotenv.config()
connectDB()

const app =express();
const port =process.env.PORT
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173", 
    credentials: true,              
  })
);
app.use(cookieParser());


app.get("/",(req,res)=>{
    res.send("hello guysss")
})
app.use("/tutor",tutorRoute)
app.use("/auth",authRoute)
app.use("/admin",adminRoute)
app.listen(port,()=>{
    console.log(`your port is running on http://localhost:${port}`)
})