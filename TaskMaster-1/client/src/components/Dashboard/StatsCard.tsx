import { ReactNode } from "react";

interface StatsCardProps {
  title: string;
  value: number;
  description: string;
  icon: ReactNode;
  iconBg: string;
}

const StatsCard = ({ title, value, description, icon, iconBg }: StatsCardProps) => {
  return (
    <div className="bg-card p-4 rounded-lg shadow">
      <div className="flex justify-between">
        <div>
          <h3 className="text-muted-foreground text-sm font-medium">{title}</h3>
          <p className="text-2xl font-semibold">{value}</p>
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        </div>
        <div className="flex items-start">
          <div className={`w-8 h-8 rounded flex items-center justify-center ${iconBg}`}>
            {icon}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
