const express = require("express");
const router = express.Router();
const jobController=require('../controllers/job.controller')
const auth=require('../middleware/auth.middleware')
const freelancer=require('../middleware/freelancer.middleware')
const admin=require('../middleware/admin.middleware')

router.patch('/:id/assign',[auth,admin], jobController.assignJob);
router.get('/',[auth,admin],jobController.getJob)
router.post('/',jobController.CreateJob)
router.put('/:id',[auth,admin],jobController.updateJob)
router.delete('/:id',[auth,admin],jobController.deleteJob)
router.get('/:id',[auth,admin],jobController.getJobById)
router.get('/:id/bids',[auth,admin],jobController.getBidsForJob)
// GET /api/jobs/:jobId/bids

module.exports=router