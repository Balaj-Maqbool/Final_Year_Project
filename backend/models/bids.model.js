const mongoose = require("mongoose");
const Joi = require("joi");

const bidSchema = new mongoose.Schema({
  job_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Job",
    required: true,
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  bid_amount: {
    type: Number,
    required: true,
  },
  message: {
    type: String,
    maxlength: 1500,
  },
  // timeline: {
  //   start_date: {
  //     type: Date,
  //     required: true,
  //   },                       
  //   end_date: {
  //     type: Date,
  //     required: true,
  //   },
  // },
  status: {
    type: String,
    enum: ["Pending", "Accepted", "Rejected"],
    default: "Pending",
  },
});
const Bid = mongoose.model("Bid", bidSchema);

function validateBid(Bid) {
  const schema = Joi.object({
    job_id: Joi.string()
      .regex(/^[0-9a-fA-F]{24}$/)
      .required()
      .messages({
        "string.pattern.base": "Invalid Job ID format",
        "any.required": "Job ID is required",
      }),

    // user_id: Joi.string()
    //   .regex(/^[0-9a-fA-F]{24}$/)
    //   .required()
    //   .messages({
    //     "string.pattern.base": "Invalid User ID format",
    //     "any.required": "User ID is required",
    //   }),

    bid_amount: Joi.number().positive().required().messages({
      "number.base": "Bid amount must be a number",
      "number.positive": "Bid amount must be positive",
      "any.required": "Bid amount is required",
    }),

    message: Joi.string().max(1500).allow("", null),

    status: Joi.string().valid("Pending", "Accepted", "Rejected").optional(),
  });

  return schema.validate(Bid);
}

exports.Bid=Bid
exports.validate=validateBid
