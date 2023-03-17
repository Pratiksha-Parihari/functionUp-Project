const internModel= require("../Models/internModel")
const collegeModel=require("../Models/collegeModel")

const createintern= async (req,res)=>{
    try{
        data=req.body
       
        //check college register or not
        let validCollege = await collegeModel.findOne({name:data.collegeName})
        if (!validCollege) return res.status(404).send({ status: false, msg: "college is not register " })
       
        // set the college id into the data object and delete key collegename
        let collegeId=validCollege._id.toString()
              data.collegeId = collegeId
        delete data.collegeName

      //create the intern
    let creatintern= await internModel.create(data);
    return res.status(201).send({status:true,data:creatintern});
    }
    catch(err){
        return res.status(500).send({status:false, message:err.message})
    }
}

module.exports.createintern=createintern;

