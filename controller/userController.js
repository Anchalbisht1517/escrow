import User from "../models/User.js";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from "../models/User.js";

export const register= async(req,res)=>{
    try{
        const {firstName,lastName,email,password,role}=req.body;
        if(!firstName||!lastName||!email||!password||!role){
            return res.status(400).json({
                success:false,
                message:"All fields are mandatory"
            })
        }
        const User= await User.findOne({email});
        if(User){
            return res.status(400).json({
                success:false,
                message:"user already exists"
            })

        }
        const hashedPassword=await bcrypt.hash(10,password);
        const newUser= await User.create({
            firstName,
            lastName,
            email,
            passord:hashedPassword,
            role
        })
    }
    catch(error){
        res.status(500).json({
            success:false,
            message:error.message
        })
    }
}