import { 
  users, type User, type InsertUser,
  tasks, type Task, type InsertTask,
  projects, type Project, type InsertProject,
  activities, type Activity, type InsertActivity
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Tasks
  getTasks(userId: number): Promise<Task[]>;
  getTasksByProject(projectId: number): Promise<Task[]>;
  getTask(id: number): Promise<Task | undefined>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: number, task: Partial<InsertTask>): Promise<Task | undefined>;
  deleteTask(id: number): Promise<boolean>;
  undoDeleteTask(id: number): Promise<Task | undefined>;
  
  // Projects
  getProjects(userId: number): Promise<Project[]>;
  getProject(id: number): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: number, project: Partial<InsertProject>): Promise<Project | undefined>;
  deleteProject(id: number): Promise<boolean>;
  undoDeleteProject(id: number): Promise<Project | undefined>;
  
  // Project Members
  getProjectMembers(projectId: number): Promise<number[]>;
  addProjectMember(projectId: number, userId: number): Promise<boolean>;
  removeProjectMember(projectId: number, userId: number): Promise<boolean>;
  isProjectMember(projectId: number, userId: number): Promise<boolean>;
  
  // Activities
  getActivities(userId: number, limit?: number): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private tasks: Map<number, Task>;
  private projects: Map<number, Project>;
  private activities: Map<number, Activity>;
  private projectMembers: Map<string, boolean>; // key: `${projectId}-${userId}`
  
  // Storage for deleted items (for undo functionality)
  private deletedTasks: Map<number, Task>;
  private deletedProjects: Map<number, Project>;
  
  private userIdCounter: number;
  private taskIdCounter: number;
  private projectIdCounter: number;
  private activityIdCounter: number;

  constructor() {
    this.users = new Map();
    this.tasks = new Map();
    this.projects = new Map();
    this.activities = new Map();
    this.projectMembers = new Map();
    this.deletedTasks = new Map();
    this.deletedProjects = new Map();
    
    this.userIdCounter = 1;
    this.taskIdCounter = 1;
    this.projectIdCounter = 1;
    this.activityIdCounter = 1;
    
    // Add some demo data
    this.createUser({
      username: "johndoe",
      email: "john@example.com",
      password: "password123",
      name: "John Doe"
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email
    );
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const now = new Date();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Task methods
  async getTasks(userId: number): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(
      (task) => task.userId === userId || task.assigneeId === userId
    );
  }

  async getTask(id: number, userId?: number): Promise<Task | undefined> {
    const task = this.tasks.get(id);
    if (!task) return undefined;
    
    // If userId is provided, only return the task if it belongs to this user
    if (userId !== undefined && task.userId !== userId) {
      return undefined;
    }
    
    return task;
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    const id = this.taskIdCounter++;
    const now = new Date();
    
    // Make sure all required fields have values
    const task: Task = { 
      id,
      title: insertTask.title,
      status: insertTask.status || "todo",
      priority: insertTask.priority || "medium",
      description: insertTask.description || null,
      dueDate: insertTask.dueDate || null,
      assigneeId: insertTask.assigneeId || null,
      userId: insertTask.userId,
      projectId: insertTask.projectId || null,
      createdAt: now,
      updatedAt: now
    };
    this.tasks.set(id, task);
    return task;
  }

  async updateTask(id: number, taskUpdate: Partial<InsertTask>): Promise<Task | undefined> {
    const task = this.tasks.get(id);
    if (!task) return undefined;
    
    const now = new Date();
    
    // Make sure required fields aren't overwritten with undefined
    const updatedTask: Task = {
      ...task,
      ...taskUpdate,
      title: taskUpdate.title || task.title,
      status: taskUpdate.status || task.status,
      priority: taskUpdate.priority || task.priority,
      userId: task.userId,
      updatedAt: now
    };
    this.tasks.set(id, updatedTask);
    return updatedTask;
  }

  async deleteTask(id: number): Promise<boolean> {
    const task = this.tasks.get(id);
    if (!task) return false;
    
    // Store the task in the deleted tasks map for undo functionality
    this.deletedTasks.set(id, task);
    
    // Remove from active tasks
    return this.tasks.delete(id);
  }
  
  async undoDeleteTask(id: number): Promise<Task | undefined> {
    const task = this.deletedTasks.get(id);
    if (!task) return undefined;
    
    // Restore task
    this.tasks.set(id, task);
    
    // Remove from deleted tasks
    this.deletedTasks.delete(id);
    
    return task;
  }

  // Project methods
  async getProjects(userId: number): Promise<Project[]> {
    const projects = Array.from(this.projects.values());
    const result: Project[] = [];
    
    for (const project of projects) {
      // Include projects owned by user
      if (project.userId === userId) {
        result.push(project);
        continue;
      }
      
      // Also include projects where user is a member
      const isMember = await this.isProjectMember(project.id, userId);
      if (isMember) {
        result.push(project);
      }
    }
    
    return result;
  }

  async getProject(id: number, userId?: number): Promise<Project | undefined> {
    const project = this.projects.get(id);
    if (!project) return undefined;
    
    // If userId is provided, only return the project if it belongs to this user
    // or if the user is a project member
    if (userId !== undefined) {
      if (project.userId !== userId) {
        // Check if user is a project member
        const isMember = await this.isProjectMember(id, userId);
        if (!isMember) {
          return undefined;
        }
      }
    }
    
    return project;
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const id = this.projectIdCounter++;
    // Make sure all required fields have values
    const project: Project = { 
      id,
      title: insertProject.title,
      description: insertProject.description || null,
      status: insertProject.status || "in_progress",
      progress: insertProject.progress !== undefined ? insertProject.progress : 0,
      dueDate: insertProject.dueDate || null,
      userId: insertProject.userId
    };
    this.projects.set(id, project);
    return project;
  }

  async updateProject(id: number, projectUpdate: Partial<InsertProject>): Promise<Project | undefined> {
    const project = this.projects.get(id);
    if (!project) return undefined;
    
    // Make sure required fields aren't overwritten with undefined
    const updatedProject: Project = {
      ...project,
      ...projectUpdate,
      title: projectUpdate.title || project.title,
      status: projectUpdate.status || project.status,
      progress: projectUpdate.progress !== undefined ? projectUpdate.progress : project.progress,
      userId: project.userId
    };
    this.projects.set(id, updatedProject);
    return updatedProject;
  }
  
  async deleteProject(id: number): Promise<boolean> {
    const project = this.projects.get(id);
    if (!project) return false;
    
    // Store the project in the deleted projects map for undo functionality
    this.deletedProjects.set(id, project);
    
    // Remove from active projects
    return this.projects.delete(id);
  }
  
  async undoDeleteProject(id: number): Promise<Project | undefined> {
    const project = this.deletedProjects.get(id);
    if (!project) return undefined;
    
    // Restore project
    this.projects.set(id, project);
    
    // Remove from deleted projects
    this.deletedProjects.delete(id);
    
    return project;
  }

  // Project Member methods
  async getProjectMembers(projectId: number): Promise<number[]> {
    const memberIds: number[] = [];
    const entries = Array.from(this.projectMembers.entries());
    
    for (const [key, value] of entries) {
      if (value && key.startsWith(`${projectId}-`)) {
        const userId = parseInt(key.split('-')[1]);
        memberIds.push(userId);
      }
    }
    
    return memberIds;
  }

  async addProjectMember(projectId: number, userId: number): Promise<boolean> {
    const key = `${projectId}-${userId}`;
    this.projectMembers.set(key, true);
    return true;
  }

  async removeProjectMember(projectId: number, userId: number): Promise<boolean> {
    const key = `${projectId}-${userId}`;
    return this.projectMembers.delete(key);
  }

  async isProjectMember(projectId: number, userId: number): Promise<boolean> {
    const key = `${projectId}-${userId}`;
    return this.projectMembers.has(key);
  }

  async getTasksByProject(projectId: number, userId?: number): Promise<Task[]> {
    // First check if the user has access to this project
    if (userId !== undefined) {
      const project = await this.getProject(projectId, userId);
      if (!project) {
        return []; // User doesn't have access to this project
      }
      
      // Get all tasks for this project
      const allProjectTasks = Array.from(this.tasks.values()).filter(
        (task) => task.projectId === projectId
      );
      
      // All project members should see all tasks in the project
      // This ensures complete visibility of all tasks within a project
      return allProjectTasks;
    }
    
    // If userId is not provided, return all tasks for the project (admin access)
    return Array.from(this.tasks.values()).filter(
      (task) => task.projectId === projectId
    );
  }

  // Activity methods
  async getActivities(userId: number, limit = 10): Promise<Activity[]> {
    return Array.from(this.activities.values())
      .filter(activity => activity.userId === userId)
      .sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      })
      .slice(0, limit);
  }

  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    const id = this.activityIdCounter++;
    const now = new Date();
    
    // Make sure all required fields have values
    const activity: Activity = { 
      id, 
      userId: insertActivity.userId,
      action: insertActivity.action,
      target: insertActivity.target,
      targetId: insertActivity.targetId || null,
      createdAt: now
    };
    
    this.activities.set(id, activity);
    return activity;
  }


}

export const storage = new MemStorage();
