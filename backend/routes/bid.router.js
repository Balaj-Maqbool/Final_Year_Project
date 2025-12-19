const express = require("express");
const router = express.Router();
const bidController=require('../controllers/bid.controller')
const auth=require('../middleware/auth.middleware')
const freelancer=require('../middleware/freelancer.middleware')
const admin=require('../middleware/admin.middleware')


router.post('/',[auth,freelancer],bidController.newBid)
// router.delete('/:id',bidController.deleteJob)
router.get('/:id',[auth,admin],bidController.getBid)

module.exports=router