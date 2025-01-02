import express from "express"
import { UserModel } from "../model/user.model.js"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import nodemailer from "nodemailer"
import dotenv from "dotenv"

dotenv.config()

const userRouter = express.Router()

userRouter.use(express.json())


// Register new use route
userRouter.post('/register',(req,res)=>{
    const {name, email, password, gender} = req.body 
    try {
        bcrypt.hash(password, 3, async function(err, hash){
            if(err){
                console.log(err);
                
                return res.status(500).json({message:"Error in hashing password", err})
            }
            else{
                const user = new UserModel({
                    name,
                    email,
                    password:hash,
                    gender
                })
                await user.save()
                res.status(200).json({message:"User Registered successfully"})
            }
        })
    } catch (error) {
        console.log(error);
        
        res.status(500).json({message:"Error in user creating"})
    }
})


// Login user route
userRouter.post('/login', async(req,res)=>{
    const {email, password} = req.body
    try {
        const user = await UserModel.findOne({email:email})
        if(!user){
            return res.status(500).json({message:"User not found"})
        }
        bcrypt.compare(password, user.password, function(err, result){
            if(result){
                const token = jwt.sign({id:user._id}, process.env.JWT_SECRET_KEY, {expiresIn:"1h"})
                res.status(200).json({message:"User logged in successfully", token})
            }
            else{
                res.status(500).json({message:"Invalid password"})
            }
        })
    } catch (error) {
        res.status(500).json({message:"Invalid credentials"})
    }

})


// forgot-password route
userRouter.post("/forgot-password", async(req, res)=>{
    const {email} = req.body 
    try {
        const user = await UserModel.findOne({email})
        if(!user){
            return res.status(500).json({message:"User not found"})
        }
        const resetToken = jwt.sign({id:user._id}, process.env.JWT_SECRET_KEY, {expiresIn:"1h"})
        user.resetPasswordToken = resetToken
        user.resetPasswordExpires = Date.now() + 3600000 // Token valid for 1 hour
        await user.save()

        //sending mail 
        const transporter = nodemailer.createTransport({
            service:"gmail",
            auth:{
                user:process.env.EMAIL,
                pass:process.env.PASSWORD
            }
        })

    const resetURL = `https://devnoteapp.onrender.com/user/reset-password/:token${resetToken}`;
    const message = `Click this link to reset your password: ${resetURL}`;

    await transporter.sendMail({
        to:user.email,
        subject:"Password Reset",
        text:message
    })
        
    res.status(200).json({ message: 'Password reset email sent', resetToken })
    } catch (error) {
        res.status(500).json({message:`Error in sending email ${error}`})
    }
})


// reset-password route
userRouter.post("/reset-password/:token", async(req, res)=>{
    const {token} = req.params
    const {newPassword} = req.body
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY)
        const user = await UserModel.findOne({
            _id:decoded.id,
            resetPasswordToken:token,
            resetPasswordExpires:{$gt:Date.now()}
        })

        if(!user){
            return res.status(500).json({message:"Invalid or expired token"})
        }

        const hashedPassword = await bcrypt.hash(newPassword, 3)
        user.password = hashedPassword 
        user.resetPasswordToken = undefined
        user.resetPasswordExpires = undefined
        await user.save()
        res.status(200).json({message:"Password reset successfully"})
    } catch (error) {
        res.status(500).json({message:`Error in resetting password ${error}`})
    }
})

// testing route
userRouter.get("/test", (req, res)=>{
    res.status(200).json({message:"User route working"})
})


export {userRouter}