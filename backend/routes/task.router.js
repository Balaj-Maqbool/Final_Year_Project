const express = require("express");
const router = express.Router();
const taskController=require('../controllers/task.controller')
const auth=require('../middleware/auth.middleware')
const freelancer=require('../middleware/freelancer.middleware')
const admin=require('../middleware/admin.middleware')


router.post('/',[auth,admin],taskController.createTask)
router.patch('/:id',[auth,admin],taskController.updateTask)

module.exports=router