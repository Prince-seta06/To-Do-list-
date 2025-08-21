import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import { format } from 'date-fns';

interface NewProjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const NewProjectModal = ({ open, onOpenChange }: NewProjectModalProps) => {
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  
  // Set default due date to 1 month from now
  const defaultDueDate = new Date();
  defaultDueDate.setMonth(defaultDueDate.getMonth() + 1);
  const formattedDefaultDate = format(defaultDueDate, 'yyyy-MM-dd');
  
  const [dueDate, setDueDate] = useState(formattedDefaultDate);

  const createProjectMutation = useMutation({
    mutationFn: async (projectData: any) => {
      return apiRequest('POST', '/api/projects', projectData);
    },
    onSuccess: (newProject) => {
      // Reset form and close modal
      setTitle('');
      setDescription('');
      setDueDate(formattedDefaultDate);
      onOpenChange(false);
      
      // Force refresh the projects query with retry for reliability
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
        queryClient.refetchQueries({ queryKey: ['/api/projects'], exact: true });
        
        // Do an additional refetch after a small delay to ensure UI update
        setTimeout(() => {
          queryClient.refetchQueries({ queryKey: ['/api/projects'], exact: true });
        }, 300);
      }, 100);
      
      // Show a toast notification with instructions to view project
      toast({
        title: 'Project created',
        description: 'Your new project has been created successfully',
      });
    },
    onError: (error: any) => {
      console.error('Project creation error:', error);
      toast({
        title: 'Error',
        description: 'Failed to create the project. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast({
        title: 'Error',
        description: 'Project title is required',
        variant: 'destructive',
      });
      return;
    }
    
    // Create the project with filled values or defaults
    createProjectMutation.mutate({
      title: title.trim(),
      description: description.trim() || `Project ${title.trim()}`,
      dueDate: dueDate || formattedDefaultDate,
      status: 'in_progress',
      progress: 0
    });
  };

  // Reset form when modal opens
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      // Small delay to prevent visual jump
      setTimeout(() => {
        setTitle('');
        setDescription('');
        setDueDate(formattedDefaultDate);
      }, 300);
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="title">Project Title*</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter project title"
              required
              autoFocus
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter project description"
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="dueDate">Due Date</Label>
            <Input
              id="dueDate"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              min={format(new Date(), 'yyyy-MM-dd')}
            />
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createProjectMutation.isPending || !title.trim()}
            >
              Create Project
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NewProjectModal;