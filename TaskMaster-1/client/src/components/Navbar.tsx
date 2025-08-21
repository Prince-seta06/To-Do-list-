import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  Menu, 
  X 
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";

const Navbar = () => {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated, logout } = useAuth();

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <nav className="bg-card px-6 py-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <Link href="/" className="text-xl font-bold">
            TaskFlow
          </Link>
        </div>
        
        <div className="hidden md:flex space-x-6">
          <Link href="/" className={`hover:text-primary transition-colors ${location === "/" ? "text-primary" : ""}`}>
            Home
          </Link>
          <Link href="/features" className={`hover:text-primary transition-colors ${location === "/features" ? "text-primary" : ""}`}>
            Features
          </Link>
          
          {isAuthenticated() ? (
            <div className="flex space-x-2">
              <Button asChild variant="default">
                <Link href="/dashboard">Dashboard</Link>
              </Button>
              <Button variant="outline" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          ) : (
            <div className="flex space-x-2">
              <Button asChild variant="default">
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/signup">Sign Up</Link>
              </Button>
            </div>
          )}
        </div>
        
        <button 
          className="md:hidden flex items-center text-foreground focus:outline-none"
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
      
      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-4 pb-4">
          <Link href="/" className="block py-2 hover:text-primary transition-colors">
            Home
          </Link>
          <Link href="/features" className="block py-2 hover:text-primary transition-colors">
            Features
          </Link>
          
          {isAuthenticated() ? (
            <div className="flex flex-col space-y-2 mt-2">
              <Button asChild variant="default" className="justify-center">
                <Link href="/dashboard">Dashboard</Link>
              </Button>
              <Button 
                variant="outline" 
                className="justify-center"
                onClick={handleLogout}
              >
                Logout
              </Button>
            </div>
          ) : (
            <div className="flex flex-col space-y-2 mt-2">
              <Button asChild variant="default" className="justify-center">
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild variant="outline" className="justify-center">
                <Link href="/signup">Sign Up</Link>
              </Button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
