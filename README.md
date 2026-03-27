ResearchHub — Research & Project Tracking Platform

ResearchHub is a full-stack MERN application built to help students manage, organize, and share their research papers and academic projects efficiently. It provides a simple way to upload work, collaborate with others, and keep everything in one place.

Features

The platform includes the following key features:

User Authentication
Secure registration and login system using JWT.
Project Management
Users can upload, view, update, and delete their projects.
PDF Upload Support
Research papers can be uploaded and stored using Multer.
Smart Filtering
Projects can be filtered by department, academic year, or keywords.
Collaboration System
Users can send collaboration requests and choose to approve or reject them.
Role-Based Access
Different access levels are provided for Owners, Collaborators, and Viewers.
Responsive User Interface
Built with Tailwind CSS, providing a clean and modern dark-themed interface.
Folder Structure Overview

The project is divided into two main parts:

Backend
Handles API development, authentication, database interactions, and file uploads.
Frontend
Manages the user interface and user experience.

Each section is organized into folders such as models, routes, components, pages, and utilities to maintain clarity and scalability.

Prerequisites

Before running the project, ensure the following are installed:

Node.js (version 16 or higher)
MongoDB (running locally)
npm (comes with Node.js)
Setup and Execution
Step 1: Obtain the Project

Clone the repository using Git or download it and navigate to the project directory.

Step 2: Start MongoDB

Ensure MongoDB is running:

On Linux/Mac: use mongod
On Windows: it may already be running as a service or via MongoDB Compass
Step 3: Run the Backend

Navigate to the backend folder and install dependencies:

cd backend
npm install

Check the .env file and configure:

PORT
MONGO_URI
JWT_SECRET

Start the backend server:

npm run dev

The backend will run on:
http://localhost:5000

Step 4: Run the Frontend

Open a new terminal and run:

cd frontend
npm install
npm start

The frontend will run on:
http://localhost:3000

API Overview
Authentication
Register a new user
Login and receive a JWT token
Projects
Retrieve all projects
Retrieve a specific project
Create, update, and delete projects
Get projects created by the logged-in user
Collaboration Requests
Send collaboration requests
View incoming and outgoing requests
Approve or reject requests
Roles and Permissions
Owner
Has full control over the project, including editing, deleting, and managing requests.
Collaborator
Can update project details and contribute to the project.
Viewer
Can only view project details.
Application Pages
Home page (explore projects)
Login page
Registration page
Project details page
User dashboard
Upload project page
Edit project page
Collaboration requests page
Technology Stack
Frontend: React, React Router, Tailwind CSS
Backend: Node.js, Express.js
Database: MongoDB with Mongoose
Authentication: JWT and bcrypt
File Upload: Multer
HTTP Client: Axios
Common Issues and Solutions

MongoDB connection issues
Ensure MongoDB is running and verify the connection string in the .env file.

CORS errors
Confirm that the backend has CORS enabled and the frontend proxy is properly configured.

PDF not opening
Make sure uploaded files are stored in the backend uploads folder and served correctly.