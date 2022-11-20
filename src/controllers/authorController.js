const authorModel = require("../models/authorModel")
const valid = require("../validations/validator")
const jwt =require("jsonwebtoken")

const createAuthor = async function (req, res)  {

    try {

        const requestBody = req.body
        const {title, fName, lName, email, password } = requestBody

        if (!valid.isValidRequestBody(requestBody)) {
          return  res.status(400).send({ status: false, msg: " Pls Provide RequestBody" })
        }

        if (!valid.isValid(title)) {
           return res.status(400).send({ status: false, msg: "Title is Mandatory" })
        }
        if (!valid.isValidtitle(title)) {
            return  res.status(400).send({ status: false, msg: "Title Should be Mr,Miss,Mrs" })
        }

        if (!valid.isValid(fName)) {
            return  res.status(400).send({ status: false, msg: "Pls Provide First Name of Author" })
        }

        if (!valid.regxName(fName)) {
            return  res.status(400).send({ status: false, msg: "Pls give first Name  in Alphabets" })
        }
        if (!valid.isValid(lName)) {
            return  res.status(400).send({ status: false, msg: "Pls Provide Last Name of Author" })
        }
        if (!valid.regxName(lName)) {
            return  res.status(400).send({ status: false, msg: "Pls give last Name  in Alphabets" })
        }
        if (!valid.isValid(email)) {
            return  res.status(400).send({ status: false, msg: "email is Mandatory" })
        }
        if (!valid.isValidEmail(email)) { 
        
            return  res.status(400).send({ status: false, msg: "Invalid email address" })
        }

        const emailAlreadyUsed = await authorModel.findOne({ email: email })
        if (emailAlreadyUsed) {
            return res.status(400).send({ status: false, msg: " email id already used" })
        }
        if (!valid.isValid(password)) {
            return res.status(400).send({ status: false, msg: " pls provide password" })
        }

        const authorCreation = await authorModel.create(requestBody)
        res.status(201).send({ status: true, Data: authorCreation, msg: " Author Creation Successfull" })

    }
    catch (err) {
        return res.status(500).send({ status: false, msg: err.msg })

    }

}

//+++++++++++++++++++++++++  Author login  +++++++++++++++++++++++++++++++++++
   const authorLogin= async function(req,res){
    try{

       let email=req.body.email
       let password=req.body.password

       if(!valid.isValid(email)){
        return res.status(404).send({status:false,msg:"Pls provide email address"})

       }
       if(!valid.isValidEmail(email)){
        return res.status(404).send({status:false,msg:"Pls provide valid email address"})

       }
       if(!valid.isValid(password)){
        return res.status(404).send({status:false,msg:"Pls provide password"})
       }

       if(email&&password){
         const userDetails = await authorModel.findOne({email:email,password:password})
       
          if(userDetails){
            const token =   jwt.sign({authorId:userDetails._id},"mavrik")
                return res.status(200).send({status:true,msg:"Token generated Successfully",token:token})
        
          }else{
            return res.status(401).send({status:false,msg:"Invalid Credentials"})
          }
            
       }
    }
    catch(err){
        return res.status(500).send({status:false,msg:"Server Error "})
    }



   }

module.exports = { createAuthor ,authorLogin}  



