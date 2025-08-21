# TaskFlow - Task Management Application

TaskFlow is a full-stack web application for task and project management. It features user authentication, task boards with drag-and-drop functionality, project management, and team collaboration.

![TaskFlow Dashboard](attached_assets/Screenshot%202025-02-28%20004336.png)

## Features

- User authentication (signup and login)
- Task management with drag-and-drop kanban board
- Task priority levels and due dates
- Project creation and management
- Team collaboration with member invitations
- Activity tracking
- Responsive design for desktop and mobile devices
- Dark mode support

## Prerequisites

Before you begin, ensure you have the following installed on your local machine:

- [Node.js](https://nodejs.org/) (version 18.x or later)
- [npm](https://www.npmjs.com/) (usually comes with Node.js)
- A text editor (VSCode, Sublime Text, etc.)
- A modern web browser (Chrome, Firefox, Safari, Edge)

## Installation

Follow these steps to set up the project locally:

1. **Clone the repository**

```bash
git clone <repository-url>
cd taskflow
```

2. **Install dependencies**

```bash
npm install
```

This will install all required dependencies for both the client and server.

## Running the Application Locally

After completing the installation, you can run the application in development mode:

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

This command starts both the backend server and frontend development server. The application will be available at:

- Frontend: http://0.0.0.0:5000
- Backend API: http://0.0.0.0:5000/api

The development server includes:
- Hot-reloading for React components
- Auto-restart for Express server
- API request proxying
- Automatic TypeScript compilation
- Tailwind CSS processing

To access the application:
1. Click the "Run" button in Replit
2. Wait for the development server to start
3. Click the WebView tab or browser preview

The development server includes:
- Hot-reloading for React components
- Auto-restart for the Express server
- API request proxying

## Project Structure

The project follows a modern full-stack JavaScript structure:

```
taskflow/
├── client/             # Frontend React application
│   ├── src/
│   │   ├── components/ # Reusable UI components
│   │   ├── hooks/      # Custom React hooks
│   │   ├── lib/        # Utility functions and config
│   │   ├── pages/      # Page components
│   │   ├── App.tsx     # Main application component
│   │   └── main.tsx    # Entry point
├── server/             # Backend Express server
│   ├── index.ts        # Server entry point
│   ├── routes.ts       # API route definitions
│   ├── storage.ts      # Data storage interface
│   └── vite.ts         # Vite configuration
├── shared/             # Shared code between client and server
│   └── schema.ts       # Data model definitions
└── package.json        # Project configuration
```

## Authentication

TaskFlow uses JSON Web Tokens (JWT) for authentication. When a user logs in, a token is stored in the browser's localStorage and included in API requests in the Authorization header.

## Data Storage

By default, TaskFlow uses an in-memory storage system for development. This means data will be reset when the server restarts. For production use, you should implement a persistent database storage solution.

## Building for Production

To build the application for production:

```bash
npm run build
```

This command creates optimized production builds for both the client and server in the `dist` directory.

## Deployment

To run the production build:

```bash
npm start
```

For deploying to a hosting service:

1. Build the application as described above
2. Deploy the `dist` directory to your hosting provider
3. Set up the appropriate environment variables
4. Configure your web server to serve the static files and proxy API requests

## Customization

- **Themes**: Edit the `theme.json` file to customize the application's color scheme.
- **Styling**: The application uses Tailwind CSS and shadcn/ui for styling. You can customize these in their respective configuration files.

## License

[MIT](LICENSE)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.