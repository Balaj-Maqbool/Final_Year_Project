const{Message,validate}=require('../models/messages.model')

exports.newMessage = async (req, res) => {
    // Override from_user_id using authenticated user's ID
    const messageData = {
        ...req.body,
        from_user_id: req.user._id  
    };

    const { error } = validate(messageData);
    if (error) return res.status(400).send(error.details[0].message);
 
    try {
        let message = new Message({
            job_id: messageData.job_id,
      from_user_id: messageData.from_user_id, 
            to_user_id: messageData.to_user_id,
            content: messageData.content,
            file_url: messageData.file_url,
            timestamp: messageData.timestamp  // optional
        });

        await message.save();
        res.status(201).send(message);
    } catch (err) {
        console.error("Error saving message:", err);
        res.status(500).send("Internal Server Error");
    }
};



exports.getJobMessages = async (req, res) => {
    const { jobId } = req.params;
    const currentUserId = req.user._id; 
    
    const messages = await Message.find({
        job_id: jobId,
        $or: [
            { from_user_id: currentUserId },
            { to_user_id: currentUserId }
        ]
    }) .populate('from_user_id', 'name email') 
    .populate('to_user_id', 'name email')
    .sort({ timestamp: 1 });


    if (messages.length === 0) {
        return res.status(403).send("You are not authorized to view these messages or no messages exist.");
    }

    res.send(messages);
};
