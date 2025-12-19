const express = require("express");
const config=require('config')
const router = express.Router();

const  {userLogin}  = require("../controllers/userLogin.controller");


router.post('/',userLogin)

module.exports=router