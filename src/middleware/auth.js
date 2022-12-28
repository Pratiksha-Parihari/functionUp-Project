const jwt = require('jsonwebtoken')
 const userModel = require("../models/userModel");
const mongoose = require('mongoose')


const authentication = function (req,res,next){
    try{

        let token = req.headers["authorization"]
        if (!token) {
            return res.status(401).send({ status: false, message: "Please provide a token" })
        }
        token = token.slice(7)
        jwt.verify(token, "secretKey", function (err, decodedToken) {
            if (err) {
                return res.status(401).send({ status: false, message: "Incorrect token" })
            }
            if (err && err.message == "jwt expired") {
                return res.status(401).send({ status: false, message: "Session expired! Please login again." })
            }
            else {
                req.token = decodedToken.userId
                next()
            }
              
        })

    }catch(error){
        return res.status(500).send({ status: false, message: error.message })

    }
}

const authorisation = async (req, res, next) => {

    try {

        let userId = req.params.userId

        if (!mongoose.isValidObjectId(userId)) {
        return res.status(400).send({ status: false, message: `Provided UserId: ${userId} is not valid!` })
        }
        let userData = await userModel.findById(userId)
        if (!userData) return res.status(404).send({ status: false, message: "User does not exist" })

        if (userData._id.toString() !== req.token) {
            return res.status(403).send({ status: false, message: "Unauthorized User Access!" })
        }
        next()

    } catch (error) {

        res.status(500).send({ status: false, error: error.message })
    }
}

module.exports = { authentication, authorisation }