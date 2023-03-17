const userModel = require("../models/userModel");
const Valid = require("../validation/validation");
const jwt = require("jsonwebtoken");
const bcrypt = require ('bcrypt');
const uploadFile = require("../aws/aws");
const { isValidObjectId } = require("mongoose");





const createUser = async function (req, res) {
  // console.log(req.body)
  try {

    const reqBody = req.body;
    const files = req.files;


    const { fname, lname, email, profileImage, phone, password, address } = reqBody;

    if (!Valid.isValidRequestBody(reqBody)) {
      return res.status(400).send({ status: false, msg: " Please Provide RequestBody" });
    }
    if (!Valid.isValid(fname)) {
      return res.status(400).send({ status: false, msg: " Pls Provide fname for user" });
    }
    if (!Valid.isValidName(fname)) { 
      return res.status(400).send({ status: false, message: 'plz provide fname in Alphabets only' }) 
    }

    if (!Valid.isValid(lname)) {
      return res.status(400).send({ status: false, msg: " Pls Provide lname for user" });
    }
    if (!Valid.isValidName(lname)) { 
      return res.status(400).send({ status: false, message: 'plz provide lname in Alphabets only' }) 
    }
    if (!Valid.isValid(email)) {
      return res.status(400).send({ status: false, msg: " Pls Provide email for user" });
    }
    
    if (!Valid.isValidEmail(email)) {
      return res.status(400).send({ status: false, msg: "email is not valid" });
    }
    const emailAlreadyExist = await userModel.findOne({ email });
    if (emailAlreadyExist) {
      return res.status(400).send({ status: false, msg: "Email already exist" });
    }
    if (!Valid.isValid(phone)) {
      return res.status(400).send({ status: false, msg: " Pls Provide phone number for user" });
    }
    if (!Valid.isValidPhone(phone)) {
      return res.status(400).send({ status: false, msg: " Pls Provide valid phone number for user" });
    }

    const phoneAlreadyExist = await userModel.findOne({ phone });
    if (phoneAlreadyExist) {
      return res.status(400).send({ status: false, msg: "Phone number already registered" });
    }

    
    if (!Valid.isValid(password)) {
      return res.status(400).send({ status: false, msg: " Pls Provide password for user" });
    }

    //password should not be less than 8 or greater than 15
    // if (password.length < 8 || password.length > 15) {
    //   return res.status(400).send({
    //       status: false,
    //       msg: " Password should be within 8 to 15 characters",
    //     });
    // }
    //password regex
       if (!Valid.isValidPassword(password)) {
         return res.status(400).send({ status: false, msg: "please provide password in proper format" });
       }

  //address
  
  if (!address) {
    return res.status(400).send({ status: false, message: "Please give the User Address." })
  }

  reqBody.address= JSON.parse(address)
  if(!Valid.isValid(reqBody.address)){
    return res.status(400).send({ status: false, msg: "address should be in object and should and must contain shipping and billing address" });
  }
  
    let { shipping, billing }  = reqBody.address
    if(!shipping){
      return res.status(400).send({ status: false, msg: "please enter shipping address" });
    }
    if (!Valid.isValid(shipping.street)) {
      return res.status(400).send({ status: false, msg: "please provide shipping street" });
    }
    if (!Valid.isValid(shipping.city)) {
      return res.status(400).send({ status: false, msg: "please provide shipping city" });
    }
    if (!Valid.isValid(shipping.pincode)) {
      return res.status(400).send({ status: false, msg: "please provide shipping pincode" });
    }
    
    if (!Valid.isValidPincode(shipping.pincode)) {
      return res.status(400).send({ status: false, msg: "please provide valid pincode" });
    }

    if(!billing){
      return res.status(400).send({ status: false, msg: "please enter billing address" });
    }
    if (!Valid.isValid(billing.street)) {
      return res.status(400).send({ status: false, msg: "please provide billing street" });
    }
    if (!Valid.isValid(billing.city)) {
      return res.status(400).send({ status: false, msg: "please provide billing city" });
    }
    if (!Valid.isValid(billing.pincode)) {
      return res.status(400).send({ status: false, msg: "please provide billing pincode" });
    }
    
    if (!Valid.isValidPincode(billing.pincode)) {
      return res.status(400).send({ status: false, msg: "please provide valid billing pincode" });
    }
     reqBody.password= await bcrypt.hash(reqBody.password, 10 )

    //upload profile image
    if (files && files.length > 0) {

      if (files.length > 1) return res.status(400).send({ status: false, message: "More than one File cannot be accepted" })
       if (!Valid.isValidProfileImage(files[0]['originalname'])) { return res.status(400).send({ status: false, message: "Please provide file in jpeg,png,webp format" }) }

      reqBody.profileImage = await uploadFile(files[0])
  }
  else {
      return res.status(400).send({status: false, message: "Please provide profile image" })
  }
    
    const userCreation = await userModel.create(reqBody);
    return res.status(201).send({ status: true, msg: " Success", data: userCreation });
  } catch (error) {
    return res.status(500).send({ status: false, msg: error.message });
  }
};

