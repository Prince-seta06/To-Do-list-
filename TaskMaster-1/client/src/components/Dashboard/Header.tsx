import { Bell, Settings } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useLocation } from "wouter";
import { useIsMobile } from "../../hooks/use-mobile";
import { useState } from "react";
import ConfettiSettingsModal from "../ConfettiSettingsModal";
import { useConfetti } from "../../contexts/ConfettiContext";

interface HeaderProps {
  title?: string; // Allow custom titles to be passed
}

const Header = ({ title }: HeaderProps) => {
  const { getUserInfo } = useAuth();
  const user = getUserInfo();
  const [location] = useLocation();
  const isMobile = useIsMobile();
  const { settings, updateSettings } = useConfetti();
  const [confettiSettingsOpen, setConfettiSettingsOpen] = useState(false);
  
  const getInitials = () => {
    if (!user || !user.name) return "U";
    
    const nameParts = user.name.split(" ");
    if (nameParts.length > 1) {
      return `${nameParts[0][0]}${nameParts[1][0]}`;
    }
    return nameParts[0][0];
  };

  // Determine the page title based on the current location
  const getPageTitle = () => {
    if (title) return title;
    
    if (location === "/dashboard") return "Dashboard";
    if (location.startsWith("/project/")) return "Project Details";
    return "TaskFlow";
  };

  return (
    <header className="bg-card shadow-md p-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          {/* Add left padding to accommodate the mobile menu button */}
          <h2 className={`text-xl font-semibold ${isMobile ? 'ml-8' : ''}`}>{getPageTitle()}</h2>
        </div>
        
        <div className="flex items-center space-x-4">
          <button 
            className="p-2 rounded-full hover:bg-background flex items-center gap-1"
            onClick={() => setConfettiSettingsOpen(true)}
            title="Celebration Settings"
          >
            <Settings className="h-5 w-5" />
            <span className="text-xs hidden md:inline-block">Celebrations</span>
          </button>
          <button className="p-2 rounded-full hover:bg-background">
            <Bell className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            {user && (
              <span className="text-sm hidden md:block">{user.name}</span>
            )}
            <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center">
              <span className="text-sm font-medium">{getInitials()}</span>
            </div>
          </div>
        </div>
      </div>
      
      <ConfettiSettingsModal
        open={confettiSettingsOpen}
        onOpenChange={setConfettiSettingsOpen}
        settings={settings}
        onSave={updateSettings}
      />
    </header>
  );
};

export default Header;
