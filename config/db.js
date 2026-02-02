import mongoose from 'mongoose';

export const connectDB =async()=>{
    try{
        await mongoose.connect(process.env.MONGO_URL);
        console.log("mongoDb connected")
    }catch(err){
        console.error("DB error: ",err.message);
        process.exit(1);
    }
}
