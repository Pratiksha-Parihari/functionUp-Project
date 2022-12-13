const urlModel = require('../models/urlModel');
const shortId = require('shortid');

let createUrl = async function(req,res){
   try{
    const data = req.body;
    if(Object.keys(data).length===0){
        res.status(400).send({status:false,msg:'body is empty'})
    }
    let url = shortId.generate().toLowerCase();
    data.urlCode = url;
    let baseUrl = 'http://localhost:3000/';
    data.shortUrl = baseUrl + url;
    let oldData = await urlModel.findOne({longUrl:data.longUrl})
    if(oldData){
        res.status(200).send({status:true,data:oldData})
    }
    let createData = await urlModel.create(data);
    //let resData = await urlModel.findOne({longUrl:createData.longUrl}).select({shortUrl:1})
        res.status(201).send({ status:true , data:createData})

   }catch(error){
      res.status(500).send({status:false,msg:error.message})
   }
}

let getUrl = async function(req,res){
    try{
        let url = req.params.urlCode;
        let findUrl = await urlModel.findOne({urlCode:url})
        if(!findUrl){
            res.status(404).send({status:false,msg:'No url found'})
        }   
        res.status(302).redirect(findUrl.longUrl)
    }catch(error){
        res.status(500).send({msg:error.message})
    }
}



module.exports.createUrl = createUrl;
module.exports.getUrl = getUrl;