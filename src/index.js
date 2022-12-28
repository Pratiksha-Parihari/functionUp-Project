const express=require("express")
const route=require("./route/route")
const mongoose=require("mongoose")
const app=express()
app.use(express.json())
const multer = require('multer')
app.use(multer().any())

mongoose.connect("mongodb+srv://Pratiksha:y6paZ3tHuMOGl4Xw@cluster0.o0zvusb.mongodb.net/project-5-db?retryWrites=true&w=majority",
{useNewUrlParser:true})

.then(()=>console.log("MongoDb is Connected"))
.catch(err=>console.log(err))

app.use('/',route)

app.listen(process.env.PORT || 3000, function(){
    console.log("express app running on port "+(process.env.PORT || 3000))
})