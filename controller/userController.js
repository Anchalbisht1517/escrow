import User from "../models/User.js";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { sendVerificationEmail } from "../emailVerify/verifyEmail.js";

export const register= async(req,res)=>{
    try{
        const {firstName,lastName,email,password,role}=req.body;
        if(!firstName||!lastName||!email||!password||!role){
            return res.status(400).json({
                success:false,
                message:"All fields are mandatory"
            })
        }
        const user= await User.findOne({email});
        if(user){
            return res.status(400).json({
                success:false,
                message:"user already exists"
            })

        }
        const hashedPassword=await bcrypt.hash(password,10);
        const newUser= await User.create({
            firstName,
            lastName,
            email,
            password:hashedPassword,
            role
        })
        const token= jwt.sign({id: newUser._id},process.env.SECRET_KEY,{expiresIn:'1h'})
        await sendVerificationEmail({token,email});
        return res.status(200).json({
            success:true,
            message:"user registred successfully"
        })

    }
    catch(error){
        res.status(500).json({
            success:false,
            message:error.message
        })
    }
}