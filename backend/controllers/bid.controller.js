const { Bid, validate } = require("../models/bids.model");

exports.newBid = async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(404).send(error.details[0].message);

  let bid = new Bid({
    job_id: req.body.job_id,
    user_id: req.user._id,
    bid_amount: req.body.bid_amount,
    message: req.body.message,
    // timeline: {
    //   start_date: req.body.timeline.start_date,
    //   end_date: req.body.timeline.end_date,
    // },
    status: req.body.status,
  });
  bid = await bid.save();
  res.send(bid);
};

exports.getBid = async (req, res) => {
  try {
    const bid = await Bid.findById(req.params.id)
      .populate("job_id", "title")
      .populate("user_id", "name skills");

    if (!bid) return res.status(404).send("Bid with given ID not found");

    res.send(bid);
  } catch (err) {
    res.status(400).send("Invalid Bid ID");
  }
};
