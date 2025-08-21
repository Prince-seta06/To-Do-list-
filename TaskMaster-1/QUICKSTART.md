# TaskFlow Quick Start Guide

This guide will get you up and running with TaskFlow as quickly as possible.

## Installation

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Steps

1. Clone the repository:
```bash
git clone <repository-url>
cd taskflow
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to:
```
http://localhost:5000
```

## Basic Usage

### Creating an Account

1. Click the "Sign Up" button on the homepage
2. Fill out the registration form with your details
3. Click "Sign Up" to create your account
4. You'll be automatically logged in and redirected to the dashboard

### Logging In

1. Click the "Login" button on the homepage
2. Enter your username/email and password
3. Click "Login" to access your dashboard

### Creating a Task

1. From the dashboard, click "New Task" 
2. Enter the task title
3. Select priority (Low, Medium, High)
4. Set a due date (optional)
5. Click "Add Task" to create it

### Managing Tasks

- **View Tasks**: All tasks appear on your dashboard board
- **Move Tasks**: Drag and drop tasks between To Do, In Progress, and Completed columns
- **Delete a Task**: Click the trash icon on any task card

### Creating a Project

1. From the dashboard, click "New Project"
2. Enter the project title and description
3. Set a due date 
4. Click "Create Project"

### Project Management

1. Click on any project from the dashboard to view its details
2. Add tasks specific to the project
3. Invite team members by clicking "Invite Member"
4. Track project progress on the project details page

## Keyboard Shortcuts

- `N`: Create a new task (when on dashboard)
- `P`: Create a new project (when on dashboard)
- `Esc`: Close any open modal or dialog

## Mobile Usage

TaskFlow is fully responsive and works on mobile devices:
- Swipe tasks to move between columns
- Tap and hold to drag tasks
- Access all features through the mobile-optimized interface

## Troubleshooting

### Common Issues

- **Can't log in**: Make sure you're using the correct username/email and password
- **Tasks not appearing**: Refresh the page or check if you're in the correct project
- **Can't create project**: Ensure you're logged in and have completed all required fields

### Support

If you encounter any issues, please:
1. Check the [README.md](README.md) file for more details
2. For developers, consult the [DEVELOPER.md](DEVELOPER.md) file
3. Contact support at support@taskflow.example.com

## Quick Reference

### API Endpoints

- `POST /api/auth/login`: Log in
- `POST /api/auth/signup`: Create account
- `GET /api/tasks`: Get all tasks
- `POST /api/tasks`: Create task
- `GET /api/projects`: Get all projects
- `POST /api/projects`: Create project

### Data Storage

TaskFlow uses in-memory storage by default. Your data will reset when the server restarts.

### Security Notes

- All passwords are securely hashed
- Communication with the server uses secure HTTP requests
- JSON Web Tokens (JWT) are used for authentication