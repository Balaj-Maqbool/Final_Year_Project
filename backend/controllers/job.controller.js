const express = require("express");

const { Job, validate } = require("../models/job.model");
const { Bid } = require("../models/bids.model");

exports. assignJob = async (req, res) => {
  const { bidId } = req.body;
  const jobId = req.params.id;

  const bid = await Bid.findById(bidId);
  if (!bid) return res.status(404).send("Bid not found");

  if (bid.job_id.toString() !== jobId) {
    return res.status(400).send("Bid does not belong to this job");
  }

  const job = await Job.findByIdAndUpdate(
    jobId,
    {
      status: "Assigned",
      assignedTo: bid.user_id,
    },
    { new: true }
  );

  if (!job) return res.status(404).send("Job not found");

  bid.status = "Accepted";
  await bid.save();

  await Bid.updateMany(
    { job_id: jobId, _id: { $ne: bidId } },
    { $set: { status: "Rejected" } }
  );

  res.send(job);
};

exports.getJob = async (req, res) => {
  const job = await Job.find().sort("title");
  res.send(job);
};

exports.CreateJob = async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(404).send(error.details[0].message);

  let job = new Job({
    title: req.body.title,
    description: req.body.description,
    budget: req.body.budget,
    deadline: req.body.deadline,
    category: req.body.category,
    status: req.body.status,
  });
  job = await job.save();
  res.send(job);
};

exports.updateJob = async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(404).send(error.details[0].message);

  let job = await Job.findByIdAndUpdate(
    req.params.id,
    {
      title: req.body.title,
      description: req.body.description,
      budget: req.body.budget,
      deadline: req.body.deadline,
      category: req.body.category,
      status: req.body.status,
    },
    { new: true }
  );
  if (!job) return res.status(404).send("job could not be found");
  res.send(job);
};

exports.deleteJob = async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(404).send(error.details[0].message);

  const job = await Job.findByIdAndDelete(req.params.id);
  if (!job) return res.status(404).send("job could not be found");
  res.send(job);
};

exports.getJobById = async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(404).send(error.details[0].message);

  const job = await Job.findById(req.params.id);
  if (!job) return res.status(404).send("job could not be found");
  res.send(job);
};

// GET /api/jobs/:jobId/bids
exports.getBidsForJob = async (req, res) => {
  const bids = await Bid.find({ job_id: req.params.jobId }).populate('user_id', 'name skills');
  res.send(bids);
};
