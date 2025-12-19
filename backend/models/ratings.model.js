const mongoose=require('mongoose')
const Joi=require('joi')

const ratingSchema=new mongoose.Schema({
job_id:{
         type:mongoose.Schema.Types.ObjectId,
            ref:'Job',
            required:true
},
rated_by_user_id:{
     type:mongoose.Schema.Types.ObjectId,
            ref:'User',
            required:true
},
rated_user_id:{
   type:mongoose.Schema.Types.ObjectId,
            ref:'User',
            required:true 
},
rating:{
    type:Number,
    min:1,
    max:5
},
comment:{
    type:String,
    maxlength:500
}

})

const Rating = mongoose.model('Rating', ratingSchema);

exports.Rating=Rating