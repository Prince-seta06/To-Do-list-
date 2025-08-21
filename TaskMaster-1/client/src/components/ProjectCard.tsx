import { User, ChevronRight, Trash2 } from "lucide-react";
import { useLocation } from "wouter";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useAuth } from "@/hooks/useAuth";

interface ProjectCardProps {
  project: {
    id: number;
    title: string;
    description: string;
    status: string;
    progress: number;
    dueDate: string;
    userId: number; // Project owner ID
  };
  onDelete?: (projectId: number) => void; // Callback for project deletion
}

const ProjectCard = ({ project, onDelete }: ProjectCardProps) => {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  // Determine status badge
  const getStatusBadge = () => {
    switch (project.status) {
      case 'on_track':
        return <span className="text-xs px-2 py-1 rounded bg-green-500/20 text-green-500">On Track</span>;
      case 'at_risk':
        return <span className="text-xs px-2 py-1 rounded bg-yellow-500/20 text-yellow-500">At Risk</span>;
      case 'delayed':
        return <span className="text-xs px-2 py-1 rounded bg-destructive/20 text-destructive">Delayed</span>;
      case 'completed':
        return <span className="text-xs px-2 py-1 rounded bg-green-500/20 text-green-500">Completed</span>;
      default:
        return <span className="text-xs px-2 py-1 rounded bg-blue-500/20 text-blue-500">In Progress</span>;
    }
  };
  
  // Delete project mutation
  const deleteProjectMutation = useMutation({
    mutationFn: () => apiRequest('DELETE', `/api/projects/${project.id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      if (onDelete) {
        onDelete(project.id);
      }
    }
  });
  
  // Navigate to project details using wouter's routing
  const handleNavigate = () => {
    setLocation(`/project/${project.id}`);
  };

  // Handle delete button click
  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteDialog(true);
  };

  // Confirm project deletion
  const confirmDelete = () => {
    deleteProjectMutation.mutate();
    setShowDeleteDialog(false);
  };

  const isOwner = user && user.id === project.userId;

  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <h4 className="font-medium text-lg">{project.title}</h4>
          {getStatusBadge()}
        </div>
        <p className="text-muted-foreground text-sm">{project.description}</p>
      </CardHeader>
      
      <CardContent className="pb-2">
        <div className="flex items-center mb-3">
          <div className="text-xs text-muted-foreground mr-2">Progress</div>
          <div className="flex-1 bg-muted h-2 rounded-full overflow-hidden">
            <div 
              className="bg-primary h-full rounded-full transition-all duration-300 ease-in-out" 
              style={{ width: `${project.progress}%` }}
            ></div>
          </div>
          <div className="text-xs ml-2 transition-all duration-300">{project.progress}%</div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex -space-x-2">
            <div className="w-6 h-6 rounded-full bg-muted border-2 border-card flex items-center justify-center text-xs">
              <User className="h-3 w-3" />
            </div>
            <div className="w-6 h-6 rounded-full bg-muted border-2 border-card flex items-center justify-center text-xs">
              <User className="h-3 w-3" />
            </div>
          </div>
          <div className="text-xs text-muted-foreground">Due {project.dueDate || 'N/A'}</div>
        </div>
      </CardContent>
      
      <CardFooter className="pt-2 flex justify-between">
        <Button variant="outline" onClick={handleNavigate}>
          View Details <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
        
        {isOwner && (
          <Button
            variant="destructive"
            size="sm"
            className="delete-button"
            onClick={handleDeleteClick}
          >
            <Trash2 className="h-4 w-4 mr-1" /> Delete
          </Button>
        )}
      </CardFooter>

      {/* Delete confirmation dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{project.title}</strong>? This action cannot be undone immediately.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

export default ProjectCard;
