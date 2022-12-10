const blogModel = require("../models/blogModel")
const Valid = require("../validations/validator")
const { isValidObjectId } = require("mongoose")
const authorModel = require("../models/authorModel")
const mongoose=require("mongoose")



//++++++++++++++++++++++++++++++++++++++++++  Blog  Creation  ++++++++++++++++++++++++++

const createBlog = async function (req, res) {

    try {
        const requestBody = req.body
        const { title, body, authorId, tags, category, isPublished, publishedAt } = requestBody

        if (!Valid.isValidRequestBody(requestBody)) {
            return res.status(400).send({ status: false, msg: " Pls Provide requestBody" })
        }
        if (!Valid.isValid(title)) {
            return res.status(400).send({ status: false, msg: " Pls Provide title for blog" })
        }
        if (!Valid.isValid(body)) {
            return res.status(400).send({ status: false, msg: "Body is Mandtory" })
        }
        if (!Valid.isValid(tags)) {
            return res.status(400).send({ status: false, msg: "Pls provide tags of blog" })
        }
        if (!Valid.isValid(category)) {
            return res.status(400).send({ status: false, msg: "pls provide category of Blog" })
        }
        if(requestBody.isPublished === true){
            requestBody.publishedAt = Date.now()
        }

        if (!Valid.isValid(authorId)) {
            return res.status(400).send({ status: false, msg: " Pls provide author Id" })
        }

        const Id = req.body.authorId
        if (!isValidObjectId(Id)) {
            return res.status(400).send({ status: false, msg: " Pls provide Valid author Id" })
        }

        const validId = await authorModel.findById(Id)
        if (validId) {
            const blogCreated = await blogModel.create(requestBody)
            return res.status(201).send({ status: true, msg: 'blog created succesfully ', data: blogCreated })

        } else { res.status(400).send({ status: false, msg: 'invalid authorid' }) }
    }

    catch (err) {

        return res.status(500).send({ status: false, msg: err.msg })

    }


}



//++++++++++++++++++++++++++++++++  Fetching Blogs  ++++++++++++++++++++++++++++++++++++++++++++++
const filterBlogs = async function (req, res) {
    try {
        const blogsData = await blogModel.find({ isDeleted: false }, { isPublished: true })
        if (req.query) {
            let { authorId, tags, category, subCategory } = req.query

        
            let obj = {}
            if (authorId) {
                obj.authorId = authorId

            }
            if (tags) {
                obj.tags = tags
            }
            if (category) {
                obj.category = category
            }
            if (subCategory) {
                obj.subCategory = subCategory
            }

            obj.isDeleted = false
            obj.isPublished = true

            const getDetail = await blogModel.find(obj)
            if (!getDetail) {
                return res.status(404).send({ status: false, msg: "given data is invalid " })
            }
            else {
                return res.status(200).send({ status: true, data: getDetail })
            }
        } else {
            return res.status(200).send({ status: true, data: blogsData })
        }

    }
    catch (err) {
        return res.status(500).send({ status: false, msg: err.message })
    }
}


//+++++++++++++++++++++++++  Updating Blogs +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

const updateBlog = async function (req, res) {

    try {
        const blogId = req.params.blogId
        if (!isValidObjectId(blogId)) return res.status(400).send({ status: false, msg: "blog Id is incorrect" })

        const requestBody = req.body

        if (!Valid.isValidRequestBody(requestBody)) {
            return res.status(400).send({ status: false, msg: " Pls Provide requestBody" })
        }

       let findBlog = await blogModel.findById(blogId)
       if(!findBlog){
        return res.status(404).send({ status:false, msg: "Blog id is invalid"})
       }
       if(findBlog.isDeleted == true){
        return res.status(404).send({ status:false, msg: "Blog is already deleted"})
       }

        //   if(findBlog.authorId._id.toString()!== req.authorId){
        //    return res.status(401).send({ status:false , msg: "Authorisation failed"})
        //   }

        const { title, body, tags, subcategory, category, isPublished } = requestBody

        let savedData = await blogModel.findOneAndUpdate({ _id: blogId, isDeleted:false }, {
            $set: { title: title, body: body, category: category, isPublished: isPublished ,publishedAt:Date.now()},
            $push: { tags: tags, subcategory: subcategory }
        }, { new: true, upsert:true })

        res.status(200).send({ status: true, msg: "blog updated successfuly", data: savedData })


    } catch (error) {
        return res.status(500).send({ status: false, msg: error.message })

    }

}


//+++++++++++++++++++++++++++++++ Blog Deletion with Blog Id +++++++++++++++++++++++++++++++++++++++++++++++

const blogDeletionById = async function (req, res) {
    try {
        let blogId = req.params.blogId


        if (!isValidObjectId(blogId)) {
            return res.status(400).send({ status: false, msg: " Pls provide Valid blog Id" })
        }
        let idExist= await blogModel.findById(blogId)
        if(!idExist){
            return res.status(400).send({ status: false, msg: " id does not exist " })

        }
        //   if( idExist.authorId._id !==req.authorId){
        //       return res.status(401).send({ status: false, msg: " Authorisation failed" })

        //   }


            const findingBlog = await blogModel.findOneAndUpdate({ _id: blogId }, { $set: { isDeleted: true, deletedAt: Date.now() } }, {new:true})
            res.status(200).send({ status: true, msg: "Blog is Deleted successfully " })
    
        if (!findingBlog){
            return res.status(404).send({status:false,msg:"blog IDdoesnt exists"})
        }

    }
    catch (error) {
        res.status(500).send({ status: false, error: error.message });
    }
}
 
//++++++++++++++++++++++++++++++++++++++ Blog Deletion with QueryParams +++++++++++++++++++++++++++++++++++++++
const deleteBlog = async function (req, res) {
    try {
        let queryData =(req.query.category || req.query.authorId || req.query.tags || req.query.subCategory)

        if (!queryData){
            return res.status(404).send({status:false,msg:"You can only Delete blog  by category, authorid, tag name, subcategory name,or unpublished  blog"})
        } else
        {

            let authorId = req.query.authorId
            let category = req.query.category
            let tags = req.query.tags
            let subCategory = req.query.subCategory
            let isPublished = req.query.isPublished

            // if(authorId){
            //     let decodedToken= req.token
            //     if(decodedToken.authorId!==queryData.authorId){
            //         return res.status(403).send({ status: false, msg: "unauthorised access" })
            //     }
            // }

            let obj = {};
            if (authorId) {
                obj.authorId = authorId;
            }
            if (category) {
                obj.category = category
            }

            if (tags) {
                obj.tags = tags
            }
            if (subCategory) {
                obj.subcategory = subCategory
            }
            if (isPublished) {
                obj.isPublished = isPublished
            }
            obj.isDeleted = false
            obj.isPublished =false

            let data = await blogModel.findOne(obj);
          
        if(!data){
            return res.status(404).send({ status: false, msg: "The given data is Invalid or blog is already deleted" })
        }
        //  if(data.authorId._id.toString()!== req.authorId){
        //      return res.status(401).send({ status: false, msg: "Authorisation failed" })

        //  }

        
          let afterDeletion=  await blogModel.updateMany({ obj }, { isDeleted: true, deletedAt: Date.now() },{ new:true } )

                return res.status(200).send({ status: true, msg: "Blog Deleted succesfully" })
        

        
        }
    }


    catch (error) {
      return   res.status(500).send({ message: "Failed", error: error.message });
    }
}


module.exports = { createBlog,filterBlogs, updateBlog, blogDeletionById ,deleteBlog }







