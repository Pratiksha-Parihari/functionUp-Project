const jwt = require("jsonwebtoken")
const authorModel = require("../models/authorModel")
const blogModel = require("../models/blogModel")
const mongoose=require("mongoose")




const authentication = function (req, res, next) {
    try {
        let token = req.headers["x-api-key"];
        if (!token) {
            return res.status(401).send({ status: false, msg: " token must be present for authentication " })
        }
        jwt.verify(token, "mavrik", function (err, decodedToken) {
            if (err) {
                return res.status(400).send({ status: false, msg: "token invalid" });
            }

            req.token = decodedToken.authorId
            next()
        })
    } catch (err) {
        res.status(500).send({ status: false, msg: err.message })
    }
}
//authorisation
const authorisation = async function (req, res, next) {
    try {
        let blogid = req.params.blogId
        let validUser = req.token // userid from token

        if (!mongoose.isValidObjectId(blogid)) {
            return res.status(400).send({ status: false, message: "Invalid Format of Blog Id" })
        }

        let blog = await blogModel.findById(blogid)
        if (blog) {
            let user = blog.authorId.toString() //userId from book
            if (user !== validUser) {
                return res.status(403).send({ status: false, message: "Sorry! Unauthorized User" })
            }

            next()
        }
        else{
            return res.status(404).send({ status: false, message: "Blog not found or BlogId does not exist" })
        }
    }
    catch (err) {
        res.status(500).send({ status: false, error: err.message })
    }
}



module.exports.authentication = authentication
module.exports.authorisation = authorisation