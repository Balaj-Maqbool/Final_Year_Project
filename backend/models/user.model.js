const mongoose = require("mongoose");
const Joi = require("joi");
const jwt=require('jsonwebtoken')
require('dotenv').config

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 100,
  },
  email: {
    type: String,
    unique: true,
    minlength: 5,
    maxlength: 255,
    required: true,
  },
  password: {
    type: String,
    minlength: 6,
    maxlength: 1024,
    required: true,
  },
  role: {
    type: String,
    enum: ["freelancer", "admin"],
    required:true
  },
  skills: {
    type: [String],
    default: [],
  },
  bio: {
    type: String,
    // required:true,
    default: "",
    maxlength: 500,
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0,
  },
});



userSchema.methods.generateAuthToken=function(){
  if (!process.env.JWT_PRIVATE_KEY) {
  throw new Error('FATAL ERROR: JWT_PRIVATE_KEY is not defined.');
}

 const token=jwt.sign({_id:this._id,role:this.role}, process.env.JWT_PRIVATE_KEY,
 {expiresIn:'7d'})
 return token
}
const User = mongoose.model("User", userSchema);

function validateUser(User) {
  const schema = Joi.object({
    name: Joi.string().min(3).max(50).required(),
    email: Joi.string().min(5).max(255).required().email(),
    password: Joi.string().min(6).max(255).required(),
    role: Joi.string().valid('admin', 'freelancer').required(),
    skills: Joi.array().items(Joi.string()),
    bio: Joi.string().max(500),
  });
  return schema.validate(User);
}
exports.User = User;
exports.validate = validateUser;
