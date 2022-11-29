const userModel = require("../models/userModel");
const Valid = require("../validation/validation");
const jwt = require("jsonwebtoken")


const createUser = async function (req, res) {
  try {
    const reqBody = req.body;

    const { title, name, phone, email, password, address } = reqBody;

    if (!Valid.isValidRequestBody(reqBody)) {
      return res.status(400).send({ status: false, msg: " Please Provide RequestBody" });
    }
    if (!Valid.isValid(title)) {
      return res.status(400).send({ status: false, msg: " Pls Provide title for user" });
    }
    if (!Valid.isValidtitle(title)) {
      return res.status(400).send({ status: false, msg: " Pls Provide specific title for user" });
    }
    if (!Valid.isValid(name)) {
      return res.status(400).send({ status: false, msg: " Pls Provide name for user" });
    }
    if (!Valid.isValid(phone)) {
      return res.status(400).send({ status: false, msg: " Pls Provide phone number for user" });
    }
    if (!Valid.isValidPhone(phone)) {
      return res.status(400).send({ status: false, message: "Please enter valid mobile no: " });
    }
    if (!Valid.isValid(email)) {
      return res.status(400).send({ status: false, msg: " Pls Provide email for user" });
    }
    if (!Valid.isValidEmail(email)) {
      return res.status(400).send({ status: false, msg: "email is not valid" });
    }
    if (!Valid.isValid(password)) {
      return res.status(400).send({ status: false, msg: " Pls Provide password for user" });
    }
    //password should not be less than 8 or greater than 15
    if (password.length < 8 || password.length > 15) {
      return res.status(400).send({
          status: false,
          msg: " Password should be within 8 to 15 characters",
        });
    }
    //password regex

    //address

    //email already exist
    const emailAlreadyExist = await userModel.findOne({ email });
    if (emailAlreadyExist) {
      return res.status(409).send({ status: false, msg: "Email already exist" });
    }

    //phone no already exist
    const phoneAlreadyExist = await userModel.findOne({ phone });
    if (phoneAlreadyExist) {
      return res.status(409).send({ status: false, msg: "Phone number already registered" });
    }

    const userCreation = await userModel.create(reqBody);
    return res.status(201).send({ status: true, msg: " Success", data: userCreation });
  } catch (error) {
    return res.status(500).send({ status: false, msg: error.message });
  }
};

const userLogin = async function (req, res) {
  try {
    let reqBody = req.body;
    if (!Valid.isValidRequestBody(reqBody)) {
      return res.status(400).send({ status: false, msg: " Please Provide RequestBody" });
    }
    let email = req.body.email;
    let password = req.body.password;

    if (!Valid.isValid(email)) {
      return res.status(404).send({ status: false, msg: "Pls provide email address" });
    }
    if (!Valid.isValidEmail(email)) {
      return res.status(404).send({ status: false, msg: "Pls provide valid email address" });
    }
    if (!Valid.isValid(password)) {
      return res.status(404).send({ status: false, msg: "Pls provide password" });
    }

    const userDetails = await userModel.findOne({
      email: email,
      password: password,
    });

    if (userDetails) {
      const token = await jwt.sign(
        {
          userId: userDetails._id,
          iat: Math.floor(Date.now() / 1000),
          exp: Math.floor(Date.now() / 1000) + 60 * 60 * 60,
        },"secretKey"
      );
      return res.status(200).send({status: true,msg: "Token generated Successfully",data: {token}});
    } else {
      return res.status(401).send({ status: false, msg: "Invalid Credentials" });
    }
  } catch (error) {
    return res.status(500).send({ status: false, msg: error.message });
  }
};

module.exports = { createUser, userLogin };
