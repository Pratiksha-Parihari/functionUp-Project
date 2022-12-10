const mongoose = require('mongoose')

const bookModel = require("../models/booksModel");
const reviewModel = require("../models/reviewModel");
const Valid = require("../validation/validation");
const { isValidObjectId } = require("mongoose");



const createReview = async function (req, res) {
try{

    const reqBody= req.body
    const bookId = req.params.bookId

    const { review, rating, reviewedBy } = reqBody;


    if (!Valid.isValidRequestBody(reqBody)) {
        return res.status(400).send({ status: false, msg: " Please Provide RequestBody" });
    }
    if (!Valid.isValid(bookId)) {
        return res.status(400).send({ status: false, msg: " Pls Provide bookId" });
      }
      if (!isValidObjectId(bookId)) {
        return res.status(400).send({ status: false, msg: " Pls provide Valid bookId" })
    }
    //check book exist or not ,if book does not exist there is no sense of giving reviews
    const bookExist = await bookModel.findOne({_id:bookId, isDeleted: false })
    if(!bookExist){
        return res.status(404).send({ status: false, msg: " Book does not exist " });

    }

    
      if (!Valid.isValid(rating)) {
        return res.status(400).send({ status: false, msg: " Pls Provide rating" });
      }
      if(rating<1 || rating>5){
        return res.status(400).send({ status: false, msg: " Pls Provide rating lies between 1 to 5" });
      }
      if(!Valid.isValidRating(rating)){
        return res.status(400).send({ status: false, msg: " Pls Provide rating in number " });

      }
      //if review available then required reviewer's name
      if (!reviewedBy) {
        req.body.reviewedBy = "Guest"
    }else{
        if (!Valid.isValid(reviewedBy)) {
          return res.status(400).send({ status: false, msg: " Pls Provide reviewer's name " });
        }
        req.body.reviewedBy = reviewedBy.replace(/\s+/g, ' ')

    }
      const review1 = await reviewModel.create({ bookId, reviewedBy, reviewedAt:new Date(), rating, review })

      //  const book1= bookExist.toObject()
       bookExist.reviews= bookExist.reviews+1
          await bookExist.save()
          const book1=bookExist.toObject()
       book1['reviewsData'] = review1
      return res.status(201).send({ status: true, msg: 'Review added successfully', data: book1})


}catch(error){
    return res.status(500).send({ status: false, msg: error.message });

}
}

const updateReview = async function(req,res){
  try{

    const reqBody= req.body
    const bookId = req.params.bookId
    const reviewId = req.params.reviewId

    if (!isValidObjectId(bookId)) {
      return res.status(400).send({ status: false, msg: " Pls provide Valid bookId" })
  }
  const bookExist = await bookModel.findOne({ _id:bookId, isDeleted:false })
  if(!bookExist){
    return res.status(404).send({ status: false, msg: " Book does not exist " });

}
if (!isValidObjectId(reviewId)) {
  return res.status(400).send({ status: false, msg: " Pls provide Valid reviewId" })
}

const reviewExist = await reviewModel.findOne({ _id:reviewId, bookId:bookId, isDeleted:false })
if(!reviewExist){
  return res.status(404).send({ status: false, msg: " Books are not reviewed " });

}

const { review, rating, reviewedBy }= reqBody

if (!Valid.isValidRequestBody(reqBody)) {
  return res.status(400).send({ status: false, msg: " Please Provide RequestBody" });
}
if(rating){
if (!Valid.isValid(rating)) {
  return res.status(400).send({ status: false, msg: " Pls Provide rating" });
}
if(rating<1 || rating>5){
  return res.status(400).send({ status: false, msg: " Pls Provide rating lies between 1 to 5" });
}
if(!Valid.isValidRating(rating)){
  return res.status(400).send({ status: false, msg: " Pls Provide rating in number " });

}}
let newRating = req.body.rating
if(reviewedBy){
if (!Valid.isValid(reviewedBy)) {
  return res.status(400).send({ status: false, msg: " Pls Provide the reviewer's name" });
}}
let newReviewer= req.body.reviewedBy
if (!Valid.isValid(review)) {
  return res.status(400).send({ status: false, msg: " Pls Provide some review" });
}
let newReview = req.body.review

let updatedReview = await reviewModel.findOneAndUpdate({ _id:reviewId, isDeleted:false}, {
  $set: { review:newReview, rating:newRating, reviewedBy:newReviewer}
},{new:true} )

const allBooks= bookExist.toObject()
allBooks['reviewsData']= updatedReview 

res.status(200).send({ status: true, message: "BookReview is updated", data: allBooks })

}catch(error){
    return res.status(500).send({ status: false, msg: error.message });

  }
}


const deleteReview = async function(req,res){
  try{
    const bookId= req.params.bookId
    const reviewId= req.params.reviewId
    if (!isValidObjectId(reviewId)) {
      return res.status(400).send({ status: false, msg: " Pls provide Valid reviewId" })
    }
    if (!isValidObjectId(bookId)) {
      return res.status(400).send({ status: false, msg: " Pls provide Valid reviewId" })
    }
    const bookExist = await bookModel.findOne({ _id:bookId, isDeleted:false })
     if(!bookExist){
         return res.status(404).send({ status: false, msg: " Book does not exist " });
     }
     const reviewExist = await reviewModel.findOne({ _id:reviewId, bookId:bookId, isDeleted:false })
      if(!reviewExist){
         return res.status(404).send({ status: false, msg: " Books are not reviewed " });
      }
     const deleteReview= await reviewModel.findOneAndUpdate({ _id: reviewId }, { $set: { isDeleted: true, deletedAt: Date.now()}})
     if(bookExist.reviews==0){
      bookExist.reviews= 0
     }else{
       bookExist.reviews-=1
     }
     await bookExist.save()
    return res.status(200).send({status:true, msg: "review deleted successfully"})


  }catch(error){
    return res.status(500).send({ status: false, msg: error.message });

  }
}


module.exports = { createReview , updateReview, deleteReview };
