const mongoose = require('mongoose')
const userModel = require("../models/userModel");
const bookModel = require("../models/bookModel");
const Valid = require("../validation/validation");
const { isValidObjectId } = require("mongoose");



const createBook = async function (req, res) {
try{

const reqBody = req.body


if (!Valid.isValidRequestBody(reqBody)) {
    return res.status(400).send({ status: false, msg: " Please Provide RequestBody" });
}
const { title, excerpt, userId, ISBN, category, subcategory, releasedAt } = reqBody;

//title validation
if (!Valid.isValid(title)) {
    return res.status(400).send({ status: false, msg: " Pls Provide title for user" });
  }
// if (!Valid.isValidtitle(title)) {
//     return res.status(400).send({ status: false, msg: " Pls Provide specific title for user" });
//   }
const titleAlreadyExist = await bookModel.findOne({ title })
if(titleAlreadyExist){
    return res.status(400).send({ status: false, msg: "Title is already exist " });

}
//excerpt validation
if (!Valid.isValid(excerpt)) {
    return res.status(400).send({ status: false, msg: " Pls Provide excerpt" });
}
//userId validation
if (!Valid.isValid(userId)) {
    return res.status(400).send({ status: false, msg: " Pls Provide userId" });
  }
  if (!isValidObjectId(userId)) {
    return res.status(400).send({ status: false, msg: " Pls provide Valid  userId" })
}
const useridExist= await userModel.findOne({ _id: userId})
if (!useridExist) {
    return res.status(409).send({ status: false, msg: "userId does not exist" });
  }

//ISBN validation
if (!Valid.isValid(ISBN)) {
    return res.status(400).send({ status: false, msg: " Pls Provide ISBN" });
  }



const ISBNalreadyExist = await bookModel.findOne( { ISBN: ISBN });
if(ISBNalreadyExist){
    return res.status(400).send({ status: false, msg: "ISBN is already exist" });

}

//category
if (!Valid.isValid(category)) {
    return res.status(400).send({ status: false, msg: " Pls Provide category" });
  }
//subcategory
  if (!Valid.isValid(subcategory)) {
    return res.status(400).send({ status: false, msg: " Pls Provide subcategory" });
  }
//releasedAt 
if (!Valid.isValid(releasedAt)) {
    return res.status(400).send({ status: false, msg: " Pls Provide release date" });
  }
//"YYYY-MM-DD" validation


// book creation
const Books = await bookModel.create(reqBody)
return res.status(201).send({ status: true, msg: " Success", data: Books });

}catch(error){
    return res.status(500).send({ status: false, msg: error.message });

}


}


const getBooks = async function(req,res){
  try{

    const allBooks= await bookModel.find({isDeleted:false}).sort({ title:1 }).select({_id:1, title:1, excerpt:1, userId:1, category:1,releasedAt:1, reviews:1})
     const queryParamInURL = req.query;
     if(queryParamInURL){
       let { userId, category, subcategory } = queryParamInURL
       let obj ={}
       if(Valid.isValid(userId) && isValidObjectId(userId)){
        obj.userId = userId
       }
       if(Valid.isValid(category)){
        obj.category = category
       }
       if(Valid.isValid(subcategory)){
        obj.subcategory = subcategory
       }
       obj.isDeleted=false
       const books1= await bookModel.find(obj).sort({ title:1 }).select({_id:1, title:1, excerpt:1, userId:1, category:1,releasedAt:1, reviews:1})
       if (!books1) {
        return res.status(400).send({ status: false, msg: "given data is invalid " })
       }
       else{
        return res.status(200).send({ status: true,msg: "Success" , data: books1 })

       }
     }else{
      return res.status(200).send({ status: true,msg: "Success" , data: allBooks })

     }



  }catch(error){
    return res.status(500).send({ status: false, msg: error.message });

  }
}



module.exports = { createBook, getBooks };

