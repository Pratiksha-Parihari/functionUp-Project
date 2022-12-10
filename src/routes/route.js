const express = require("express")
const router =express.Router()


const authorController = require("../controllers/authorController")
const blogController = require("../controllers/blogController")
const middleware =require("../middleware/middleware")

router.post("/authors",authorController.createAuthor) // for author creation

router.post("/login",authorController.authorLogin) //for login author

router.post("/blogs",middleware.authentication,blogController.createBlog) //for blogs creation 

router.get("/filterBlogs",middleware.authentication,blogController.filterBlogs) //for fetching blogs 

router.put("/blogs/:blogId",middleware.authentication,middleware.authorisation,blogController.updateBlog) //for updating blogs

router.delete("/blogs/:blogId",middleware.authentication,middleware.authorisation,blogController.blogDeletionById) //for deletion of  blog with Id

router.delete("/blogs",middleware.authentication,blogController.deleteBlog) //for deletion of  blog with query

module.exports=router   