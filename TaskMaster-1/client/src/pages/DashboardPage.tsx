import { useEffect, useState, useRef } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import Sidebar from "../components/Dashboard/Sidebar";
import Header from "../components/Dashboard/Header";
import StatsCard from "../components/Dashboard/StatsCard";
import ProjectCard from "../components/ProjectCard";
import TaskBoard from "../components/TaskBoard";
import NewProjectModal from "../components/NewProjectModal";
import { useToast } from "@/hooks/use-toast";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "../hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  Briefcase, 
  CheckCircle, 
  Clock, 
  Users,
  PlusCircle,
  Undo2
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface Task {
  id: number;
  title: string;
  status: string;
  priority: string;
  dueDate?: string;
  assigneeId?: number;
  projectId?: number;
  userId: number; // Task creator/owner
}

interface Project {
  id: number;
  title: string;
  description: string;
  status: string;
  progress: number;
  dueDate: string;
  userId: number; // Project owner ID
}



const DashboardPage = () => {
  const { isAuthenticated, getUserInfo } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const user = getUserInfo();
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [deletedProject, setDeletedProject] = useState<Project | null>(null);
  
  // Timeout ref for auto-closing undo notification
  const undoTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // If not authenticated, redirect to login
  useEffect(() => {
    if (!isAuthenticated()) {
      toast({
        title: "Authentication required",
        description: "Please log in to access the dashboard",
        variant: "destructive"
      });
      setLocation("/login");
    }
  }, [isAuthenticated, setLocation, toast]);

  // Fetch tasks
  const { data: tasks = [], isLoading: tasksLoading, refetch: refetchTasks } = useQuery<Task[]>({
    queryKey: ['/api/tasks'],
    enabled: isAuthenticated(),
    refetchInterval: 5000, // Auto-refresh tasks every 5 seconds
    refetchOnWindowFocus: true // Refresh when browser tab becomes active
  });

  // Fetch projects
  const { data: projects = [], isLoading: projectsLoading, refetch: refetchProjects } = useQuery<Project[]>({
    queryKey: ['/api/projects'],
    enabled: isAuthenticated(),
    refetchInterval: 5000, // Auto-refresh projects every 5 seconds
    refetchOnWindowFocus: true // Refresh when browser tab becomes active
  });
  
  // Function to force refresh all data
  const refreshData = () => {
    refetchTasks();
    refetchProjects();
  };
  
  // Project restore mutation
  const restoreProjectMutation = useMutation({
    mutationFn: (projectId: number) => apiRequest<{ project: Project }>('POST', `/api/projects/${projectId}/restore`),
    onSuccess: (response) => {
      // Clear any existing undo timeout
      if (undoTimeoutRef.current) {
        clearTimeout(undoTimeoutRef.current);
        undoTimeoutRef.current = null;
      }
      
      // Reset deleted project state
      setDeletedProject(null);
      
      // Refetch projects to update the UI
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      
      toast({
        title: "Project Restored",
        description: `"${response.project.title}" has been restored.`,
      });
    }
  });
  
  // Function to handle project deletion
  const handleProjectDelete = (projectId: number) => {
    // Find the deleted project to store for potential restoration
    const project = projects.find(p => p.id === projectId);
    
    if (project) {
      // Store the deleted project for undo functionality
      setDeletedProject(project);
      
      // Show toast with undo option
      toast({
        title: "Project Deleted",
        description: (
          <div className="flex items-center justify-between">
            <span>{project.title} has been deleted</span>
            <Button 
              variant="outline" 
              size="sm" 
              className="ml-2 flex items-center gap-1"
              onClick={() => restoreProjectMutation.mutate(projectId)}
            >
              <Undo2 className="h-3 w-3" />
              Undo
            </Button>
          </div>
        ),
        duration: 5000, // 5 seconds
      });
      
      // Set a timeout to clear the deleted project state after 5 seconds
      undoTimeoutRef.current = setTimeout(() => {
        setDeletedProject(null);
      }, 5000);
    }
  };
  
  // Effect to clean up any timeouts when component unmounts
  useEffect(() => {
    return () => {
      // Clear any existing undo timeout when component unmounts
      if (undoTimeoutRef.current) {
        clearTimeout(undoTimeoutRef.current);
      }
    };
  }, []);

  // Filter tasks assigned to the current user
  const userTasks = tasks.filter((task: Task) => task.assigneeId === user?.id);
  
  // Group tasks by status (only show tasks assigned to the current user)
  const todoTasks = userTasks.filter((task: Task) => task.status === 'todo');
  const inProgressTasks = userTasks.filter((task: Task) => task.status === 'in_progress');
  const completedTasks = userTasks.filter((task: Task) => task.status === 'completed');

  if (!isAuthenticated()) {
    return null;
  }

  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-background">
          {/* Stats cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
            <StatsCard 
              title="My Tasks"
              value={userTasks.length}
              description={`${todoTasks.length} pending`}
              icon={<Briefcase className="h-5 w-5 text-primary" />}
              iconBg="bg-primary/20"
            />
            
            <StatsCard 
              title="In Progress"
              value={inProgressTasks.length}
              description={`${Math.round((inProgressTasks.length / (userTasks.length || 1)) * 100)}% of my tasks`}
              icon={<Clock className="h-5 w-5 text-blue-500" />}
              iconBg="bg-blue-500/20"
            />
            
            <StatsCard 
              title="Completed"
              value={completedTasks.length}
              description={`${Math.round((completedTasks.length / (userTasks.length || 1)) * 100)}% completion rate`}
              icon={<CheckCircle className="h-5 w-5 text-green-500" />}
              iconBg="bg-green-500/20"
            />
            
            <StatsCard 
              title="Projects"
              value={projects.length}
              description={`${projects.filter(p => p.progress === 100).length} completed, ${projects.filter(p => p.progress < 100).length} in progress`}
              icon={<Users className="h-5 w-5 text-purple-500" />}
              iconBg="bg-purple-500/20"
            />
          </div>
          
          {/* Personal Task board - only show tasks assigned to user */}
          <div className="mb-8">
            <TaskBoard tasks={userTasks} />
          </div>
          
          {/* Projects Overview */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-medium">Projects Overview</h3>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => setShowNewProjectModal(true)}
                className="flex items-center gap-1"
              >
                <PlusCircle className="h-4 w-4" />
                New Project
              </Button>
            </div>
            
            {projectsLoading ? (
              <div className="text-center text-muted-foreground p-8">Loading projects...</div>
            ) : projects.length > 0 ? (
              <div className="grid gap-4 grid-cols-1">
                {projects.map((project: Project) => (
                  <ProjectCard 
                    key={project.id} 
                    project={project} 
                    onDelete={handleProjectDelete}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground p-8 bg-card rounded-lg shadow">
                No projects yet. Create your first project by clicking the "New Project" button above.
              </div>
            )}
          </div>
        </main>
      </div>
      
      {/* New Project Modal */}
      <NewProjectModal 
        open={showNewProjectModal} 
        onOpenChange={setShowNewProjectModal} 
      />
    </div>
  );
};

export default DashboardPage;
