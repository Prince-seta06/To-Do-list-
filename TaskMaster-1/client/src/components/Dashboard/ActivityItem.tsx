import { User } from "lucide-react";

interface ActivityItemProps {
  activity: {
    id: number;
    userId: number;
    action: string;
    target: string;
    targetId?: number;
    createdAt?: string;
    user?: {
      name: string;
      initials: string;
    };
  };
}

const ActivityItem = ({ activity }: ActivityItemProps) => {
  // Sample user data for display
  const users = {
    1: { name: "John Doe", initials: "JD" },
    2: { name: "Jane Smith", initials: "JS" },
    3: { name: "Mike Johnson", initials: "MJ" }
  };
  
  const getUser = () => {
    if (activity.user) return activity.user;
    return users[activity.userId as keyof typeof users] || { name: "Unknown User", initials: "UN" };
  };
  
  const user = getUser();
  
  const getTimeAgo = () => {
    if (!activity.createdAt) return "recently";
    
    const now = new Date();
    const createdAt = new Date(activity.createdAt);
    const diffInMinutes = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minutes ago`;
    } else if (diffInMinutes < 24 * 60) {
      return `${Math.floor(diffInMinutes / 60)} hours ago`;
    } else {
      return `${Math.floor(diffInMinutes / (60 * 24))} days ago`;
    }
  };

  const getTargetWithColor = () => {
    return <span className="text-primary">{activity.target}</span>;
  };

  return (
    <div className="flex">
      <div className="w-8 h-8 rounded-full bg-muted flex-shrink-0 flex items-center justify-center text-xs">
        {user.initials}
      </div>
      <div className="ml-3">
        <p className="text-sm">
          <span className="font-medium">{user.name}</span>{" "}
          <span>{activity.action}</span>{" "}
          {getTargetWithColor()}
        </p>
        <p className="text-xs text-muted-foreground">{getTimeAgo()}</p>
      </div>
    </div>
  );
};

export default ActivityItem;
