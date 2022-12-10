const express=require('express')
const router=express.Router();

const userModel=require("../controller/userController");

const bookModel=require('../controller/booksController')
const reviewModel=require('../controller/reviewController')

const valid=require("../validation/validation")
const middleware = require("../middleware/auth")

router.post("/register",userModel.createUser);
router.post("/login",userModel.userLogin);

router.post("/books", middleware.authentication, bookModel.createBook);
router.get("/books",middleware.authentication,bookModel.getBooks);
router.get("/books/:bookId",middleware.authentication,middleware.authorisation,bookModel.getBooksById);
router.put("/books/:bookId",middleware.authentication,middleware.authorisation,bookModel.updateBooks);
router.delete("/books/:bookId",middleware.authentication,middleware.authorisation,bookModel.deleteBookById);

router.post("/books/:bookId/review",reviewModel.createReview);
router.put("/books/:bookId/review/:reviewId",reviewModel.updateReview)
router.delete("/books/:bookId/review/:reviewId",reviewModel.deleteReview)









module.exports=router
