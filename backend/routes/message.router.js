const express = require("express");
const router = express.Router();
const messageController=require('../controllers/message.controller')
const auth=require('../middleware/auth.middleware')


router.post('/',auth,messageController.newMessage)
router.get('/job/:jobId', auth, messageController.getJobMessages);

module.exports=router