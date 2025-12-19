
const mongoose=require('mongoose')

const Joi=require('joi')

const messageSchema = new mongoose.Schema({
  job_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job', 
    required: true
  },
  from_user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  to_user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: function () {
      return !this.file_url; 
    },
    trim: true
  },
  file_url: {
    type: String,
    required: function () {
      return !this.content; 
    }
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const Message = mongoose.model('Message', messageSchema);



function validateMessage(Message) {
  const schema = Joi.object({
    job_id: Joi.string().required(),
    from_user_id: Joi.string().required(),
    to_user_id: Joi.string().required(),
    content: Joi.string().allow('', null),
    file_url: Joi.string().uri().allow('', null),
    timestamp: Joi.date()
  }).or('content', 'file_url'); 

  return schema.validate(message);
}

exports.Message=Message
exports.validate=validateMessage
