const mongoose = require("mongoose");

const StudentSchema = new mongoose.Schema({
  studentID: String,
  studentName: String,
  course: String,
  presentDate: String,
});

module.exports = mongoose.model("Student", StudentSchema);
