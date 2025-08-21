# TaskFlow Developer Guide

This guide provides technical details and documentation for developers who want to understand, modify, or extend the TaskFlow application.

## Tech Stack

TaskFlow is built with the following technologies:

### Frontend
- **React**: UI library for building the user interface
- **Vite**: Build tool and development server
- **TanStack Query (React Query)**: Data fetching, caching, and state management
- **Wouter**: Lightweight routing library
- **React DnD**: Drag and drop functionality for the task board
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: Reusable UI component library
- **Lucide React**: Icon library
- **Zod**: Schema validation

### Backend
- **Node.js**: JavaScript runtime
- **Express**: Web framework
- **JSON Web Tokens (JWT)**: Authentication mechanism
- **Drizzle ORM**: Object-Relational Mapping
- **In-memory Storage**: Default storage mechanism

## Architecture

### Frontend Architecture

The frontend follows a component-based architecture with the following structure:

1. **Pages**: High-level components that represent entire views/routes
2. **Components**: Reusable UI elements used across pages
3. **Hooks**: Custom React hooks for state management and business logic
4. **API Layer**: TanStack Query provides a layer for data fetching and caching

#### Key Frontend Concepts

- **State Management**: Uses React's built-in useState/useContext combined with TanStack Query for server state
- **Data Fetching**: API calls are abstracted through the `apiRequest` function in `queryClient.ts`
- **Routing**: Navigation is handled by Wouter's `useLocation` and `Link` components
- **Form Handling**: Forms use React Hook Form with Zod validation
- **Authentication**: User sessions are managed through JWT tokens stored in localStorage
- **Theming**: Application uses a theme.json file for consistent styling

### Backend Architecture

The backend follows a simple layered architecture:

1. **Routes Layer**: API endpoints defined in `routes.ts`
2. **Storage Layer**: Data persistence handled by the Storage interface in `storage.ts`
3. **Schema Layer**: Data models defined in `shared/schema.ts`

#### Key Backend Concepts

- **API Design**: RESTful API with JSON payloads
- **Authentication**: JWT middleware for protected routes
- **Storage Abstraction**: IStorage interface allows for easy switching between storage implementations
- **Data Validation**: Input validation using Zod schemas
- **Error Handling**: Consistent error format returned to the client

## Database Schema

TaskFlow uses the following data models:

### User
- id: number (primary key)
- name: string
- email: string
- username: string
- password: string (hashed)

### Task
- id: number (primary key)
- title: string
- status: string (todo, in_progress, completed)
- priority: string (low, medium, high)
- dueDate: string (optional)
- assigneeId: number (optional, foreign key to User)
- projectId: number (optional, foreign key to Project)

### Project
- id: number (primary key)
- title: string
- description: string
- status: string
- progress: number
- dueDate: string

### ProjectMember
- projectId: number (foreign key to Project)
- userId: number (foreign key to User)

### Activity
- id: number (primary key)
- userId: number (foreign key to User)
- action: string
- target: string
- targetId: number (optional)
- createdAt: string

## Authentication Flow

1. User submits login/signup form
2. Server validates credentials
3. If valid, server generates a JWT token with user information
4. Token is returned to the client
5. Client stores token in localStorage
6. For subsequent requests, token is included in the Authorization header
7. Server validates token on protected routes

## API Endpoints

### Authentication
- `POST /api/auth/signup`: Register a new user
- `POST /api/auth/login`: Authenticate a user

### Tasks
- `GET /api/tasks`: Get all tasks for the authenticated user
- `POST /api/tasks`: Create a new task
- `PUT /api/tasks/:id`: Update a task
- `DELETE /api/tasks/:id`: Delete a task

### Projects
- `GET /api/projects`: Get all projects for the authenticated user
- `GET /api/projects/:id`: Get project details
- `POST /api/projects`: Create a new project
- `PUT /api/projects/:id`: Update a project
- `GET /api/projects/:id/tasks`: Get tasks for a project
- `POST /api/projects/:id/tasks`: Create a task for a project

### Project Members
- `GET /api/projects/:id/members`: Get project members
- `POST /api/projects/:id/members`: Add a member to a project
- `DELETE /api/projects/:id/members/:userId`: Remove a member from a project

### Activities
- `GET /api/activities`: Get recent activities for the authenticated user

## Extending the Application

### Adding a New Feature

1. **Define the data model**: Update the schema in `shared/schema.ts`
2. **Update the storage interface**: Add new methods to IStorage in `server/storage.ts`
3. **Implement the storage methods**: Add implementation to MemStorage
4. **Add API routes**: Create new endpoints in `server/routes.ts`
5. **Create UI components**: Add components in `client/src/components`
6. **Add page components**: If needed, create new pages in `client/src/pages`
7. **Update routing**: Add new routes in `client/src/App.tsx`

### Switching to a Persistent Database

To replace the in-memory storage with a persistent database:

1. Create a new implementation of the IStorage interface
2. Use Drizzle ORM to connect to your database of choice
3. Implement all required methods
4. Update the storage export in `server/storage.ts`

### Adding Authentication Providers

To add social login or other authentication methods:

1. Add the relevant libraries (OAuth, etc.)
2. Create new authentication routes in `server/routes.ts`
3. Update the login/signup UI components
4. Ensure JWT token generation is consistent

## Performance Considerations

- **Query Optimization**: Use appropriate query keys and caching strategies
- **Lazy Loading**: Implement code splitting for larger pages
- **Memoization**: Use React.memo and useMemo where appropriate
- **Virtualization**: For long lists, consider using a virtualized list component

## Testing

The application can be tested at different levels:

- **Unit Tests**: Test individual components and functions
- **Integration Tests**: Test interactions between components
- **API Tests**: Test the backend API endpoints
- **End-to-End Tests**: Test the full application flow

## Deployment Strategies

For production deployment, consider:

1. **Static Hosting**: Deploy the frontend to a CDN or static hosting service
2. **API Server**: Deploy the backend to a Node.js hosting service
3. **Database**: Set up a production database
4. **Authentication**: Ensure secure JWT secret management
5. **Environment Variables**: Configure environment-specific settings

## Troubleshooting

Common issues and solutions:

- **API Connectivity**: Check CORS configuration and proxy settings
- **Authentication Issues**: Verify token generation and validation
- **Data Fetching Problems**: Ensure proper query invalidation after mutations
- **UI Inconsistencies**: Check state management and component re-renders

## Resource Recommendations

- [React Documentation](https://reactjs.org/docs/getting-started.html)
- [TanStack Query Documentation](https://tanstack.com/query/latest)
- [Express Documentation](https://expressjs.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [JWT.io](https://jwt.io/)