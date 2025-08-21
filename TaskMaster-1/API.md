
# TaskFlow API Documentation

## Authentication Endpoints

### POST /api/auth/signup
Create a new user account.

**Request Body:**
```json
{
  "username": "string",
  "email": "string",
  "password": "string"
}
```

**Response:** 
```json
{
  "token": "string",
  "user": {
    "id": "number",
    "username": "string",
    "email": "string"
  }
}
```

### POST /api/auth/login
Authenticate existing user.

**Request Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "token": "string",
  "user": {
    "id": "number",
    "username": "string",
    "email": "string"
  }
}
```

## Tasks Endpoints

### GET /api/tasks
Get all tasks for authenticated user.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "tasks": [
    {
      "id": "number",
      "title": "string",
      "status": "todo|in_progress|completed",
      "priority": "low|medium|high",
      "dueDate": "string",
      "assigneeId": "number"
    }
  ]
}
```

### POST /api/tasks
Create a new task.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "title": "string",
  "status": "todo|in_progress|completed",
  "priority": "low|medium|high",
  "dueDate": "string",
  "assigneeId": "number"
}
```

## Projects Endpoints

### GET /api/projects
Get all projects for authenticated user.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "projects": [
    {
      "id": "number",
      "title": "string",
      "description": "string",
      "status": "string",
      "progress": "number",
      "dueDate": "string"
    }
  ]
}
```

### POST /api/projects
Create a new project.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "title": "string",
  "description": "string",
  "dueDate": "string"
}
```

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "message": "Invalid request parameters"
}
```

### 401 Unauthorized
```json
{
  "message": "Authentication required"
}
```

### 403 Forbidden
```json
{
  "message": "Insufficient permissions"
}
```

### 404 Not Found
```json
{
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "message": "Internal server error"
}
```
