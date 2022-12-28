const productModel = require('../models/productModel')
const Valid = require("../validation/validation");
const uploadFile = require("../aws/aws");
const { isValidObjectId } = require("mongoose");


const createProduct = async (req, res) => {
try{

    let reqBody = req.body
    let files = req.files
    let { title, description, price, currencyId, currencyFormat, isFreeShipping, style, availableSizes, installments, productImage, ...rest } = reqBody
    
    if (!Valid.isValidRequestBody(reqBody)) {
        return res.status(400).send({ status: false, msg: " Please Provide RequestBody" });
      }

      let obj= {}

      if (!Valid.isValid(title)) { 
        return res.status(400).send({ status: false, message: "Please enter title" }) 
        }
        obj.title = title

        if (!Valid.isValid(description)) {
            return res.status(400).send({ status: false, message: "Please enter description" });
        }
        obj.description = description

        if (!Valid.isValid(price)) {
            return res.status(400).send({ status: false, message: "Please enter price" });
        }
        if (!Valid.isValidPrice(price)) {
            return res.status(400).send({ status: false, message: "Please enter valid price" });
        }
        obj.price = price

        
        if (!Valid.isValid(currencyId)) {
            return res.status(400).send({ status: false, message: "Please enter CurrencyId" });
        }
        if (currencyId != 'INR') {
                return res.status(400).send({ status: false, message: "CurrencyId must be 'INR'" });
        }
        obj.currencyId = currencyId

        if (!Valid.isValid(currencyFormat)){
             return res.status(400).send({ status: false, message: "Please enter currencyFormat" });
        }
        if (currencyFormat != '₹') {
        return res.status(400).send({ status: false, message: "Currency Format must be ₹" });
        }
        obj.currencyFormat = currencyFormat

        if (!Valid.isValid(isFreeShipping)) {
            return res.status(400).send({ status: false, message: "Please enter value of Free Shipping" });
        }
        if (isFreeShipping !== 'true' && isFreeShipping !== 'false'){
            return res.status(400).send({ status: false, message: "This field accepts only true or false" });
        }
        obj.isFreeShipping = isFreeShipping

        if (!Valid.isValid(style)){ 
            return res.status(400).send({ status: false, message: "Please enter style" });
        }
        obj.style = style
       
        if (!Valid.isValid(availableSizes)) {
            return res.status(400).send({ status: false, message: "Please enter Size" });
        }
        if (!["S", "XS", "M", "X", "L", "XXL", "XL"].includes(availableSizes)) {
            return res.status(400).send({ status: false, message: ' Select one of these given size option: (S , XS, M, X, L, XXL, XL) ' });
        }
        obj.availableSizes = availableSizes

        if (!Valid.isValid(installments)) {
            return res.status(400).send({ status: false, message: "Please enter installments" });
        }
            if (!Valid.isValidInstallment(installments)) {
                return res.status(400).send({ status: false, message: " Please enter Installments in number" });
            }
            obj.installments = installments


    const checkTitle = await productModel.findOne({ title: title });
            if (checkTitle) {
                return res.status(400).send({ status: false, message: "Title Already Exist, Please Enter Another Title!" });
            }
//validating file

if (files && files.length > 0) {
    if (files.length > 1) return res.status(400).send({ status: false, message: "More than one File cannot be accepted" })
    if (!Valid.isValidProfileImage(files[0]['originalname'])) { return res.status(400).send({ status: false, message: "please provide image file only" }) }
    let uploadedFileURL = await uploadFile(files[0])
    obj.productImage = uploadedFileURL
} else {
    return res.status(400).send({ message: "Product Image is Mandatory. Please provide image of the Product" })
}


       let createProduct = await productModel.create(obj)

return res.status(201).send({ status: true, message: "Success", data: createProduct })

}catch(err){
    return res.status(500).send({ status: false, msg: err.message });
}

}

const getProduct = async (req, res) => {
    try{

        let query1 = req.query
    
        let { size, name, priceGreaterThan, priceLessThan, priceSort } = query1

        if (!Valid.isValidRequestBody(query1)) {
            let productData = await productModel.find({ isDeleted: false })
            if (productData.length == 0){
                 return res.status(404).send({ status: false, message: "Products not found" })
            }
            return res.status(200).send({ status: true, message: "Success", data: productData });
        }

        let obj = {}
        if (size) {
            if (!Valid.isValid(size)) {
                return res.status(400).send({ status: false, message: "Please enter Size" }); 
            }   
            if (!["S", "XS", "M", "X", "L", "XXL", "XL"].includes(size)) {
                return res.status(400).send({ status: false, message: "Select one of these given size option: (S , XS, M, X, L, XXL, XL)" });
            }
            obj.availableSizes = { $all: size }

        }

        if (name) {
            if (!Valid.isValid(name)) { 
                return res.status(400).send({ status: false, message: "Please enter name" }) 
            }
            obj.title =  name 
        }

        if (priceGreaterThan) {
            if (!Valid.isValid(priceGreaterThan)) {
                return res.status(400).send({ status: false, message: "Please enter Price Greater Than" });
            }
            if (!Valid.isValidPrice(priceGreaterThan)) {
                return res.status(400).send({ status: false, message: "priceGreaterThan must be number" });
            }
            obj.price = { $gt: priceGreaterThan }
        }
    
        if (priceLessThan) {
            if (!Valid.isValid(priceLessThan)) {
                return res.status(400).send({ status: false, message: "Please enter Price less Than" });
            }
            if (!Valid.isValidPrice(priceLessThan)) {
                return res.status(400).send({ status: false, message: "priceLessThan must be number" });
            }
            obj.price = { $lt: priceLessThan }
        }
        if (priceGreaterThan && priceLessThan) {
            obj.price = { $gt: priceGreaterThan, $lt: priceLessThan }
        }
        if (priceSort) {
            if (!(priceSort == -1 || priceSort == 1)) {
                return res.status(400).send({ status: false, message: "Use '1' key to get data from high price or '-1' key to get data from low price" });
            }
        }
        obj.isDeleted = false;
        let getProduct = await productModel.find(obj).sort({ price: priceSort })

        if (getProduct.length == 0) {
            return res.status(404).send({ status: false, message: "Product Not Found." })
        }

        return res.status(200).send({ status: true, message: "Success", data: getProduct })

    }catch(err){
        return res.status(500).send({ status: false, msg: err.message });

    }


}

