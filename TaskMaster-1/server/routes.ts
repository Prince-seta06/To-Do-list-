import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import jwt from "jsonwebtoken";
import { loginSchema, insertUserSchema } from "@shared/schema";
import session from "express-session";
import MemoryStore from "memorystore";

const JWT_SECRET = process.env.JWT_SECRET || "secret-key-for-development-only";

// Create memory store for session
const SessionStore = MemoryStore(session);

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup session middleware
  app.use(
    session({
      cookie: { maxAge: 86400000 },
      store: new SessionStore({
        checkPeriod: 86400000, // prune expired entries every 24h
      }),
      resave: false,
      saveUninitialized: false,
      secret: JWT_SECRET,
    })
  );

  // Authentication middleware
  const authenticateJWT = (req: Request, res: Response, next: Function) => {
    const authHeader = req.headers.authorization;
    
    if (authHeader) {
      const token = authHeader.split(' ')[1];
      
      jwt.verify(token, JWT_SECRET, (err: jwt.VerifyErrors | null, user: any) => {
        if (err) {
          return res.status(403).json({ message: "Invalid or expired token" });
        }
        
        (req as any).user = user;
        next();
      });
    } else {
      res.status(401).json({ message: "Authentication required" });
    }
  };

  // Auth routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = loginSchema.parse(req.body);
      
      const user = await storage.getUserByEmail(email);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      const token = jwt.sign(
        { id: user.id, email: user.email, name: user.name },
        JWT_SECRET,
        { expiresIn: '24h' }
      );
      
      res.json({
        message: "Authentication successful",
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          username: user.username
        }
      });
    } catch (error) {
      res.status(400).json({ message: "Invalid request", error });
    }
  });

  app.post("/api/auth/signup", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(409).json({ message: "Email already in use" });
      }
      
      const existingUsername = await storage.getUserByUsername(userData.username);
      if (existingUsername) {
        return res.status(409).json({ message: "Username already taken" });
      }
      
      // Create new user
      const newUser = await storage.createUser(userData);
      
      // Generate token
      const token = jwt.sign(
        { id: newUser.id, email: newUser.email, name: newUser.name },
        JWT_SECRET,
        { expiresIn: '24h' }
      );
      
      res.status(201).json({
        message: "User created successfully",
        token,
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          username: newUser.username
        }
      });
    } catch (error) {
      res.status(400).json({ message: "Invalid request", error });
    }
  });

  // User routes
  app.get("/api/user", authenticateJWT, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        username: user.username
      });
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  });
  
  // Get user by ID
  app.get("/api/users/:id", authenticateJWT, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        username: user.username
      });
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  });

  // Task routes
  app.get("/api/tasks", authenticateJWT, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const tasks = await storage.getTasks(userId);
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  });

  app.post("/api/tasks", authenticateJWT, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      
      // For personal tasks (not in a project), anyone can create tasks for themselves
      // No additional checks needed for personal tasks
      
      // For project tasks, the task should be created through the /api/projects/:id/tasks endpoint
      // This endpoint is primarily for personal tasks, so we'll return an error for project tasks
      if (req.body.projectId) {
        return res.status(400).json({ 
          message: "Project tasks should be created using the project-specific endpoint" 
        });
      }
      
      // For personal tasks, if there's an assigneeId, ensure it's the current user
      // This ensures users can only assign personal tasks to themselves
      if (req.body.assigneeId && req.body.assigneeId !== userId) {
        return res.status(403).json({ 
          message: "You can only assign personal tasks to yourself" 
        });
      }
      
      const task = {
        ...req.body,
        userId,
        // Ensure the task is assigned to the current user
        assigneeId: userId
      };
      
      const newTask = await storage.createTask(task);
      
      // Create activity
      await storage.createActivity({
        userId,
        action: "created",
        target: "task",
        targetId: newTask.id
      });
      
      // If the task belongs to a project, recalculate project progress
      if (newTask.projectId) {
        const projectTasks = await storage.getTasksByProject(newTask.projectId);
        const totalTasks = projectTasks.length;
        
        if (totalTasks > 0) {
          const completedTasks = projectTasks.filter(t => t.status === 'completed').length;
          const progress = Math.round((completedTasks / totalTasks) * 100);
          
          await storage.updateProject(newTask.projectId, { progress });
        }
      }
      
      res.status(201).json(newTask);
    } catch (error) {
      res.status(400).json({ message: "Invalid request", error });
    }
  });

  app.put("/api/tasks/:id", authenticateJWT, async (req, res) => {
    try {
      const taskId = parseInt(req.params.id);
      const userId = (req as any).user.id;
      
      const task = await storage.getTask(taskId);
      
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      let authorized = false;
      
      // The user is authorized to modify the task if any of these conditions are met:
      // 1. They created the task (they are the task owner)
      if (task.userId === userId) {
        authorized = true;
      }
      // 2. They are the project owner
      else if (task.projectId) {
        const project = await storage.getProject(task.projectId);
        if (project && project.userId === userId) {
          authorized = true;
        }
        // 3. They are the assignee of the task
        else if (task.assigneeId === userId) {
          authorized = true;
        }
        // 4. They are a project member (if the task belongs to a project)
        else if (await storage.isProjectMember(task.projectId, userId)) {
          // Project members can update any task in the project
          authorized = true;
        }
      }
      // 5. They are the assignee of a personal task
      else if (task.assigneeId === userId) {
        authorized = true;
      }
      
      if (!authorized) {
        return res.status(403).json({ message: "Not authorized" });
      }
      
      const updatedTask = await storage.updateTask(taskId, req.body);
      
      // Create activity
      await storage.createActivity({
        userId,
        action: "updated",
        target: "task",
        targetId: taskId
      });
      
      // If the task belongs to a project and the status changed, recalculate project progress
      if (task.projectId && 'status' in req.body) {
        const projectTasks = await storage.getTasksByProject(task.projectId);
        const totalTasks = projectTasks.length;
        
        if (totalTasks > 0) {
          const completedTasks = projectTasks.filter(t => t.status === 'completed').length;
          const progress = Math.round((completedTasks / totalTasks) * 100);
          
          await storage.updateProject(task.projectId, { progress });
        }
      }
      
      res.json(updatedTask);
    } catch (error) {
      res.status(400).json({ message: "Invalid request", error });
    }
  });

  app.delete("/api/tasks/:id", authenticateJWT, async (req, res) => {
    try {
      const taskId = parseInt(req.params.id);
      const userId = (req as any).user.id;
      
      const task = await storage.getTask(taskId);
      
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      let authorized = false;
      
      // The user is authorized to delete the task if any of these conditions are met:
      // 1. They created the task (they are the task owner)
      if (task.userId === userId) {
        authorized = true;
      }
      // 2. They are the project owner
      else if (task.projectId) {
        const project = await storage.getProject(task.projectId);
        if (project && project.userId === userId) {
          authorized = true;
        }
        // 3. They are a project member
        else if (await storage.isProjectMember(task.projectId, userId)) {
          authorized = true;
        }
      }
      
      if (!authorized) {
        return res.status(403).json({ message: "Not authorized" });
      }
      
      await storage.deleteTask(taskId);
      
      // Create activity
      await storage.createActivity({
        userId,
        action: "deleted",
        target: "task",
        targetId: taskId
      });
      
      // If the task belongs to a project, recalculate project progress
      if (task.projectId) {
        const projectTasks = await storage.getTasksByProject(task.projectId);
        const totalTasks = projectTasks.length;
        
        if (totalTasks > 0) {
          const completedTasks = projectTasks.filter(t => t.status === 'completed').length;
          const progress = Math.round((completedTasks / totalTasks) * 100);
          
          await storage.updateProject(task.projectId, { progress });
        }
      }
      
      res.json({ message: "Task deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  });

  // Project routes
  app.get("/api/projects", authenticateJWT, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const projects = await storage.getProjects(userId);
      res.json(projects);
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  });
  
  app.get("/api/projects/:id", authenticateJWT, async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const userId = (req as any).user.id;
      
      const project = await storage.getProject(projectId, userId);
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      res.json(project);
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  });

  app.post("/api/projects", authenticateJWT, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const project = {
        ...req.body,
        userId,
        status: req.body.progress === 100 ? 'completed' : 'in_progress'
      };
      
      const newProject = await storage.createProject(project);
      
      // Create activity
      await storage.createActivity({
        userId,
        action: "created",
        target: "project",
        targetId: newProject.id
      });
      
      res.status(201).json(newProject);
    } catch (error) {
      res.status(400).json({ message: "Invalid request", error });
    }
  });

  app.put("/api/projects/:id", authenticateJWT, async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const userId = (req as any).user.id;
      
      const project = await storage.getProject(projectId);
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      if (project.userId !== userId) {
        return res.status(403).json({ message: "Not authorized" });
      }
      
      const updatedProject = await storage.updateProject(projectId, req.body);
      
      // Create activity
      await storage.createActivity({
        userId,
        action: "updated",
        target: "project",
        targetId: projectId
      });
      
      res.json(updatedProject);
    } catch (error) {
      res.status(400).json({ message: "Invalid request", error });
    }
  });
  
  // PATCH endpoint for updating specific project fields (like progress)
  app.patch("/api/projects/:id", authenticateJWT, async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const userId = (req as any).user.id;
      
      const project = await storage.getProject(projectId);
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      // Check if user is the owner or a member of the project
      const isOwner = project.userId === userId;
      const isMember = await storage.isProjectMember(projectId, userId);
      
      if (!isOwner && !isMember) {
        return res.status(403).json({ message: "Not authorized" });
      }
      
      // Only allow progress updates via PATCH
      if ('progress' in req.body) {
        const updatedProject = await storage.updateProject(projectId, { 
          progress: req.body.progress 
        });
        
        // Create activity for project progress update
        await storage.createActivity({
          userId,
          action: "updated progress on",
          target: "project",
          targetId: projectId
        });
        
        return res.status(200).json({ success: true, progress: req.body.progress });
      }
      
      res.status(400).json({ message: "Invalid update fields" });
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  });
  
  app.delete("/api/projects/:id", authenticateJWT, async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const userId = (req as any).user.id;
      
      const project = await storage.getProject(projectId);
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      // Only the project owner can delete the project
      if (project.userId !== userId) {
        return res.status(403).json({ message: "Only the project owner can delete a project" });
      }
      
      // Delete the project
      await storage.deleteProject(projectId);
      
      // Create activity
      await storage.createActivity({
        userId,
        action: "deleted",
        target: "project",
        targetId: projectId
      });
      
      res.json({ 
        message: "Project deleted successfully",
        projectId
      });
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  });

  // Project Members routes
  app.get("/api/projects/:id/members", authenticateJWT, async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const userId = (req as any).user.id;
      
      const project = await storage.getProject(projectId, userId);
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      const memberIds = await storage.getProjectMembers(projectId);
      const members = await Promise.all(memberIds.map(id => storage.getUser(id)));
      
      res.json(members.filter(member => member !== undefined).map(member => {
        return {
          id: member!.id,
          name: member!.name,
          username: member!.username,
          email: member!.email
        };
      }));
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  });

  app.post("/api/projects/:id/members", authenticateJWT, async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const userId = (req as any).user.id;
      const { inviteeEmail } = req.body;
      
      if (!inviteeEmail) {
        return res.status(400).json({ message: "Invitee email is required" });
      }
      
      const project = await storage.getProject(projectId);
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      // Only the project owner can invite members
      if (project.userId !== userId) {
        return res.status(403).json({ message: "Not authorized" });
      }
      
      // Find user by email
      const invitee = await storage.getUserByEmail(inviteeEmail);
      
      if (!invitee) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Add member to project
      await storage.addProjectMember(projectId, invitee.id);
      
      // Create activity for inviter
      await storage.createActivity({
        userId,
        action: "invited",
        target: "user",
        targetId: invitee.id
      });
      
      // Create activity for invitee so they are notified about the project
      await storage.createActivity({
        userId: invitee.id,
        action: "added to",
        target: "project",
        targetId: projectId
      });
      
      res.status(201).json({ message: "Member added successfully" });
    } catch (error) {
      res.status(400).json({ message: "Invalid request", error });
    }
  });

  app.delete("/api/projects/:id/members/:memberId", authenticateJWT, async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const memberId = parseInt(req.params.memberId);
      const userId = (req as any).user.id;
      
      const project = await storage.getProject(projectId);
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      // Only the project owner can remove members
      if (project.userId !== userId) {
        return res.status(403).json({ message: "Not authorized" });
      }
      
      // Remove member from project
      await storage.removeProjectMember(projectId, memberId);
      
      // Create activity
      await storage.createActivity({
        userId,
        action: "removed",
        target: "user",
        targetId: memberId
      });
      
      res.json({ message: "Member removed successfully" });
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  });

  // Project Tasks routes
  app.get("/api/projects/:id/tasks", authenticateJWT, async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const userId = (req as any).user.id;
      
      const project = await storage.getProject(projectId, userId);
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      const tasks = await storage.getTasksByProject(projectId, userId);
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  });

  app.post("/api/projects/:id/tasks", authenticateJWT, async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const userId = (req as any).user.id;
      
      console.log(`Task creation attempt - Project ID: ${projectId}, User ID: ${userId}`);
      
      // Get project with user ID for filtering
      const project = await storage.getProject(projectId, userId);
      
      if (!project) {
        console.log(`Project not found or user doesn't have access - Project ID: ${projectId}, User ID: ${userId}`);
        return res.status(404).json({ message: "Project not found or you don't have access" });
      }
      
      console.log(`Project found - Title: ${project.title}, Owner ID: ${project.userId}`);
      
      // User can create tasks if they are the project owner or a project member
      console.log(`Permission granted - User ${userId} is a project member`);
      
      const task = {
        ...req.body,
        userId,
        projectId
      };
      
      const newTask = await storage.createTask(task);
      
      // Create activity
      await storage.createActivity({
        userId,
        action: "created",
        target: "task",
        targetId: newTask.id
      });
      
      // Update project progress when a new task is added
      const projectTasks = await storage.getTasksByProject(projectId);
      const totalTasks = projectTasks.length;
      
      if (totalTasks > 0) {
        const completedTasks = projectTasks.filter(t => t.status === 'completed').length;
        const progress = Math.round((completedTasks / totalTasks) * 100);
        
        await storage.updateProject(projectId, { 
            progress,
            status: progress === 100 ? 'completed' : 'in_progress'
          });
      }
      
      res.status(201).json(newTask);
    } catch (error) {
      res.status(400).json({ message: "Invalid request", error });
    }
  });

  // Undo deletion routes
  app.post("/api/tasks/:id/restore", authenticateJWT, async (req, res) => {
    try {
      const taskId = parseInt(req.params.id);
      const userId = (req as any).user.id;
      
      // Try to restore the task
      const restoredTask = await storage.undoDeleteTask(taskId);
      
      if (!restoredTask) {
        return res.status(404).json({ message: "Task not found in deleted items" });
      }
      
      // Check if the user is authorized to restore this task
      let authorized = false;
      
      // The user is authorized if they created the task or are the project owner
      if (restoredTask.userId === userId) {
        authorized = true;
      } else if (restoredTask.projectId) {
        const project = await storage.getProject(restoredTask.projectId);
        if (project && project.userId === userId) {
          authorized = true;
        }
      }
      
      if (!authorized) {
        // Put back in the deleted tasks since they're not authorized
        await storage.deleteTask(taskId);
        return res.status(403).json({ message: "Not authorized to restore this task" });
      }
      
      // Create activity
      await storage.createActivity({
        userId,
        action: "restored",
        target: "task",
        targetId: taskId
      });
      
      // If the task belongs to a project, recalculate project progress
      if (restoredTask.projectId) {
        const projectTasks = await storage.getTasksByProject(restoredTask.projectId);
        const totalTasks = projectTasks.length;
        
        if (totalTasks > 0) {
          const completedTasks = projectTasks.filter(t => t.status === 'completed').length;
          const progress = Math.round((completedTasks / totalTasks) * 100);
          
          await storage.updateProject(restoredTask.projectId, { progress });
        }
      }
      
      res.json({ 
        message: "Task restored successfully",
        task: restoredTask
      });
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  });
  
  app.post("/api/projects/:id/restore", authenticateJWT, async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const userId = (req as any).user.id;
      
      // Try to restore the project
      const restoredProject = await storage.undoDeleteProject(projectId);
      
      if (!restoredProject) {
        return res.status(404).json({ message: "Project not found in deleted items" });
      }
      
      // Only the project owner can restore a project
      if (restoredProject.userId !== userId) {
        // Put back in deleted projects since they're not authorized
        await storage.deleteProject(projectId);
        return res.status(403).json({ message: "Only the project owner can restore a project" });
      }
      
      // Create activity
      await storage.createActivity({
        userId,
        action: "restored",
        target: "project",
        targetId: projectId
      });
      
      res.json({ 
        message: "Project restored successfully",
        project: restoredProject
      });
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  });

  // Activity routes
  app.get("/api/activities", authenticateJWT, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      
      const activities = await storage.getActivities(userId, limit);
      res.json(activities);
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  });



  const httpServer = createServer(app);
  return httpServer;
}
