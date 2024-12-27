import mongoose from "mongoose"

const noteSchema = mongoose.Schema({
    title:{type:String, required:true},
    status:{type:Boolean, required:true},
    content:{type:String, required:true},
    userId: {type:mongoose.Schema.Types.ObjectId, ref:"User", required:true}
}, {timestamps:true})

const NoteModel = mongoose.model("Note", noteSchema)

export {NoteModel}