const userLogin = async function (req, res) {
  try{
    let reqBody = req.body;
    if (!Valid.isValidRequestBody(reqBody)) {
      return res.status(400).send({ status: false, msg: " Please Provide RequestBody" });
    }
    let email = req.body.email;
    let password = req.body.password;

    if (!Valid.isValid(email)) {
      return res.status(400).send({ status: false, msg: "Pls provide email address" });
    }
    if (!Valid.isValidEmail(email)) {
      return res.status(400).send({ status: false, msg: "Pls provide valid email address" });
    }
    

    const userDetails = await userModel.findOne({email: email});
     if(!userDetails){
      return res.status(401).send({ status:false, msg: "Invalid log in email"})
     }
     if (!Valid.isValid(password)) {
      return res.status(400).send({ status: false, msg: "Pls provide password" });
    }
     let checkPassword = await bcrypt.compare(password, userDetails.password)
    if (checkPassword) {
      const token = await jwt.sign(
        {
          userId: userDetails._id,
          iat: Math.floor(Date.now() / 1000),
          exp: Math.floor(Date.now() / 1000) + 60 * 60 * 60,
        },"secretKey"
      );
      let obj = { userId:userDetails._id , token: token }
      return res.status(200).send({status: true,msg: "Token generated Successfully",data: obj});
    } else {
      return res.status(401).send({ status: false, msg: "Invalid login password" });
    }
  }catch(error){
    return res.status(500).send({ status: false, msg: error.message });

  }
}
const getUser = async function (req, res) {
try{
  let userId = req.params.userId
  let tokenUserId= req.token
   
  if(!isValidObjectId(userId)){
    return res.status(400).send({status:false, msg: "userId is not valid object id"})
  }

  if(userId !== tokenUserId){
    return res.status(403).send({ status:false, msg: "authorisation failed"})
  }
  let getUserData = await userModel.findOne({_id:userId})
  if(!getUserData){
    return res.status(404).send({ status:false, msg: "user details not found"})

  }
  return res.status(200).send({ status:true, msg: "User profile details", data: getUserData})


}catch(error){
  return res.status(500).send({ status: false, msg: error.message });

}

}

const updateUserData = async function (req, res) {
  
try{

  let reqBody = req.body
  let files = req.files
  let userId= req.params.userId

  const { fname, lname, email, profileImage, phone, password, address } = reqBody;

  if (!Valid.isValidRequestBody(reqBody)) {
    return res.status(400).send({ status: false, msg: " Please Provide RequestBody" });
  }

  let obj = {}

  if(fname){
    if (!Valid.isValidName(fname)) { 
      return res.status(400).send({ status: false, message: 'plz provide fname in Alphabets only' }) 
    }
  obj.fname = fname
  }
  if(lname){
  if (!Valid.isValidName(lname)) { 
    return res.status(400).send({ status: false, message: 'plz provide lname in Alphabets only' }) 
  }
  obj.lname= lname

}

  if(email){
    if (!Valid.isValidEmail(email)) { 
      return res.status(400).send({ status: false, message: 'plz provide email in correct format' }) 
    }
    obj.email = email
  }
  if(phone){
    if (!Valid.isValidPhone(phone)) {
      return res.status(400).send({ status: false, msg: " Pls Provide valid phone number for user" });
    }
    obj.phone = phone
  }

  if(password){
    if (!Valid.isValidPassword(password)) {
      return res.status(400).send({ status: false, msg: "please provide password in proper format" });
    }
    obj.password = await bcrypt.hash(password,10)
  }

  if (address) {
    if (!Valid.isValid(address)) {
      return res.status(400).send({ status: false, message: 'Please provide input for address' })
    }
    obj.address = JSON.parse(address)
    let { shipping, billing } = address

    if (shipping) {
        if (shipping.street) { 
          obj['address.shipping.street'] = shipping.street 
        }
        if (shipping.city) {
            if (!Valid.isValid(shipping.city)) { 
              return res.status(400).send({ status: false, message: 'Invalid Shipping city' }) 
            }
            obj['address.shipping.city'] = shipping.city
        }
        if (shipping.pincode) {
            if (!Valid.isValidPincode(shipping.pincode)) { 
              return res.status(400).send({ status: false, message: 'Invalid Shipping Pin Code.' }) 
            }
            obj['address.shipping.pincode'] = shipping.pincode
        }
    }

    if (billing) {
      if (billing.street) { 
        obj['address.billing.street'] = billing.street 
      }
      if (billing.city) {
          if (!Valid.isValid(billing.city)) { return res.status(400).send({ status: false, message: 'Invalid Shipping city' }) }
          obj['address.billing.city'] = billing.city
      }
      if (billing.pincode) {
          if (!Valid.isValidPincode(billing.pincode)) { 
            return res.status(400).send({ status: false, message: 'Invalid Shipping Pin Code.' }) 
          }
          obj['address.billing.pincode'] = billing.pincode
      }
  }
  
}

//file validation
if (files && files.length > 0) {
  if (files.length > 1) {
    return res.status(400).send({ status: false, message: "You can't enter more than one file for Update!" })
  }
  if (!Valid.isValidProfileImage(files[0]['originalname'])) { 
    return res.status(400).send({ status: false, message: "You have to put only Image." }) 
  }
  let uploadedURL = await uploadFile(files[0])
  obj.profileImage = uploadedURL
}


let userUpdate = await userModel.findOneAndUpdate( {_id: userId }, { $set: obj }, { new: true })
if(!userUpdate){
  return res.status(404).send({ status: false, message: 'User doest not found with this id' }) 

}
return res.status(200).send({ status: true, message: 'User profile updated', data:userUpdate }) 

}catch(err){
  return res.status(500).send({ status: false, msg: error.message });

}

}

module.exports = { createUser,userLogin, getUser ,updateUserData};
