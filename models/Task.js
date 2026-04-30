const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['Todo', 'In Progress', 'Completed', 'Overdue'],
    default: 'Todo'
  },
  dueDate: {
    type: Date,
    required: true
  }
}, { timestamps: true });

// Auto-mark overdue before any find query
taskSchema.pre(/^find/, async function() {
  await mongoose.model('Task').updateMany(
    { dueDate: { $lt: new Date() }, status: { $in: ['Todo', 'In Progress'] } },
    { $set: { status: 'Overdue' } }
  );
});

module.exports = mongoose.model('Task', taskSchema);
