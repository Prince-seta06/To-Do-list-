import { Link, useLocation } from "wouter";
import { useState, useEffect } from "react";
import { 
  BarChart3, 
  Home,
  LogOut,
  Menu,
  X,
  InfoIcon,
  Coffee,
  FileText
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useIsMobile } from "../../hooks/use-mobile";

const Sidebar = () => {
  const [location] = useLocation();
  const { logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();
  
  // Close sidebar when navigating on mobile
  useEffect(() => {
    if (isMobile) {
      setIsOpen(false);
    }
  }, [location, isMobile]);

  const isActive = (path: string) => {
    return location.startsWith(path);
  };

  const handleLogout = () => {
    logout();
    window.location.href = "/";
  };

  // Mobile menu toggle
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      {isMobile && (
        <button 
          onClick={toggleMenu}
          className="fixed top-4 left-4 z-50 p-2 rounded-md bg-primary text-white"
          aria-label="Toggle menu"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      )}

      {/* Sidebar for Desktop */}
      {!isMobile && (
        <div className="w-64 bg-card h-full shadow-lg">
          <div className="p-4 border-b border-border">
            <Link href="/dashboard">
              <span className="text-xl font-bold flex items-center">
                <span className="text-primary mr-2">⚡</span>
                TaskFlow
              </span>
            </Link>
          </div>
          <SidebarContent isActive={isActive} handleLogout={handleLogout} />
        </div>
      )}

      {/* Mobile Sidebar - Slide-in from left */}
      {isMobile && (
        <div className={`fixed inset-0 z-40 ${isOpen ? "block" : "hidden"}`}>
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsOpen(false)} />
          
          {/* Sidebar */}
          <div className="absolute top-0 left-0 w-64 h-full bg-card shadow-lg transform transition-transform duration-300 ease-in-out">
            <div className="p-4 border-b border-border">
              <Link href="/dashboard">
                <span className="text-xl font-bold flex items-center">
                  <span className="text-primary mr-2">⚡</span>
                  TaskFlow
                </span>
              </Link>
            </div>
            <SidebarContent isActive={isActive} handleLogout={handleLogout} />
          </div>
        </div>
      )}
    </>
  );
};

// Extract sidebar links into a separate component for reuse
interface SidebarContentProps {
  isActive: (path: string) => boolean;
  handleLogout: () => void;
}

const SidebarContent = ({ isActive, handleLogout }: SidebarContentProps) => {
  return (
    <nav className="p-4 flex flex-col h-[calc(100%-64px)] justify-between">
      <ul className="space-y-2">
        <li>
          <Link 
            href="/" 
            className={`flex items-center p-2 rounded hover:bg-background ${
              isActive("/") ? "text-primary bg-background" : ""
            }`}
          >
            <Home className="mr-3 h-5 w-5" />
            <span>Home</span>
          </Link>
        </li>
        <li>
          <Link 
            href="/dashboard" 
            className={`flex items-center p-2 rounded hover:bg-background ${
              isActive("/dashboard") ? "text-primary bg-background" : ""
            }`}
          >
            <BarChart3 className="mr-3 h-5 w-5" />
            <span>Dashboard</span>
          </Link>
        </li>
        <li>
          <Link 
            href="/about" 
            className={`flex items-center p-2 rounded hover:bg-background ${
              isActive("/about") ? "text-primary bg-background" : ""
            }`}
          >
            <InfoIcon className="mr-3 h-5 w-5" />
            <span>About Us</span>
          </Link>
        </li>
        <li>
          <Link 
            href="/buy-me-coffee" 
            className={`flex items-center p-2 rounded hover:bg-background ${
              isActive("/buy-me-coffee") ? "text-primary bg-background" : ""
            }`}
          >
            <Coffee className="mr-3 h-5 w-5" />
            <span>Buy Me a Coffee</span>
          </Link>
        </li>
        <li>
          <Link 
            href="/docs" 
            className={`flex items-center p-2 rounded hover:bg-background ${
              isActive("/docs") ? "text-primary bg-background" : ""
            }`}
          >
            <FileText className="mr-3 h-5 w-5" />
            <span>Documentation</span>
          </Link>
        </li>
      </ul>
      
      <div className="mt-auto">
        <button
          onClick={handleLogout}
          className="w-full flex items-center p-2 rounded hover:bg-background text-destructive"
        >
          <LogOut className="mr-3 h-5 w-5" />
          <span>Logout</span>
        </button>
      </div>
    </nav>
  );
};

export default Sidebar;
