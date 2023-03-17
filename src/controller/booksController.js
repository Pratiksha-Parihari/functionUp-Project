 const mongoose = require('mongoose');
const userModel = require("../models/userModel");
const bookModel = require("../models/booksModel");
const reviewModel = require("../models/reviewModel");
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
  //authorisation
  if (userId != req.token) {
    return res.status(403).send({ status: false, message: "Unauthorized access ! User's credentials do not match." })
}

//ISBN validation
if (!Valid.isValid(ISBN)) {
    return res.status(400).send({ status: false, msg: " Pls Provide ISBN" });
  }
  if (!Valid.isValidISBN(ISBN)) {
    return res.status(400).send({ status: false, msg: " Pls Provide correct ISBN " });
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
if (!Valid.isValidDate(releasedAt)) {
  return res.status(400).send({ status: false, msg: " Pls Provide release date in proper YYYY-MM-DD format" });
}

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
     
     if(!allBooks){
       return res.status(404).send({ status: false, msg: "No books found" });

    }
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
       obj.isDeleted = false
       const books1= await bookModel.find(obj).sort({ title:1 }).select({_id:1, title:1, excerpt:1, userId:1, category:1,releasedAt:1, reviews:1})
       if (!books1) {
        return res.status(404).send({ status: false, msg: "book details not found" })
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

const getBooksById = async function(req,res){
  try{
    const bookId= req.params.bookId
    if (!isValidObjectId(bookId)) {
      return res.status(400).send({ status: false, msg: " Pls provide Valid book Id" })
    }
    const bookExist = await bookModel.findById({ _id:bookId, isDeleted:false })

     if(!bookExist){
        return res.status(404).send({status:false, msg: 'Book does not exist'})
      }
      const allReview= await reviewModel.find( { bookId:bookId, isDeleted:false })
      const data = bookExist.toObject()
      data['reviewsData'] = allReview
      return res.status(200).send({status:true, msg: 'Success' , data:data })

  }catch(error){
    return res.status(500).send({ status: false, msg: error.message });
  }
}

const updateBooks = async function(req,res){
try{
  const bookId= req.params.bookId
  const reqBody=req.body
  if (!isValidObjectId(bookId)) {
    return res.status(400).send({ status: false, msg: " Pls provide Valid book Id" })
  }
  let { title, excerpt, releasedAt, ISBN } = reqBody
  if (!Valid.isValidRequestBody(reqBody)) {
    return res.status(400).send({ status: false, msg: " Please Provide RequestBody" });
}

// if (!(title || excerpt || releasedAt || ISBN)) {
//   return res.status(400).send({ status: false, message: "Invalid key to update Book." })
// }
if(title){
if (!Valid.isValid(title)) {
  return res.status(400).send({ status: false, msg: " Pls Provide title for user" });
}}
let checkTitle = await bookModel.findOne({ title: title })
        if (checkTitle) {
            return res.status(400).send({ status: false, message: "Title already used" })
        }
        let newTitle=req.body.title
    if (!Valid.isValid(excerpt)) {
          return res.status(400).send({ status: false, msg: " Pls Provide excerpt for user" });
        }
      let newexcerpt= req.body.excerpt
      if(ISBN){
    if (!Valid.isValid(ISBN)) {
        return res.status(400).send({ status: false, msg: " Pls Provide ISBN" });
      }
    if (!Valid.isValidISBN(ISBN)) {
        return res.status(400).send({ status: false, msg: " Pls Provide correct ISBN " });
      }}
      let checkISBN = await bookModel.findOne({ ISBN: ISBN })
      if (checkISBN) {
          return res.status(400).send({ status: false, message: "ISBN already used" })
      }
      let newIsbn = req.body.ISBN
      if(releasedAt){

      if (!Valid.isValid(releasedAt)) {
        return res.status(400).send({ status: false, msg: " Pls Provide release date" });
      }
    if (!Valid.isValidDate(releasedAt)) {
      return res.status(400).send({ status: false, msg: " Pls Provide release date in proper YYYY-MM-DD format" });
    }}
    let newDate = req.body.releasedAt
    const findBook = await bookModel.findOne({ _id: bookId, isDeleted: false })
    if(!findBook){
      return res.status(404).send({ status: false, message: "Book does not exist" })
    }
    const updatedBooks = await bookModel.findOneAndUpdate({_id:bookId, isDeleted:false }, {
      $set: { title: newTitle, excerpt:newexcerpt, ISBN:newIsbn, releasedAt:newDate}
    }, {new:true})
    return res.status(200).send({ status: true, message: "Book updated", data: updatedBooks })


}catch(error){
  return res.status(500).send({ status: false, msg: error.message });

}
}



const deleteBookById = async function(req,res){
try{
 let bookId = req.params.bookId
 

 if (!isValidObjectId(bookId)) {
  return res.status(400).send({ status: false, msg: " Pls provide Valid book Id" })
}

const bookExist = await bookModel.findOne({ _id:bookId, isDeleted:false })

if(!bookExist){
  return res.status(404).send({status:false, msg: 'Book does not exist'})
}

// authorisation
//  if(!bookExist.userId !== userId){
//    return res.status(403).send({status:false, msg: 'Unauthorized access! user not allowed to acess'})

// }
const deleteBook= await bookModel.findOneAndUpdate( {_id: bookId },{ $set: { isDeleted:true, deletedAt:new Date()}} )

  return res.status(200).send({status:true, msg: 'Book deleted successfully'})


}catch(err){
  return res.status(500).send({ status: false, msg: err.message });
}
}



module.exports = { createBook, getBooks, getBooksById ,updateBooks, deleteBookById};

