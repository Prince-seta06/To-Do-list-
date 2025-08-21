import { useState, useCallback, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';
import TaskColumn from './TaskColumn';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import { useIsMobile } from '@/hooks/use-mobile';
import { PlusCircle, User, Undo2, AlertCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useConfetti } from '../contexts/ConfettiContext';

interface Task {
  id: number;
  title: string;
  status: string;
  priority: string;
  dueDate?: string;
  assigneeId?: number;
  projectId?: number;
  userId: number; // Add user ID for task creator/owner
}

interface TaskBoardProps {
  tasks: Task[];
  projectId?: number;
}

interface User {
  id: number;
  name: string;
  email: string;
  username: string;
}

const TaskBoard = ({ tasks, projectId }: TaskBoardProps) => {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const { showConfetti } = useConfetti();
  const [taskItems, setTaskItems] = useState<Task[]>([]);
  const [showNewTaskForm, setShowNewTaskForm] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState('medium');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  const [newTaskAssignee, setNewTaskAssignee] = useState<number | undefined>(undefined);
  const [showUndoDeleteNotification, setShowUndoDeleteNotification] = useState(false);
  const [deletedTaskId, setDeletedTaskId] = useState<number | null>(null);
  
  // Fetch project members if this is a project task board
  const { data: projectMembers = [] } = useQuery<User[]>({
    queryKey: [`/api/projects/${projectId}/members`],
    enabled: !!projectId,
  });
  
  // Define project interface
  interface Project {
    id: number;
    title: string;
    description: string | null;
    status: string;
    progress: number;
    dueDate: string | null;
    userId: number;
  }
  
  // Get project information if this is a project task board
  const { data: project } = useQuery<Project>({
    queryKey: [`/api/projects/${projectId}`],
    enabled: !!projectId,
  });

  // Split tasks by status
  const todoTasks = taskItems.filter(task => task.status === 'todo');
  const inProgressTasks = taskItems.filter(task => task.status === 'in_progress');
  const completedTasks = taskItems.filter(task => task.status === 'completed');

  // Ensure the local state is synchronized with the props
  useEffect(() => {
    // Only update if the tasks array changes (by reference or length)
    if (tasks && (!taskItems || tasks.length !== taskItems.length)) {
      setTaskItems([...tasks]);
    }
  }, [tasks]);

  // Function to update project progress based on task completion
  const updateProjectProgress = async (tasks: Task[]) => {
    if (!projectId || !project) return;
    
    // Calculate percentage of completed tasks
    const totalTasks = tasks.length;
    if (totalTasks === 0) return;
    
    const completedTasks = tasks.filter(task => task.status === 'completed').length;
    const progress = Math.round((completedTasks / totalTasks) * 100);
    
    // Only update if progress has changed
    if (progress !== (project as Project).progress) {
      try {
        // Perform the PATCH request to update progress
        await apiRequest('PATCH', `/api/projects/${projectId}`, { progress });
        
        // Invalidate queries to update UI
        queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}`] });
        queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
        
        // Add delayed refetch to ensure progress updates are reflected in the UI
        setTimeout(() => {
          queryClient.refetchQueries({ queryKey: [`/api/projects/${projectId}`] });
          queryClient.refetchQueries({ queryKey: ['/api/projects'] });
        }, 400);
      } catch (error) {
        console.error('Failed to update project progress:', error);
        // Try one more time with a delay in case of network issues
        setTimeout(async () => {
          try {
            await apiRequest('PATCH', `/api/projects/${projectId}`, { progress });
            queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}`] });
            queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
          } catch (retryError) {
            console.error('Retry failed to update project progress:', retryError);
          }
        }, 1000);
      }
    }
  };

  const updateTaskMutation = useMutation({
    mutationFn: async ({ taskId, updates }: { taskId: number, updates: Partial<Task> }) => {
      return apiRequest<Task>('PUT', `/api/tasks/${taskId}`, updates);
    },
    onSuccess: (updatedTask: Task) => {
      // Update the task in the local state immediately for responsive UI
      const updatedTasks = taskItems.map(task => 
        task.id === updatedTask.id ? { ...task, ...updatedTask } : task
      );
      setTaskItems(updatedTasks);
      
      // Update project progress if the task status changed
      if (projectId && 'status' in updatedTask) {
        updateProjectProgress(updatedTasks);
      }
      
      // Invalidate queries with appropriate delay for reliability
      setTimeout(() => {
        // Always invalidate tasks query - important for assigned tasks
        queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
        
        if (projectId) {
          queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/tasks`] });
          // Refresh project data too since task status may affect project progress
          queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}`] });
        }
        
        // Do another refetch after a small delay to ensure consistency
        setTimeout(() => {
          // Always refetch tasks
          queryClient.refetchQueries({ queryKey: ['/api/tasks'], exact: true });
          
          if (projectId) {
            queryClient.refetchQueries({ queryKey: [`/api/projects/${projectId}/tasks`], exact: true });
          }
        }, 200);
      }, 100);
      
      toast({
        title: 'Task updated',
        description: 'The task has been successfully updated',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to update the task',
        variant: 'destructive',
      });
    },
  });

  const createTaskMutation = useMutation({
    mutationFn: async (newTask: Partial<Task>) => {
      if (projectId) {
        return apiRequest<Task>('POST', `/api/projects/${projectId}/tasks`, newTask);
      }
      return apiRequest<Task>('POST', '/api/tasks', newTask);
    },
    onSuccess: (newTask: Task) => {
      // Add the new task to the local state immediately for responsive UI
      const updatedTasks = [...taskItems, newTask];
      setTaskItems(updatedTasks);
      
      // Update project progress after adding a new task
      if (projectId) {
        updateProjectProgress(updatedTasks);
      }
      
      // Invalidate queries with appropriate delay for reliability
      setTimeout(() => {
        // Always invalidate the /api/tasks query since tasks may be assigned to other users
        queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
        
        if (projectId) {
          queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/tasks`] });
          // Also refresh the project data since new task may affect metrics
          queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}`] });
          // Also refresh all projects to update counts on dashboard
          queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
        }
        
        // Do another refetch after a small delay to ensure UI consistency
        setTimeout(() => {
          // Always refetch tasks
          queryClient.refetchQueries({ queryKey: ['/api/tasks'], exact: true });
          
          if (projectId) {
            queryClient.refetchQueries({ queryKey: [`/api/projects/${projectId}/tasks`], exact: true });
          }
        }, 200);
      }, 100);
      
      // Reset all form fields
      setNewTaskTitle('');
      setNewTaskPriority('medium');
      setNewTaskDueDate('');
      setNewTaskAssignee(undefined);
      setShowNewTaskForm(false);
      
      toast({
        title: 'Task created',
        description: 'The new task has been created successfully',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to create the task',
        variant: 'destructive',
      });
    },
  });

  const moveTask = useCallback((dragIndex: number, hoverIndex: number) => {
    setTaskItems(prevTasks => {
      const draggedTask = prevTasks[dragIndex];
      const newTasks = [...prevTasks];
      
      // Remove the task from its original position
      newTasks.splice(dragIndex, 1);
      
      // Insert the task at the new position
      newTasks.splice(hoverIndex, 0, draggedTask);
      
      return newTasks;
    });
  }, []);

  const handleStatusChange = useCallback((taskId: number, newStatus: string) => {
    // Trigger the task update
    updateTaskMutation.mutate({ 
      taskId, 
      updates: { status: newStatus } 
    }, {
      onSuccess: (task) => {
        // If the new status is "completed", trigger the confetti
        if (newStatus === 'completed') {
          // Add a small delay to make the UI transition smoother
          setTimeout(() => {
            showConfetti();
          }, 200);
        }
      }
    });
  }, [updateTaskMutation, showConfetti]);

  // Restore task mutation
  const restoreTaskMutation = useMutation({
    mutationFn: async (taskId: number) => {
      return apiRequest<{ task: Task }>('POST', `/api/tasks/${taskId}/restore`);
    },
    onSuccess: (data) => {
      // Hide the undo notification
      setShowUndoDeleteNotification(false);
      setDeletedTaskId(null);
      
      // Show success toast
      toast({
        title: 'Task restored',
        description: 'Task has been successfully restored.',
      });
      
      // Add the restored task back to the local state
      if (data.task) {
        // Update the local state with the restored task
        setTaskItems(prev => [...prev, data.task]);
      }
      
      // Invalidate queries to update UI
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      if (projectId) {
        queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/tasks`] });
        queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}`] });
      }
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to restore task. Please try again.',
        variant: 'destructive'
      });
      console.error('Restore task error:', error);
      
      // Hide notification even if restore failed
      setShowUndoDeleteNotification(false);
      setDeletedTaskId(null);
    }
  });
  
  // Function to handle task restoration
  const handleUndoDelete = () => {
    if (deletedTaskId) {
      restoreTaskMutation.mutate(deletedTaskId);
    }
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newTaskTitle.trim()) return;
    
    // When creating a personal task from dashboard, assign to self by default
    const taskData: Partial<Task> = {
      title: newTaskTitle,
      status: 'todo',
      priority: newTaskPriority,
      dueDate: newTaskDueDate || undefined
    };
    
    // Only include projectId if we're in a project context
    if (projectId) {
      taskData.projectId = projectId;
      // For project tasks, use the selected assignee
      taskData.assigneeId = newTaskAssignee;
    } else {
      // For personal tasks, assign to current user automatically
      taskData.assigneeId = user?.id;
    }
    
    createTaskMutation.mutate(taskData);
  };

  // Create a handler for task deletion
  const handleTaskDelete = (taskId: number) => {
    // Store the deleted task ID for potential restoration
    setDeletedTaskId(taskId);
    // Show the undo notification
    setShowUndoDeleteNotification(true);
    
    // Automatically hide the notification after 10 seconds if not acted upon
    setTimeout(() => {
      if (deletedTaskId === taskId) {
        setShowUndoDeleteNotification(false);
        setDeletedTaskId(null);
      }
    }, 10000);
  };

  // Now using our TaskColumn component instead of rendering directly
  const renderTaskColumn = (tasks: Task[], status: string) => (
    <TaskColumn
      status={status}
      tasks={tasks}
      moveTask={moveTask}
      onStatusChange={handleStatusChange}
      onDelete={handleTaskDelete}
    />
  );

  return (
    <DndProvider backend={isMobile ? TouchBackend : HTML5Backend}>
      <div className="flex flex-col w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Tasks</h2>
          {/* Allow any project member to create tasks */}
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => setShowNewTaskForm(!showNewTaskForm)}
            className="flex items-center gap-1"
          >
            <PlusCircle className="h-4 w-4" />
            New Task
          </Button>
        </div>

        {showNewTaskForm && (
          <div className="bg-card p-4 rounded-lg shadow mb-4">
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div className="flex flex-col gap-2">
                <label htmlFor="taskTitle" className="text-sm font-medium">Task Title</label>
                <input
                  id="taskTitle"
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="Enter task title"
                  className="w-full px-3 py-2 border border-border rounded-md bg-background"
                />
              </div>
              
              <div className="flex flex-col gap-2">
                <label htmlFor="taskPriority" className="text-sm font-medium">Priority</label>
                <select
                  id="taskPriority"
                  value={newTaskPriority}
                  onChange={(e) => setNewTaskPriority(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              
              <div className="flex flex-col gap-2">
                <label htmlFor="taskDueDate" className="text-sm font-medium">Due Date</label>
                <input
                  id="taskDueDate"
                  type="date"
                  value={newTaskDueDate}
                  onChange={(e) => setNewTaskDueDate(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background"
                />
              </div>
              
              {/* Assignee dropdown for project tasks */}
              {projectId && (
                <div className="flex flex-col gap-2">
                  <label htmlFor="taskAssignee" className="text-sm font-medium">Assign To</label>
                  <select
                    id="taskAssignee"
                    value={newTaskAssignee || ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      setNewTaskAssignee(value ? parseInt(value) : undefined);
                    }}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background"
                  >
                    <option value="">Unassigned</option>
                    
                    {/* Project owner (leader) is always available for selection */}
                    {project?.userId && (
                      <option value={project.userId}>
                        {project.userId === user?.id ? "Myself (Leader)" : "Project Leader"}
                      </option>
                    )}
                    
                    {/* Project members */}
                    {projectMembers && projectMembers.length > 0 && projectMembers.map((member) => (
                      // Don't filter out the project leader from member list - allow for selection in all cases
                      <option key={member.id} value={member.id}>
                        {member.id === user?.id ? `Myself (${member.name})` : member.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              
              <div className="flex justify-end gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setShowNewTaskForm(false);
                    setNewTaskTitle('');
                    setNewTaskPriority('medium');
                    setNewTaskDueDate('');
                    setNewTaskAssignee(undefined);
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createTaskMutation.isPending || !newTaskTitle.trim()}
                >
                  Add Task
                </Button>
              </div>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {renderTaskColumn(todoTasks, 'todo')}
          {renderTaskColumn(inProgressTasks, 'in_progress')}
          {renderTaskColumn(completedTasks, 'completed')}
        </div>

        {/* Undo Delete Notification */}
        {showUndoDeleteNotification && (
          <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-card border border-border shadow-lg rounded-md px-4 py-3 flex items-center gap-3 z-50 animate-in fade-in slide-in-from-bottom-5">
            <AlertCircle className="h-5 w-5 text-yellow-500" />
            <span>Task deleted. </span>
            <Button variant="link" className="p-0 h-auto text-primary" onClick={handleUndoDelete}>
              <Undo2 className="h-4 w-4 mr-1" />
              Undo
            </Button>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 ml-2" onClick={() => setShowUndoDeleteNotification(false)}>
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          </div>
        )}
      </div>
    </DndProvider>
  );
};

export default TaskBoard;