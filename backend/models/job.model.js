const mongoose=require('mongoose')
const Joi = require('joi');

const jobSchema=new mongoose.Schema({
title:{
    type:String,
    minlength:3,
    maxlength:200,
    required:true
},
description:{
    type:String,
    required:true,
    maxlength:1000
},
budget:{
    type:Number,
required:true
},
deadline:{
    type:Date,
    required:true
},
category:{
    type:String,
    enum:['webdevelopment','appdevelopment','Ai']
},
status:{
    type:String,
    enum:['Open','Assigned','Completed'],
    required:true,
    default:'Open'
},
poster_id:{
     type: mongoose.Schema.Types.ObjectId,  
    ref: 'User',
    // required: true

},
assignedTo:{
        type: mongoose.Schema.Types.ObjectId,  
    ref:'User'
}

})

const Job=mongoose.model('Job',jobSchema)



function validateJob(Job) {
  const schema = Joi.object({
    title: Joi.string().min(3).max(200).required(),
    description: Joi.string().max(1000).required(),
    budget: Joi.number().required(),
    deadline: Joi.date().iso().required(),
    category: Joi.string().valid('webdevelopment', 'appdevelopment', 'Ai').required(),
    status: Joi.string().valid('Open', 'Assigned', 'Completed'),  
    poster_id: Joi.string()
  });

 return schema.validate(Job);

}

exports.Job=Job
exports.validate=validateJob

