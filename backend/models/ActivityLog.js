const mongoose = require("mongoose");

const activityLogSchema = mongoose.Schema(
  {
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    action: {
      type: String,
      required: true
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId
    },
    details: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("ActivityLog", activityLogSchema);
