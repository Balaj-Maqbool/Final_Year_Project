const { Task, validate } = require("../models/tasks.model");

exports.createTask = async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

const assignedUserId = req.body.assigned_user_id || job.assignedTo;
  
  let task = new Task({
    job_id: req.body.job_id,
    title: req.body.title,
    status: req.body.status,
    assigned_user_id: assignedUserId,
  });
  await task.save();
  res.send(task);
};

exports.updateTask = async (req, res) => {


  const { status } = req.body;
  if (!["todo", "doing", "completed"].includes(status)) {
    return res.status(400).send("Invalid status");
  }

  const task = await Task.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true }
  );

  if (!task) return res.status(404).send("Task not found");
  res.send(task);
};
