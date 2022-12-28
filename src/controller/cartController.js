const cartModel = require('../models/cartModel')
const userModel = require('../models/userModel')
const productModel = require('../models/productModel')
const Valid = require('../validation/validation')
const { isValidObjectId } = require("mongoose");


const createCart = async function (req,res){
try{

    let reqBody= req.body
    let userId= req.params.userId

    let {productId, quantity, ...rest}= reqBody
    if (!Valid.isValidRequestBody(reqBody)) {
        return res.status(400).send({status:false, message:`Please provide mandatory inputs i.e. productId and quantity`})
    }
    if (!isValidObjectId(userId)){
        return res.status(400).send({status:false, message:`Given userId is not valid`})
    }

    if(!productId ) res.status(400).send({status:false, message:"productId is mandatory in body"})
    if (!isValidObjectId(productId)){ 
        return res.status(400).send({status:false, message:`Given productId in body is not valid`})
    }
    if(quantity && typeof quantity!="number") {
        res.status(400).send({status:false, message:"quantity should be a number"})
    }
        if(!(quantity)){ 
            quantity=1
        }
        let userIdExist = await userModel.findById(userId)
        if(!userIdExist) res.status(400).send({status:false, message:"userId doesn't exists"})

        let prodExist= await productModel.findById(productId)
       if(!prodExist) res.status(400).send({status:false, message:"productId doesn't exists"})

       let cartData= await cartModel.findOne({userId})
       if(cartData){
        let totalCartItems=cartData.items
        for(let a=0;a<totalCartItems.length;a++){
            
            if(productId==totalCartItems[a].productId){

            totalCartItems[a].quantity=(totalCartItems[a].quantity)+quantity
                       
             delete reqBody.quantity
             delete reqBody.productId
    
            reqBody.items=totalCartItems
            reqBody.totalPrice= (cartData.totalPrice) + (quantity*(prodExist.price))
   
            let addCartData= await cartModel.findOneAndUpdate({userId},reqBody,{new:true})
   
            return res.status(201).send({status:true,message:"Success",data:addCartData})
            } 
        }
        let obj={}
        obj.productId=productId
        obj.quantity=quantity
        let existingData= cartData.items
        existingData.push(obj)

        delete reqBody.quantity
        delete reqBody.productId

        reqBody.items=existingData
        reqBody.totalPrice= (cartData.totalPrice) + (quantity*(prodExist.price))
        reqBody.totalItems=existingData.length

        let addCartData= await cartModel.findOneAndUpdate({userId},reqBody,{new:true})

        return res.status(201).send({status:true,message:"Success",data:addCartData})


       }

       let items=[]
       let obj={}
       obj.productId=productId
       obj.quantity=quantity
       items.push(obj)

       delete reqBody.quantity
       delete reqBody.productId

       reqBody.userId=userId
       reqBody.items=items
       reqBody.totalPrice=(quantity) * (prodExist.price)
       reqBody.totalItems=items.length

       let cartDatas= await cartModel.create(reqBody)
       
       return res.status(201).send({status:true,message:"Success",data:cartDatas})



}catch(err){
    return res.status(500).send({ status: false, error: err.message })

}
}

