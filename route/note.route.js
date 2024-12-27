import express from "express"
import { NoteModel } from "../model/note.model.js"


const noteRouter = express.Router()

noteRouter.post('/create', async(req, res)=>{
    const {title, status, content} = req.body
    const userId = req.user._id

    try {
        const note = new NoteModel({
            title, status, content, userId
        })
        await note.save()
        res.status(201).json({message:"Note created successfully"})
    } catch (error) {
        res.status(500).json({message:`Error while create note ${error}`})
    }
})


noteRouter.get('/', async (req, res)=>{
    const userId = req.user._id
    try {
        const notes = await NoteModel.find({userId})
        res.status(200).json({notes})
    } catch (error) {
        res.status(500).json({message:`Error while fetching notes ${error}`})
    }
})

noteRouter.patch('/update/:id', async(req, res)=>{
    const payload = req.body
    const noteID = req.params.id
    const userId = req.user._id
    console.log(payload, noteID, userId);
    
    try {
        const note = await NoteModel.findOne({_id:noteID})
        
        
        if(note.userId.toString() ==userId.toString()){
            await NoteModel.findByIdAndUpdate({_id:noteID}, payload)
            return res.status(200).json({message:"Note updated successfully"})
        }else{
            return res.status(401).json({message:"Unauthorized"})
        }
    } catch (error) {
        res.status(500).json({message:`Error while updating note ${error}`})
    }
})

noteRouter.delete('/delete/:id', async(req, res)=>{
    const noteID = req.params.id 
    const userId = req.user._id
    
    
    try {
        const note = await NoteModel.findOne({_id:noteID})
       
        
        if(note.userId.toString()===userId.toString()){
            await NoteModel.findByIdAndDelete({_id:noteID})
            return res.status(200).json({message:"Note deleted successfully"})
        }else{
            return res.status(401).json({message:"Unauthorized"})
        }
    } catch (error) {
        res.status(500).json({message:`Error while deleting note ${error}`})
    }
})

export {noteRouter}
