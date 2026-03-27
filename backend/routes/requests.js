const express = require('express');
const router = express.Router();
const Request = require('../models/Request');
const Project = require('../models/Project');
const { protect } = require('../middleware/auth');

// @route   POST /api/requests/:projectId
// @desc    Send a collaboration request
// @access  Protected
router.post('/:projectId', protect, async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Can't request to own project
    if (project.ownerId.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot request collaboration on your own project' });
    }

    // Already a collaborator
    if (project.collaborators.map((c) => c.toString()).includes(req.user._id.toString())) {
      return res.status(400).json({ message: 'You are already a collaborator on this project' });
    }

    // Check for existing pending request
    const existing = await Request.findOne({
      projectId: req.params.projectId,
      fromUser: req.user._id,
      status: 'pending',
    });

    if (existing) {
      return res.status(400).json({ message: 'You already have a pending request for this project' });
    }

    const request = await Request.create({
      projectId: req.params.projectId,
      fromUser: req.user._id,
      toUser: project.ownerId,
      message: req.body.message || '',
    });

    await request.populate('fromUser', 'name email');
    await request.populate('projectId', 'title department');

    res.status(201).json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/requests/incoming
// @desc    Get all incoming requests for current user's projects
// @access  Protected
router.get('/incoming', protect, async (req, res) => {
  try {
    const requests = await Request.find({ toUser: req.user._id })
      .populate('fromUser', 'name email department')
      .populate('projectId', 'title department year')
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/requests/outgoing
// @desc    Get all requests sent by current user
// @access  Protected
router.get('/outgoing', protect, async (req, res) => {
  try {
    const requests = await Request.find({ fromUser: req.user._id })
      .populate('toUser', 'name email')
      .populate('projectId', 'title department year')
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/requests/:id/approve
// @desc    Approve collaboration request
// @access  Protected (project owner only)
router.put('/:id/approve', protect, async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (request.toUser.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to approve this request' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'Request is already processed' });
    }

    request.status = 'accepted';
    await request.save();

    // Add user to project collaborators and contributors
    await Project.findByIdAndUpdate(request.projectId, {
      $addToSet: {
        collaborators: request.fromUser,
        contributors: { userId: request.fromUser, role: 'collaborator' },
      },
    });

    res.json({ message: 'Request approved successfully', request });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/requests/:id/reject
// @desc    Reject collaboration request
// @access  Protected (project owner only)
router.put('/:id/reject', protect, async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (request.toUser.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to reject this request' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'Request is already processed' });
    }

    request.status = 'rejected';
    await request.save();

    res.json({ message: 'Request rejected', request });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
