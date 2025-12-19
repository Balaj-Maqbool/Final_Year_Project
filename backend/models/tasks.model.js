const mongoose=require('mongoose')

const Joi=require('joi')

const taskSchema=new mongoose.Schema({
   job_id:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'Job',
    required:true
   } ,
   title:{
    type:String,
    required:true,
    maxlength:200
   },
   status:{
    type:String,
    enum:['todo','doing','completed'],
    default:'todo'
   },
   assigned_user_id:{
   type:mongoose.Schema.Types.ObjectId,
    ref:'User',
    required:true
   }
})

const Task = mongoose.model('Task', taskSchema);

function validateTask(Task){
   const schema=Joi.object({
      job_id:Joi.string().required(),
      title:Joi.string().required(),
      status:Joi.string(),
      assigned_user_id:Joi.string().required()
   })
   return schema.validate(Task)
}

exports.Task=Task
exports.validate=validateTask