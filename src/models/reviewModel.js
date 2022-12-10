const mongoose=require("mongoose")
const ObjectId = mongoose.Types.ObjectId

const reviewSchema= new mongoose.Schema({
     bookId:{
        type:ObjectId,
        required:true,
        ref:"Book"
     },
     reviewedBy:{
        type:String,
        required:true,
        default:'Guest',
        trim:true
      
     },
     reviewedAt:{
        type:Date,
        required:true
     },
     rating:{
        type:Number,
        required:true,
        min:1,
        max:5
     },
     review: String,

     isDeleted:{
        type:Boolean,
        default:false
     },
     deletedAt: Date,
},{timestamps:true})

module.exports=mongoose.model("Review", reviewSchema)

