const ActivityLog = require("../models/ActivityLog");

const logActivity = async (adminId, action, targetId, details) => {
  try {
    await ActivityLog.create({
      admin: adminId,
      action,
      targetId,
      details
    });
  } catch (error) {
    console.error("Activity log error:", error);
  }
};

module.exports = logActivity;
