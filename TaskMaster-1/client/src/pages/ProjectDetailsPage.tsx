import { useEffect, useState } from "react";
import { useLocation, Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Header from "../components/Dashboard/Header";
import Sidebar from "../components/Dashboard/Sidebar";
import TaskBoard from "../components/TaskBoard";
import InviteUserModal from "../components/InviteUserModal";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "../hooks/useAuth";
import { 
  Users, 
  ArrowLeft, 
  Calendar, 
  Clock, 
  UserPlus,
  Trash2,
  AlertCircle,
  Undo2,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { apiRequest } from "@/lib/queryClient";

// Define types for better TypeScript support
interface User {
  id: number;
  name: string;
  email: string;
  username: string;
}

interface Project {
  id: number;
  title: string;
  description: string | null;
  status: string;
  progress: number;
  dueDate: string | null;
  userId: number;
}

interface Task {
  id: number;
  title: string;
  status: string;
  priority: string;
  dueDate?: string;
  userId: number;
  assigneeId?: number;
  projectId?: number;
}

const ProjectDetailsPage = (props: { params: { id: string } }) => {
  const projectId = parseInt(props.params.id);
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showUndoNotification, setShowUndoNotification] = useState(false);
  const [deletedProjectId, setDeletedProjectId] = useState<number | null>(null);
  const queryClient = useQueryClient();
  
  // Delete project mutation
  const deleteProjectMutation = useMutation({
    mutationFn: async () => {
      return apiRequest(`/api/projects/${projectId}`, 'DELETE');
    },
    onSuccess: () => {
      // Show undo notification and store the deleted project ID
      setDeletedProjectId(projectId);
      setShowUndoNotification(true);
      
      // Navigate back to the dashboard
      setLocation('/dashboard');
      
      // Show success toast
      toast({
        title: 'Project deleted',
        description: 'Project has been successfully deleted.',
      });
      
      // Invalidate the projects query to update the dashboard
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      
      // Set a timer to hide the undo notification after 10 seconds
      setTimeout(() => {
        setShowUndoNotification(false);
        setDeletedProjectId(null);
      }, 10000); // 10 seconds
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to delete project. Please try again.',
        variant: 'destructive'
      });
      console.error('Delete project error:', error);
    }
  });
  
  // Restore project mutation
  const restoreProjectMutation = useMutation({
    mutationFn: async (projectId: number) => {
      return apiRequest(`/api/projects/${projectId}/restore`, 'POST');
    },
    onSuccess: (data) => {
      // Hide the undo notification
      setShowUndoNotification(false);
      setDeletedProjectId(null);
      
      // Show success toast
      toast({
        title: 'Project restored',
        description: 'Project has been successfully restored.',
      });
      
      // Invalidate the projects query to update the dashboard
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      
      // Navigate back to the project details page
      if (data.project && data.project.id) {
        setLocation(`/projects/${data.project.id}`);
      }
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to restore project. Please try again.',
        variant: 'destructive'
      });
      console.error('Restore project error:', error);
    }
  });
  
  // Function to handle project deletion
  const handleDeleteProject = () => {
    setShowDeleteDialog(false);
    deleteProjectMutation.mutate();
  };
  
  // Function to handle project restoration
  const handleUndoDelete = () => {
    if (deletedProjectId) {
      restoreProjectMutation.mutate(deletedProjectId);
    }
  };

  // If not authenticated, redirect to login
  useEffect(() => {
    if (!isAuthenticated()) {
      toast({
        title: "Authentication required",
        description: "Please log in to access project details",
        variant: "destructive"
      });
      setLocation("/login");
    }
  }, [isAuthenticated, setLocation, toast]);

  // Get current user info
  const { user } = useAuth();

  // Fetch project details with real-time updates
  const { data: project, isLoading: projectLoading } = useQuery<Project>({
    queryKey: [`/api/projects/${projectId}`],
    enabled: isAuthenticated() && !isNaN(projectId),
    refetchInterval: 3000, // Refetch every 3 seconds to ensure progress updates are current
    refetchOnWindowFocus: true,
    staleTime: 1000 // Consider data stale after 1 second
  });

  // Fetch project tasks with real-time updates
  const { data: tasks = [], isLoading: tasksLoading } = useQuery<Task[]>({
    queryKey: [`/api/projects/${projectId}/tasks`],
    enabled: isAuthenticated() && !isNaN(projectId),
    refetchInterval: 3000, // Refetch every 3 seconds
    refetchOnWindowFocus: true,
    staleTime: 1000
  });

  // Fetch project members with aggressive refetching
  const { data: members = [], isLoading: membersLoading } = useQuery<User[]>({
    queryKey: [`/api/projects/${projectId}/members`],
    enabled: isAuthenticated() && !isNaN(projectId),
    refetchInterval: 3000, // Refetch every 3 seconds to ensure members list is current
    refetchOnWindowFocus: true,
    staleTime: 1000 // Consider data stale after 1 second
  });
  
  // Fetch project owner info (if it's not the current user)
  const { data: projectOwner } = useQuery<User>({
    queryKey: [`/api/users/${project?.userId}`],
    enabled: isAuthenticated() && !projectLoading && project?.userId !== user?.id
  });

  if (!isAuthenticated() || projectLoading) {
    return null;
  }

  // Add a type assertion to help TypeScript understand our types
  const typedProject = project as Project | undefined;
  const typedMembers = members as User[] | undefined;
  const typedTasks = tasks as Task[] | undefined;
  const typedProjectOwner = projectOwner as User | undefined;

  if (!typedProject) {
    return (
      <div className="flex h-screen bg-background text-foreground">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto p-6 bg-background">
            <div className="flex items-center mb-6">
              <Link href="/dashboard" className="flex items-center text-primary hover:underline">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Dashboard
              </Link>
            </div>
            <div className="bg-card p-8 rounded-lg shadow text-center">
              <h2 className="text-2xl font-semibold mb-4">Project Not Found</h2>
              <p className="text-muted-foreground mb-6">
                The project you're looking for doesn't exist or you don't have access to it.
              </p>
              <Button onClick={() => setLocation("/dashboard")}>
                Return to Dashboard
              </Button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6 bg-background">
          {/* Back button and project title */}
          <div className="flex justify-between items-center mb-6">
            <div className="space-y-1">
              <Link href="/dashboard" className="flex items-center text-primary hover:underline">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Dashboard
              </Link>
              <h1 className="text-2xl font-bold">{typedProject.title}</h1>
            </div>
            <div className="flex items-center gap-2">
              {/* Only show delete button to project owner */}
              {user?.id === typedProject.userId && (
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={() => setShowDeleteDialog(true)}
                  className="flex items-center gap-1"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete Project
                </Button>
              )}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowInviteModal(true)}
                className="flex items-center gap-1"
              >
                <UserPlus className="h-4 w-4" />
                Invite Member
              </Button>
            </div>
          </div>

          {/* Project details */}
          <div className="bg-card rounded-lg shadow p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="col-span-2">
                <h2 className="font-semibold mb-2">Description</h2>
                <p className="text-muted-foreground">
                  {typedProject.description || "No description provided."}
                </p>
              </div>
              <div className="space-y-4">
                <div>
                  <h2 className="font-semibold mb-2">Progress</h2>
                  <Progress value={typedProject.progress} className="h-2 mb-1 transition-all duration-300 ease-in-out" />
                  <span className="text-sm text-muted-foreground transition-all duration-300">{typedProject.progress}% complete</span>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center text-sm">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>Due: {typedProject.dueDate || "Not specified"}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>Status: {typedProject.status.replace('_', ' ')}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>Members: {membersLoading ? "Loading..." : typedMembers?.length ? typedMembers.length + 1 : 1}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Project members */}
          <div className="bg-card rounded-lg shadow p-6 mb-8">
            <h2 className="font-semibold mb-4">Project Members</h2>
            <div className="flex flex-wrap gap-2">
              {membersLoading ? (
                <div className="text-muted-foreground">Loading members...</div>
              ) : (
                <>
                  {/* Show project leader/owner */}
                  {user?.id === typedProject.userId ? (
                    <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
                      You (Leader)
                    </div>
                  ) : (
                    <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
                      {typedProjectOwner?.name || "Project Leader"} (Leader)
                    </div>
                  )}
                  
                  {/* Show project members */}
                  {typedMembers && typedMembers.length > 0 ? (
                    typedMembers.map((member: User) => (
                      <div 
                        key={member.id} 
                        className={`${
                          member.id === user?.id 
                            ? "bg-blue-500/10 text-blue-500" 
                            : "bg-muted text-muted-foreground"
                        } px-3 py-1 rounded-full text-sm`}
                      >
                        {member.id === user?.id ? "You" : member.name}
                      </div>
                    ))
                  ) : typedMembers && typedMembers.length === 0 ? (
                    <div className="text-muted-foreground ml-2">
                      No other members yet.
                    </div>
                  ) : null}
                </>
              )}
            </div>
          </div>

          {/* Project tasks */}
          <div className="bg-card rounded-lg shadow p-6">
            <TaskBoard tasks={typedTasks || []} projectId={projectId} />
          </div>
        </main>
      </div>

      {/* Invite Modal */}
      <InviteUserModal 
        open={showInviteModal} 
        onOpenChange={setShowInviteModal} 
        projectId={projectId} 
      />

      {/* Delete Project Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this project?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will delete the project and all its tasks. You can undo this action within 10 seconds after deletion.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteProject} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Undo Delete Notification */}
      {showUndoNotification && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-card border border-border shadow-lg rounded-md px-4 py-3 flex items-center gap-3 z-50 animate-in fade-in slide-in-from-bottom-5">
          <AlertCircle className="h-5 w-5 text-yellow-500" />
          <span>Project deleted. </span>
          <Button variant="link" className="p-0 h-auto text-primary" onClick={handleUndoDelete}>
            <Undo2 className="h-4 w-4 mr-1" />
            Undo
          </Button>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0 ml-2" onClick={() => setShowUndoNotification(false)}>
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </div>
      )}
    </div>
  );
};

export default ProjectDetailsPage;