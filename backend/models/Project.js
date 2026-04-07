const mongoose = require('mongoose');

const contributorSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  role: {
    type: String,
    enum: ['owner', 'collaborator', 'viewer'],
    default: 'collaborator',
  },
});

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
    },
    year: {
      type: Number,
      required: [true, 'Year is required'],
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    collaborators: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    contributors: [contributorSchema],
    fileUrl: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['published', 'ongoing'],
      default: 'ongoing',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Project', projectSchema);
