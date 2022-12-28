const express=require('express')
const router=express.Router();

const userModel=require("../controller/userController");

const productModel=require('../controller/productController')
const cartModel=require('../controller/cartController')
const orderModel=require('../controller/orderController')


const valid=require("../validation/validation")
const middleware = require("../middleware/auth")

router.post("/register",userModel.createUser);
 router.post("/login",userModel.userLogin);
 router.get("/user/:userId/profile", middleware.authentication, userModel.getUser)
 router.put("/user/:userId/profile", middleware.authentication, middleware.authorisation, userModel.updateUserData)

  router.post("/products", productModel.createProduct)
  router.get("/products", productModel.getProduct)
  router.get("/products/:productId", productModel.getProductById)
  router.put("/products/:productId", productModel.updateProduct)
  router.delete("/products/:productId", productModel.deleteProduct)
 
  router.post("/users/:userId/cart", middleware.authentication, middleware.authorisation, cartModel.createCart)
  router.put("/users/:userId/cart",middleware.authentication, middleware.authorisation, cartModel.updateCart)
   router.get("/users/:userId/cart", middleware.authentication, middleware.authorisation, cartModel.getCart)
   router.delete("/users/:userId/cart", middleware.authentication, middleware.authorisation, cartModel.deleteCart)
 
  router.post("/users/:userId/orders",middleware.authentication, middleware.authorisation,orderModel.createOrder)
  router.put("/users/:userId/orders",middleware.authentication, middleware.authorisation,orderModel.updateOrder)











module.exports=router
