const express=require('express')
const router=express.Router();

const userModel=require("../controller/userController");

const bookModel=require('../controller/bookController')
const review=require('../controller/reviewController')

const valid=require("../validation/validation")

router.post("/register",userModel.createUser);
router.post("/login",userModel.userLogin);
router.post("/books",bookModel.createBook);
router.get("/books",bookModel.getBooks);




module.exports=router
