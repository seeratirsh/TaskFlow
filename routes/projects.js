const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const User = require('../models/User');
const Task = require('../models/Task');
const { isLoggedIn, isAdmin } = require('../middleware/auth');

// GET /projects - list all projects for current user
router.get('/', isLoggedIn, async (req, res) => {
  const userId = req.session.user._id;
  const isAdminUser = req.session.user.role === 'admin';
  const projects = isAdminUser
    ? await Project.find({ admin: userId }).populate('members', 'name email')
    : await Project.find({ members: userId }).populate('admin', 'name');
  res.render('projects/index', { title: 'Projects', projects, isAdmin: isAdminUser });
});

// GET /projects/new
router.get('/new', isLoggedIn, isAdmin, (req, res) => {
  res.render('projects/new', { title: 'New Project', error: null });
});

// POST /projects
router.post('/', isLoggedIn, isAdmin, async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.render('projects/new', { title: 'New Project', error: 'Project name is required.' });
    const project = new Project({ name, description, admin: req.session.user._id, members: [] });
    await project.save();
    res.redirect(`/projects/${project._id}`);
  } catch (err) {
    res.render('projects/new', { title: 'New Project', error: err.message });
  }
});

// GET /projects/:id
router.get('/:id', isLoggedIn, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('admin', 'name email')
      .populate('members', 'name email');
    if (!project) return res.status(404).render('error', { title: 'Not Found', message: 'Project not found.' });

    const tasks = await Task.find({ project: project._id })
      .populate('assignedTo', 'name')
      .populate('createdBy', 'name')
      .sort({ dueDate: 1 });

    const isAdminUser = req.session.user.role === 'admin' &&
      project.admin._id.toString() === req.session.user._id.toString();

    // Get all members for task assignment dropdown
    const allMembers = [project.admin, ...project.members];

    res.render('projects/show', {
      title: project.name,
      project,
      tasks,
      isAdmin: isAdminUser,
      allMembers
    });
  } catch (err) {
    res.render('error', { title: 'Error', message: err.message });
  }
});

// POST /projects/:id/members - add member by email
router.post('/:id/members', isLoggedIn, isAdmin, async (req, res) => {
  try {
    const { email } = req.body;
    const project = await Project.findById(req.params.id);
    if (!project) return res.redirect('/projects');

    const user = await User.findOne({ email });
    if (!user) return res.redirect(`/projects/${req.params.id}?error=User not found`);
    if (project.members.includes(user._id) || project.admin.toString() === user._id.toString()) {
      return res.redirect(`/projects/${req.params.id}?error=User already in project`);
    }

    project.members.push(user._id);
    await project.save();
    res.redirect(`/projects/${req.params.id}`);
  } catch (err) {
    res.render('error', { title: 'Error', message: err.message });
  }
});

// DELETE /projects/:id
router.delete('/:id', isLoggedIn, isAdmin, async (req, res) => {
  try {
    await Task.deleteMany({ project: req.params.id });
    await Project.findByIdAndDelete(req.params.id);
    res.redirect('/projects');
  } catch (err) {
    res.render('error', { title: 'Error', message: err.message });
  }
});

module.exports = router;
