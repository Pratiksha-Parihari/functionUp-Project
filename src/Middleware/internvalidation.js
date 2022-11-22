
const internModel=require('../Models/internModel')
const{isValidObjectId}=require('mongoose')
const collegeModel = require('../Models/collegeModel')
const internValidator=async (req,res,next)=>{
     try{
    
       let data=req.body
          if(Object.keys(data).length == 0){
            return res.status(400).send({status:false,message:"Please enter the body"})
          }
          if(!data.name){
             return res.status(400).send({status:false,message:"Please enter the name"})
          }
        if(!(/^[A-Za-z]+$/).test(data.name)){
            return res.status(400).send({status:false,msg:" name not valid"})
        }
           if(!data.email){
            return res.status(400).send({status:false,message:"Please enter the email"})
           }
            if(!(/[a-z0-9]+@[a-z]+\.[a-z]{2,3}/).test(data.email)){
                return res.status(400).send({status:false,msg:"email not valid"})
        }
            if(!data.mobile){
                return res.status(400).send({status:false,message:"Please enter the mobile number"})
            }
            if(!(/^[6-9]\d{9}$/).test(data.mobile)){
                return res.status(400).send({status:false,message:"Please enter valid mobile no: "})
            } 
            if(!isValidObjectId(data.collegeId)){
              return res.status(400).send({status:false,msg: "collegeId is not valid"})
          }
          const validcollege= (await collegeModel.find().select({_id:1})).map((co)=>co._id.toString())
          
          if(!validcollege.includes(data.collegeId)){
          return res.status(400).send({status:false,msg: "college is not registered"})
          }

    let inter=await internModel.findOne({email:data.email});
    if(inter){
        return res.status(400).send({status:false,message:"Allready register email"})       
    }
    let mobe=await internModel.findOne({mobile:data.mobile});
      if(mobe){
        return res.status(400).send({status:false,message:"Allready register mobile number"})
      }
       
    next();
}
catch(error){
    res.status(500).send({status:false,msg:"Server error"})
}
}

module.exports.internValidator=internValidator