const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const Task = require('../models/Task');
const { isLoggedIn } = require('../middleware/auth');

// GET /dashboard
router.get('/', isLoggedIn, async (req, res) => {
  try {
    const userId = req.session.user._id;
    const isAdmin = req.session.user.role === 'admin';

    let projects, myTasks, stats;

    if (isAdmin) {
      // Admin sees projects they created
      projects = await Project.find({ admin: userId }).populate('members', 'name email');
      const projectIds = projects.map(p => p._id);
      myTasks = await Task.find({ project: { $in: projectIds } })
        .populate('assignedTo', 'name')
        .populate('project', 'name')
        .sort({ dueDate: 1 });
    } else {
      // Member sees projects they're in
      projects = await Project.find({ members: userId }).populate('admin', 'name');
      myTasks = await Task.find({ assignedTo: userId })
        .populate('project', 'name')
        .populate('assignedTo', 'name')
        .sort({ dueDate: 1 });
    }

    stats = {
      total: myTasks.length,
      todo: myTasks.filter(t => t.status === 'Todo').length,
      inProgress: myTasks.filter(t => t.status === 'In Progress').length,
      completed: myTasks.filter(t => t.status === 'Completed').length,
      overdue: myTasks.filter(t => t.status === 'Overdue').length,
    };

    res.render('dashboard/index', {
      title: 'Dashboard',
      projects,
      myTasks,
      stats,
      isAdmin
    });
  } catch (err) {
    console.error(err);
    res.render('error', { title: 'Error', message: err.message });
  }
});

module.exports = router;
