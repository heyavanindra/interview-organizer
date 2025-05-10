import mongoose from 'mongoose';

const interviewSchema = new mongoose.Schema({
  interviewer: String,
  interviewee: String,
  time: String,
  link: String,
  participants: [String],
  subject: String,
});

export const Interview = mongoose.models.Interview || mongoose.model('Interview', interviewSchema);