const getProductById = async (req, res) => {

    try {

        let productId = req.params.productId

        if (!isValidObjectId(productId)) {
            return res.status(400).send({ status: false, message: `Given productID is Invalid` })
        }
            let getProduct = await productModel.findOne({ _id: productId, isDeleted: false })
        if (!getProduct) return res.status(404).send({ status: false, message: "Product Data is Not Found" })

        return res.status(200).send({ status: true, message: "Success", data: getProduct })

    } catch (error) {

        return res.status(500).send({ status: false, message: error.message })
    }
}

const updateProduct = async (req, res) => {
try{
    
    let reqBody = req.body
    let files = req.files
    let productId = req.params.productId

    let { title, description, price, isFreeShipping, style, availableSizes, installments, productImage, ...rest } = reqBody


    if (!isValidObjectId(productId)) {
        return res.status(400).send({ status: false, message: 'Please Enter Valid ProductId' })
    }
    if (!Valid.isValidRequestBody(reqBody) && !(files)) {
        return res.status(400).send({ status: false, message: "Select at least one field to update from the list: (title, description, price, isFreeShipping, style, availableSizes, installments, productImage). " });
    }

    let obj = {}

    if (title || title == '') {

        if (!Valid.isValid(title)) { 
            return res.status(400).send({ status: false, message: "Please enter title" }) 
        }

        //------------ checking Product Title is already Present or Not -------------//
        let isDuplicateTitle = await productModel.findOne({ title: title });

        if (isDuplicateTitle) {

            return res.status(400).send({ status: false, message: "Title Already Exist, provide an unique title" });
        }

        obj.title = title
    }
    if (description || description=='') {
        if (!validator.isValidInput(description)) {
            return res.status(400).send({ status: false, message: "Please enter description" });
        }
        obj.description = description
    }
    if (price || price=='') {

        if (!Valid.isValid(price)) {
            return res.status(400).send({ status: false, message: "Please enter price" });
        }
        if (!Valid.isValidPrice(price)) {
            return res.status(400).send({ status: false, message: "price should be in number" });
        }
        obj.price = price
    }
    if (isFreeShipping || isFreeShipping=='') {

        if (isFreeShipping !== 'true' && isFreeShipping !== 'false') return res.status(400).send({ status: false, message: "This field accepts only true and false" });
        obj.isFreeShipping = isFreeShipping
    }
    if (productImage == '') return res.status(400).send({ status: false, message: "plz provide product image " })

        if (files && files.length > 0) {

            if (files.length > 1) return res.status(400).send({ status: false, message: "one image file accepted only" })
            if (!Valid.isValidProfileImage(files[0]['originalname'])) { return res.status(400).send({ status: false, message: "only image file accepted" }) }
            let uploadedFileURL = await uploadFile(files[0])
            obj.productImage = uploadedFileURL
        }

        if (style || style=='') {
            if (!Valid.isValid(style)) return res.status(400).send({ status: false, message: "Please enter style!" });
            obj.style = style
        }

        if (availableSizes ||availableSizes=='' ) {
            if (!Valid.isValid(availableSizes)) return res.status(400).send({ status: false, message: "Please enter Size" });
            if (!["S", "XS", "M", "X", "L", "XXL", "XL"].includes(availableSizes)) return res.status(400).send({ status: false, message: 'Select one of these given size option: (S , XS, M, X, L, XXL, XL) ' });
            obj.availableSizes = availableSizes
        }
        if (installments || installments=='') {
            if (!Valid.isValid(installments)) return res.status(400).send({ status: false, message: "Please enter installments" });
            if (!Valid.isValidInstallment(installments)) return res.status(400).send({ status: false, message: "plz Provide valid Installments number" });
            obj.installments = installments
        }

        let updatedProduct = await productModel.findOneAndUpdate({ isDeleted: false, _id: productId }, { $set: obj }, { new: true })
        if (!updatedProduct) { return res.status(404).send({ status: false, message: "Product is not found or Already Deleted!" }); }
        
        return res.status(200).send({ status: true, message: "Success", data: updatedProduct })




}catch(err){
    return res.status(500).send({ status: false, message: error.message })

}

}

const deleteProduct = async (req, res) => {

    try {

        let productId = req.params.productId

        if (!isValidObjectId(productId)) {
            return res.status(400).send({ status: false, message: 'ProductId is invalid' })
        }
            let deletedProduct = await productModel.findOneAndUpdate({ isDeleted: false, _id: productId }, { isDeleted: true, deletedAt: Date.now() })

        if (!deletedProduct) { 
            return res.status(404).send({ status: false, message: "Product is not found or Already Deleted!" }) 
        }

        return res.status(200).send({ status: true, message: "Product Successfully Deleted"})

    } catch (error) {

        return res.status(500).send({ status: false, message: error.message })
    }
}


 module.exports = { createProduct, getProduct,getProductById, updateProduct, deleteProduct }
    


