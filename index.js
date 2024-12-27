import express from "express"
import dotenv from "dotenv"
import { connection } from "./config/db.js"
import { userRouter } from "./route/user.route.js"
import { noteRouter } from "./route/note.route.js"
import auth from "./middleware/auth.middleware.js"

import cors from "cors"

dotenv.config()

const app = express()
app.use(cors({
    origin:"*"
}))

app.use(express.json())
app.use('/user', userRouter)
app.use('/note', auth, noteRouter)

app.get('/', (req, res)=>{
    res.send("hello home")
})



app.listen(process.env.PORT, async()=>{
    try {
        await connection
        console.log(`Server is running on port ${process.env.PORT} and connected to db`);
    } catch (error) {
        console.log("Some error in connecting to db", error);
        
    }
    
    
})



