import { useState, useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import { useQuery } from '@tanstack/react-query';
import { Edit, Trash, CheckCircle, Clock, AlertCircle, User, UserPlus } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface TaskProps {
  task: {
    id: number;
    title: string;
    status: string;
    priority: string;
    dueDate?: string;
    assigneeId?: number;
    projectId?: number;
    userId: number; // Task creator/owner
  };
  index: number;
  moveTask: (dragIndex: number, hoverIndex: number) => void;
  onStatusChange: (taskId: number, newStatus: string) => void;
  onDelete?: (taskId: number) => void; // Callback for task deletion to show undo notification
}

const ItemTypes = {
  TASK: 'task',
};

interface UserData {
  id: number;
  name: string;
  email: string;
  username: string;
}

const DraggableTaskCard = ({ task, index, moveTask, onStatusChange, onDelete }: TaskProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);
  const { user } = useAuth();
  
  // Fetch assignee info if there's an assignee
  const { data: assignee } = useQuery<UserData>({
    queryKey: [`/api/users/${task.assigneeId}`],
    enabled: !!task.assigneeId,
  });

  // Fetch creator info
  const { data: creator } = useQuery<UserData>({
    queryKey: [`/api/users/${task.userId}`],
    enabled: !!task.userId,
  });
  
  // Get initials
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const priorityColors = {
    high: 'bg-red-200 text-red-700',
    medium: 'bg-yellow-200 text-yellow-700',
    low: 'bg-green-200 text-green-700',
  };

  const statusColors = {
    todo: 'bg-blue-200 text-blue-700',
    in_progress: 'bg-orange-200 text-orange-700',
    completed: 'bg-green-200 text-green-700',
  };

  const [, drop] = useDrop({
    accept: ItemTypes.TASK,
    hover(item: any, monitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;

      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return;
      }

      // Determine rectangle on screen
      const hoverBoundingRect = ref.current.getBoundingClientRect();

      // Get vertical middle
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

      // Determine mouse position
      const clientOffset = monitor.getClientOffset();

      // Get pixels to the top
      const hoverClientY = clientOffset!.y - hoverBoundingRect.top;

      // Only perform the move when the mouse has crossed half of the items height
      // When dragging downwards, only move when the cursor is below 50%
      // When dragging upwards, only move when the cursor is above 50%
      // Dragging downwards
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }

      // Dragging upwards
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      // Time to actually perform the action
      moveTask(dragIndex, hoverIndex);

      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index searches.
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.TASK,
    item: () => {
      return { id: task.id, index, status: task.status };
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    end: (item, monitor) => {
      const dropResult = monitor.getDropResult<{ status: string }>();
      if (item && dropResult && dropResult.status && dropResult.status !== task.status) {
        onStatusChange(task.id, dropResult.status);
      }
    },
  });

  const opacity = isDragging ? 0.4 : 1;
  drag(drop(ref));

  const getPriorityIcon = () => {
    switch (task.priority) {
      case 'high':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'medium':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'low':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const handleDelete = async () => {
    if (isDeleting) return;
    
    // Open a confirmation dialog before deleting
    const confirmed = window.confirm('Are you sure you want to delete this task?');
    if (!confirmed) return;
    
    setIsDeleting(true);
    try {
      await apiRequest('DELETE', `/api/tasks/${task.id}`);
      
      // Immediately remove the task from the UI by invalidating all related queries
      if (task.projectId) {
        // Immediately invalidate project-specific task list
        queryClient.invalidateQueries({ queryKey: [`/api/projects/${task.projectId}/tasks`] });
        // Also update project progress
        queryClient.invalidateQueries({ queryKey: [`/api/projects/${task.projectId}`] });
      }
      
      // Also invalidate all tasks to update dashboard counts
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      
      // Force refetch all queries to ensure immediate UI updates
      setTimeout(() => {
        queryClient.refetchQueries({ queryKey: ['/api/tasks'] });
        if (task.projectId) {
          queryClient.refetchQueries({ queryKey: [`/api/projects/${task.projectId}/tasks`] });
          queryClient.refetchQueries({ queryKey: [`/api/projects/${task.projectId}`] });
        }
      }, 50);
      
      // Show temporary undo notification if a callback is provided
      if (onDelete) {
        onDelete(task.id);
      } else {
        // Otherwise just show a regular toast
        toast({
          title: 'Task deleted',
          description: 'The task has been successfully deleted',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete the task',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div
      ref={ref}
      style={{ opacity }}
      className="bg-white text-black dark:bg-card dark:text-white p-3 rounded-md shadow-sm border border-border mb-2 cursor-move relative"
    >
      <div className="flex justify-between">
        <h3 className="font-medium text-sm line-clamp-2">{task.title}</h3>
        
        <div className="flex gap-1">
          <button 
            className="text-muted-foreground hover:text-foreground p-1 rounded-md"
            onClick={(e) => {
              e.stopPropagation();
              // Edit task functionality would be implemented here
            }}
          >
            <Edit className="h-3.5 w-3.5" />
          </button>
          
          <button 
            className="text-muted-foreground hover:text-red-500 p-1 rounded-md"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete();
            }}
            disabled={isDeleting}
          >
            <Trash className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      
      <div className="flex justify-between items-center mt-2 text-xs">
        <div className="flex gap-2">
          <span className={`px-2 py-0.5 rounded ${priorityColors[task.priority as keyof typeof priorityColors] || 'bg-gray-200 text-gray-700'} flex items-center gap-0.5`}>
            {getPriorityIcon()}
            {task.priority}
          </span>
          
          <span className={`px-2 py-0.5 rounded ${statusColors[task.status as keyof typeof statusColors] || 'bg-gray-200 text-gray-700'}`}>
            {task.status.replace('_', ' ')}
          </span>
        </div>
        
        {task.dueDate && (
          <span className="text-muted-foreground">
            Due: {task.dueDate}
          </span>
        )}
      </div>
      
      {/* Assignee information */}
      <div className="flex items-center mt-2 text-xs">
        {assignee ? (
          <>
            <div 
              className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs flex-shrink-0" 
              title={`Assigned to: ${assignee.name}`}
            >
              {getInitials(assignee.name)}
            </div>
            <span className="text-xs ml-2 text-muted-foreground truncate font-medium">
              {task.projectId ? `Assigned to: ${assignee.name}` : (assignee.id === user?.id ? 'Assigned to you' : `From ${assignee.name}`)}
            </span>
          </>
        ) : (
          <>
            <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-xs flex-shrink-0">
              <User className="h-3 w-3" />
            </div>
            <span className="text-xs ml-2 text-muted-foreground truncate italic">
              Unassigned
            </span>
          </>
        )}
      </div>

      {/* Task creator information */}
      {creator && creator.id !== (assignee?.id || 0) && (
        <div className="flex items-center mt-2 text-xs">
          <div 
            className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 flex items-center justify-center text-xs flex-shrink-0" 
            title={`Assigned by: ${creator.name}`}
          >
            <UserPlus className="h-3 w-3" />
          </div>
          <span className="text-xs ml-2 text-muted-foreground truncate">
            Assigned by: {creator.name}
          </span>
        </div>
      )}
    </div>
  );
};

export default DraggableTaskCard;