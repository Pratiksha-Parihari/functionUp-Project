const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();

const urlSchema = new mongoose.Schema({
    urlCode: { type:String , unique:true, trim:true },
     longUrl: {type:String ,unique:true}, 
     shortUrl: {type:String , unique:true} 
});



module.exports = mongoose.model('url', urlSchema)