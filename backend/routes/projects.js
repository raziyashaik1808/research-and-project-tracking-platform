const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

// @route   GET /api/projects
// @desc    Get all projects with optional filters
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { department, year } = req.query;
    const filter = {};

    if (department) filter.department = department;
    if (year) filter.year = parseInt(year);

    const projects = await Project.find(filter)
      .populate('ownerId', 'name email department')
      .populate('collaborators', 'name email')
      .populate('contributors.userId', 'name email')
      .sort({ createdAt: -1 });

    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/projects/:id
// @desc    Get single project
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('ownerId', 'name email department')
      .populate('collaborators', 'name email department')
      .populate('contributors.userId', 'name email department');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/projects
// @desc    Create new project
// @access  Protected
router.post('/', protect, upload.single('file'), async (req, res) => {
  try {
    const { title, description, department, year, status } = req.body;

    if (!title || !description || !department || !year) {
      return res.status(400).json({ message: 'Please fill all required fields' });
    }

    const fileUrl = req.file ? `/uploads/${req.file.filename}` : '';

    const project = await Project.create({
      title,
      description,
      department,
      year: parseInt(year),
      ownerId: req.user._id,
      status: status || 'ongoing',
      fileUrl,
      contributors: [{ userId: req.user._id, role: 'owner' }],
    });

    const populated = await project.populate('ownerId', 'name email department');
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/projects/:id
// @desc    Update project
// @access  Protected (owner or collaborator)
router.put('/:id', protect, upload.single('file'), async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const isOwner = project.ownerId.toString() === req.user._id.toString();
    const isCollaborator = project.collaborators
      .map((c) => c.toString())
      .includes(req.user._id.toString());

    if (!isOwner && !isCollaborator) {
      return res.status(403).json({ message: 'Not authorized to edit this project' });
    }

    const { title, description, department, year, status } = req.body;

    if (title) project.title = title;
    if (description) project.description = description;
    if (status) project.status = status;

    // Only owner can change department/year
    if (isOwner) {
      if (department) project.department = department;
      if (year) project.year = parseInt(year);
    }

    if (req.file) {
      project.fileUrl = `/uploads/${req.file.filename}`;
    }

    const updated = await project.save();
    await updated.populate('ownerId', 'name email department');
    await updated.populate('collaborators', 'name email');

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/projects/:id
// @desc    Delete project (owner only)
// @access  Protected
router.delete('/:id', protect, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (project.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only owner can delete this project' });
    }

    await project.deleteOne();
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/projects/user/mine
// @desc    Get current user's projects
// @access  Protected
router.get('/user/mine', protect, async (req, res) => {
  try {
    const projects = await Project.find({
      $or: [
        { ownerId: req.user._id },
        { collaborators: req.user._id },
      ],
    })
      .populate('ownerId', 'name email')
      .sort({ createdAt: -1 });

    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
