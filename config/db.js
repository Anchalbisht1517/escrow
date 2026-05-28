import mongoose from 'mongoose';
import 'dotenv/config';

const dbConnection=async()=>{
    try{
        await mongoose.connect(process.env.MONGO_URI)
        console.log("Mongodb connected successfully");
    }
    catch(error){
        res.status(500).json({
            success:false,
            message:error.message
        })
    }
}
export default dbConnection
