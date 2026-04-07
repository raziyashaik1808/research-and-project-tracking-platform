const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const { cloudinary, upload } = require('../config/cloudinary');
const { protect } = require('../middleware/auth'); // adjust path if different
 
// ─── Helper: extract Cloudinary public_id from a secure_url ───────────────────
function getPublicId(fileUrl) {
  if (!fileUrl) return null;
  // URL format: https://res.cloudinary.com/<cloud>/raw/upload/v123/research-platform/<filename>
  const parts = fileUrl.split('/');
  const folder = parts[parts.length - 2];
  const filename = parts[parts.length - 1].split('.')[0];
  return `${folder}/${filename}`;
}
 
// ─── GET /api/projects ─────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const { department, year, status, search } = req.query;
    const filter = {};
 
    if (department) filter.department = department;
    if (year) filter.year = Number(year);
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
 
    const projects = await Project.find(filter)
      .populate('ownerId', 'name email')
      .populate('collaborators', 'name email')
      .sort({ createdAt: -1 });
 
    res.json({ success: true, data: projects });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
 
// ─── GET /api/projects/:id ─────────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('ownerId', 'name email')
      .populate('collaborators', 'name email')
      .populate('contributors.userId', 'name email');
 
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }
 
    res.json({ success: true, data: project });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
 
// ─── POST /api/projects ────────────────────────────────────────────────────────
router.post('/', protect, upload.single('file'), async (req, res) => {
  try {
    const { title, description, department, year, status } = req.body;
 
    const project = await Project.create({
      title,
      description,
      department,
      year: Number(year),
      status: status || 'ongoing',
      ownerId: req.user._id,
      contributors: [{ userId: req.user._id, role: 'owner' }],
      // Cloudinary returns secure_url — persists across Render deploys
      fileUrl: req.file ? req.file.path : '',
    });
 
    res.status(201).json({ success: true, data: project });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});
 
// ─── PUT /api/projects/:id ─────────────────────────────────────────────────────
router.put('/:id', protect, upload.single('file'), async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }
 
    // Only owner can edit
    if (project.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
 
    const { title, description, department, year, status } = req.body;
    if (title) project.title = title;
    if (description) project.description = description;
    if (department) project.department = department;
    if (year) project.year = Number(year);
    if (status) project.status = status;
 
    // If a new file is uploaded, delete the old one from Cloudinary first
    if (req.file) {
      const oldPublicId = getPublicId(project.fileUrl);
      if (oldPublicId) {
        await cloudinary.uploader.destroy(oldPublicId, { resource_type: 'raw' });
      }
      project.fileUrl = req.file.path; // Cloudinary secure_url
    }
 
    await project.save();
    res.json({ success: true, data: project });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});
 
// ─── DELETE /api/projects/:id ──────────────────────────────────────────────────
router.delete('/:id', protect, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }
 
    if (project.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
 
    // Delete file from Cloudinary
    const publicId = getPublicId(project.fileUrl);
    if (publicId) {
      await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });
    }
 
    await project.deleteOne();
    res.json({ success: true, message: 'Project deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
 
// ─── POST /api/projects/:id/collaborators ──────────────────────────────────────
router.post('/:id/collaborators', protect, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }
 
    if (project.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
 
    const { userId, role } = req.body;
 
    // Add to collaborators array if not already present
    if (!project.collaborators.includes(userId)) {
      project.collaborators.push(userId);
    }
 
    // Add to contributors with role
    const alreadyContributor = project.contributors.find(
      (c) => c.userId.toString() === userId
    );
    if (!alreadyContributor) {
      project.contributors.push({ userId, role: role || 'collaborator' });
    }
 
    await project.save();
    res.json({ success: true, data: project });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});
 
module.exports = router;