const updateCart = async (req, res) => {
    try {

        let data = req.body;
        let userId = req.params.userId

    
        let findCart = await cartModel.findOne({ userId: userId });
        if (!findCart) return res.status(404).send({ status: false, message: `No cart found with this '${userId}' userId` });

    
        if (findCart.items.length == 0) return res.status(400).send({ status: false, message: "Cart is already empty" });

        let { cartId, productId, removeProduct, ...rest } = data;

        if (!Valid.isValidRequestBody(data)) return res.status(400).send({ status: false, message: "body is empty. provide some data mention from list: ( cartId, productId, removeProduct)" });

        if (!Valid.isValid(removeProduct)) { return res.status(400).send({ status: false, message: "RemoveProduct is Mandatory." }) }
        if (removeProduct != 0 && removeProduct != 1) { return res.status(400).send({ status: false, message: "RemoveProduct must be 0 or 1!" }) }

        if (cartId || cartId == '') {
            if (!Valid.isValid(cartId)) return res.status(400).send({ status: false, message: "please provide cartId" });
            if (!isValidObjectId(cartId)) return res.status(400).send({ status: false, message: "Please Enter Valid CartId" })
            if (findCart._id.toString() !== cartId) return res.status(400).send({ status: false, message: "This is not your CartId, Please enter correct CartId." })
        }

        if (!Valid.isValid(productId)) return res.status(400).send({ status: false, message: "Please Enter productId" })
        if (!isValidObjectId(productId)) return res.status(400).send({ status: false, message: "Please Enter Valid productId" })

        let getProduct = await productModel.findOne({ _id: productId})
        if (!getProduct) return res.status(404).send({ status: false, message: `No product found with this productId: '${productId}'.` })

        let getCart = await cartModel.findOne({ _id: findCart._id, 'items.productId': { $in: [productId] } })
        if (!getCart) return res.status(404).send({ status: false, message: `No product found in the cart with this productId: '${productId}'` })


        //--------------- Setting the Total Amount -------------//
        let totalAmount = getCart.totalPrice - getProduct.price
        let arr = getCart.items
        let totalItems = getCart.totalItems

        //------------ Condition for RemoveProduct value as 1 ---------------//
        if (removeProduct == 1) {

            for (let i = 0; i < arr.length; i++) {

                //------------- Condition for checking two Product is same or not ------------//
                if (arr[i].productId.toString() == productId) {
                    arr[i].quantity -= 1

                    if (arr[i].quantity < 1) {

                        totalItems--

                        let update1 = await cartModel.findOneAndUpdate({ _id: findCart._id }, { $pull: { items: { productId: productId } }, totalItems: totalItems }, { new: true }).populate('items.productId')

                        arr = update1.items
                        totalItems = update1.totalItems
                    }
                }
            }

            let updatePrice = await cartModel.findOneAndUpdate({ _id: findCart._id }, { $set: { totalPrice: totalAmount, items: arr, totalItems: totalItems } }, { new: true }).populate('items.productId')

            return res.status(200).send({ status: true, message: "Success", data: updatePrice })
        }

        //------------ Condition for RemoveProduct value as 0 ---------------//
        if (removeProduct == 0) {

            let totalItem = getCart.totalItems - 1

            for (let i = 0; i < arr.length; i++) {
                let prodPrice = getCart.totalPrice - (arr[i].quantity * getProduct.price)

                if (arr[i].productId.toString() == productId) {
                    let update2 = await cartModel.findOneAndUpdate({ _id: findCart._id }, { $pull: { items: { productId: productId } }, totalPrice: prodPrice, totalItems: totalItem }, { new: true }).populate('items.productId')

                    return res.status(200).send({ status: true, message: "Success", data: update2 })
                }
            }
        }

    } catch (error) {

        return res.status(500).send({ status: false, error: error.message })
    }


}

const getCart = async (req, res) => {

    try {

        let userId = req.params.userId;

       
        let carts = await cartModel.findOne({ userId: userId }).populate('items.productId')
        if (!carts) return res.status(404).send({ status: false, message: "cart does not exist!" })

        return res.status(200).send({ status: true, message: 'Success', data: carts })

    } catch (error) {

        return res.status(500).send({ status: false, error: error.message })
    }
}

const deleteCart = async (req, res) => {

    try {

        let userId = req.params.userId;

        let cartDelete = await cartModel.findOneAndUpdate({ userId: userId }, { $set: { items: [], totalPrice: 0, totalItems: 0 } }, { new: true })
        if (!cartDelete) return res.status(404).send({ status: false, message: "cart does not exist!" })

        return res.status(204).send({status:true, msg: "Successfully deleted"})

    } catch (error) {

        return res.status(500).send({ status: false, error: error.message })
    }
}

module.exports = { createCart , updateCart, getCart, deleteCart}

