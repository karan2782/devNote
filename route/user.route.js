import express from "express"
import { UserModel } from "../model/user.model.js"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import dotenv from "dotenv"

dotenv.config()

const userRouter = express.Router()

userRouter.use(express.json())

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


userRouter.post('/login', async(req,res)=>{
    const {email, password} = req.body
    try {
        const user = await UserModel.findOne({email:email})
        if(!user){
            return res.status(500).json({message:"User not found"})
        }
        bcrypt.compare(password, user.password, function(err, result){
            if(result){
                const token = jwt.sign({id:user._id}, process.env.JWT_SECRET_KEY)
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



export {userRouter}