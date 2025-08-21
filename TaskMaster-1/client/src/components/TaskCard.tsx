import { Calendar, User, UserPlus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface TaskCardProps {
  task: {
    id: number;
    title: string;
    status: string;
    priority: string;
    dueDate?: string;
    assigneeId?: number;
    userId: number; // Creator/owner of the task
  };
}

interface User {
  id: number;
  name: string;
  email: string;
  username: string;
}

const TaskCard = ({ task }: TaskCardProps) => {
  // Fetch assignee info if there's an assignee
  const { data: assignee } = useQuery<User>({
    queryKey: [`/api/users/${task.assigneeId}`],
    enabled: !!task.assigneeId,
  });

  // Fetch creator info
  const { data: creator } = useQuery<User>({
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

  // Determine priority style
  const getPriorityBadge = () => {
    switch (task.priority) {
      case 'high':
        return <span className="text-xs whitespace-nowrap px-2 py-1 rounded bg-destructive/20 text-destructive">High</span>;
      case 'medium':
        return <span className="text-xs whitespace-nowrap px-2 py-1 rounded bg-yellow-500/20 text-yellow-500">Medium</span>;
      case 'low':
        return <span className="text-xs whitespace-nowrap px-2 py-1 rounded bg-blue-500/20 text-blue-500">Low</span>;
      case 'completed':
        return <span className="text-xs whitespace-nowrap px-2 py-1 rounded bg-green-500/20 text-green-500">Done</span>;
      default:
        return <span className="text-xs whitespace-nowrap px-2 py-1 rounded bg-muted text-muted-foreground">Normal</span>;
    }
  };

  // Get title class based on status
  const getTitleClass = () => {
    return task.status === 'completed' ? 'font-medium line-through truncate' : 'font-medium truncate';
  };

  return (
    <div className="bg-background p-3 rounded border border-border w-full max-w-full">
      <div className="flex justify-between items-start gap-2 mb-2">
        <h4 className={`${getTitleClass()} max-w-[70%]`} title={task.title}>
          {task.title}
        </h4>
        {getPriorityBadge()}
      </div>
      
      {task.dueDate && (
        <p className="text-muted-foreground text-sm mb-2 flex items-center truncate">
          <Calendar className="h-3 w-3 mr-1 flex-shrink-0" />
          <span className="truncate">Due {task.dueDate}</span>
        </p>
      )}
      
      {/* Assignee information */}
      <div className="flex items-center mt-2">
        {assignee ? (
          <>
            <div 
              className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs flex-shrink-0" 
              title={`Assigned to: ${assignee.name}`}
            >
              {getInitials(assignee.name)}
            </div>
            <span className="text-xs ml-2 text-muted-foreground truncate font-medium">
              Assigned to: {assignee.name}
            </span>
          </>
        ) : (
          <>
            <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs flex-shrink-0">
              <User className="h-3 w-3" />
            </div>
            <span className="text-xs ml-2 text-muted-foreground truncate italic">
              Unassigned
            </span>
          </>
        )}
      </div>
      
      {/* Task creator information */}
      {creator && (
        <div className="flex items-center mt-2">
          <div 
            className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 flex items-center justify-center text-xs flex-shrink-0" 
            title={`Created by: ${creator.name}`}
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

export default TaskCard;
