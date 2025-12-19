const bcrypt = require('bcrypt');
const { User, validate } = require('../models/user.model');
const config=require('config')

exports.registerUser = async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const user = new User({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    role:req.body.role
  });
  //password encryption
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);

  await user.save();
const token=user.generateAuthToken()

  res.header('x-auth-token',token).send({ _id: user._id, name: user.name, email: user.email });
};


