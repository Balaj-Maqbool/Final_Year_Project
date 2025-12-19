const express = require("express");
const jwt=require('jsonwebtoken')
const router = express.Router();

const {registerUser} = require('../controllers/userRegister.controller');

router.post('/',registerUser)

module.exports=router

