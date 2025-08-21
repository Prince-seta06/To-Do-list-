import React from 'react';
import { useDrop } from 'react-dnd';
import DraggableTaskCard from './DraggableTaskCard';

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

interface TaskColumnProps {
  status: string;
  tasks: Task[];
  moveTask: (dragIndex: number, hoverIndex: number) => void;
  onStatusChange: (taskId: number, newStatus: string) => void;
  onDelete?: (taskId: number) => void; // Add callback for undo notification
}

const ItemTypes = {
  TASK: 'task',
};

const TaskColumn = ({ status, tasks, moveTask, onStatusChange, onDelete }: TaskColumnProps) => {
  const [{ isOver }, drop] = useDrop({
    accept: ItemTypes.TASK,
    drop: () => ({ status }),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  });

  const statusDisplayNames = {
    todo: 'To Do',
    in_progress: 'In Progress',
    completed: 'Completed'
  };
  
  const displayName = statusDisplayNames[status as keyof typeof statusDisplayNames] || status;

  return (
    <div
      ref={drop}
      className={`bg-card rounded-lg shadow w-full transition-colors ${
        isOver ? 'bg-muted/50' : ''
      }`}
    >
      <div className="p-4 border-b border-border flex justify-between items-center">
        <h3 className="font-medium">{displayName}</h3>
        <span className="bg-muted text-foreground text-xs px-2 py-1 rounded">
          {tasks.length}
        </span>
      </div>
      <div className="p-2 min-h-[200px]">
        {tasks.length > 0 ? (
          tasks.map((task, index) => (
            <DraggableTaskCard
              key={task.id}
              task={task}
              index={index}
              moveTask={moveTask}
              onStatusChange={onStatusChange}
              onDelete={onDelete}
            />
          ))
        ) : (
          <div className="p-4 text-center text-muted-foreground">
            {`No ${
              status === 'todo'
                ? 'tasks to do'
                : status === 'in_progress'
                  ? 'tasks in progress'
                  : 'completed tasks'
            }`}
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskColumn;