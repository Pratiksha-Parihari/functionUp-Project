const express=require("express")
const route=require("./route/router")
const mongoose=require("mongoose")
const app=express()
app.use(express.json())


mongoose.connect("mongodb+srv://Siddharth609:q8PCZ8BpcFz4-nc@cluster0.thktdho.mongodb.net/Project3",
{useNewUrlParser:true})

.then(()=>console.log("MongoDb is Connected"))
.catch(err=>console.log(err))

app.use('/',route)

app.listen(process.env.PORT || 3000, function(){
    console.log("express app running on port "+(process.env.PORT || 3000))
})