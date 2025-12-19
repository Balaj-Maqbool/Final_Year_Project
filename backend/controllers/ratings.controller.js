const {Rating}=require('../models/ratings.model')
const {Task}=require('../models/tasks.model')

exports.rating=async(req,res)=>{
   const { task_id, rating, comment } = req.body;

  
    const task = await Task.findById(task_id);

    if (!task) return res.status(404).send("Task not found.");
    if (task.status !== 'completed') {
        return res.status(400).send("Cannot rate before task is completed.");
    }

 
    const newRating = new Rating({
        task_id,
        rating,
        comment,
        user_id: req.user._id 
    });

    await newRating.save();
    res.send(newRating);
}