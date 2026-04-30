const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const Project = require('../models/Project');
const { isLoggedIn, isAdmin } = require('../middleware/auth');

// POST /tasks - create task (admin only)
router.post('/', isLoggedIn, isAdmin, async (req, res) => {
  try {
    const { title, description, assignedTo, dueDate, projectId } = req.body;
    if (!title || !assignedTo || !dueDate || !projectId) {
      return res.redirect(`/projects/${projectId}?error=All fields required`);
    }
    const task = new Task({
      title,
      description,
      assignedTo,
      dueDate: new Date(dueDate),
      project: projectId,
      createdBy: req.session.user._id,
      status: 'Todo'
    });
    await task.save();
    res.redirect(`/projects/${projectId}`);
  } catch (err) {
    res.render('error', { title: 'Error', message: err.message });
  }
});

// PATCH /tasks/:id/status - update task status
router.patch('/:id/status', isLoggedIn, async (req, res) => {
  try {
    const { status } = req.body;
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });

    // Members can only update their own tasks
    const isAdminUser = req.session.user.role === 'admin';
    const isAssigned = task.assignedTo.toString() === req.session.user._id.toString();

    if (!isAdminUser && !isAssigned) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    task.status = status;
    await task.save();
    res.json({ success: true, status: task.status });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /tasks/:id
router.delete('/:id', isLoggedIn, isAdmin, async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    res.redirect(`/projects/${task.project}`);
  } catch (err) {
    res.render('error', { title: 'Error', message: err.message });
  }
});

module.exports = router;
