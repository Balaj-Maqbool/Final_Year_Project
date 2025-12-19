const ratingController=require('../controllers/ratings.controller')
const admin = require('../middleware/admin.middleware')
const auth=require('../middleware/auth.middleware')
const express=require('express')
const router=express.Router()

router.post('/',[auth,admin],ratingController.rating)

module.exports=router