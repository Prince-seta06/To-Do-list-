import { useState } from "react";
import { Link } from "wouter";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import DemoModal from "../components/DemoModal";
import { Button } from "@/components/ui/button";
import {
  CalendarDays,
  BarChart3,
  Users,
  ClipboardCheck,
  Bell,
  Search,
  Clock,
  Smartphone,
  ShieldCheck,
  Zap,
  Play,
  ArrowRight
} from "lucide-react";

// Define the feature interface
interface Feature {
  title: string;
  description: string;
  icon: JSX.Element;
  benefits: string[];
}

const FeaturesPage = () => {
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  
  const openDemoModal = () => {
    setIsDemoModalOpen(true);
  };

  // Define all the features
  const features: Feature[] = [
    {
      title: "Task Management",
      description: "Create, assign, and track tasks with ease. Add due dates, priorities, and detailed descriptions to keep your team aligned.",
      icon: <ClipboardCheck className="h-12 w-12 text-primary" />,
      benefits: [
        "Create tasks with customizable fields",
        "Set priorities and due dates",
        "Assign tasks to team members",
        "Track progress in real-time"
      ]
    },
    {
      title: "Team Collaboration",
      description: "Work together seamlessly with integrated communication tools, file sharing, and activity tracking.",
      icon: <Users className="h-12 w-12 text-primary" />,
      benefits: [
        "Real-time updates on task status",
        "Comment and discuss within tasks",
        "Share files and attachments",
        "Team calendars for synchronized scheduling"
      ]
    },
    {
      title: "Progress Tracking",
      description: "Monitor project progress with intuitive dashboards, visual reports, and customizable analytics.",
      icon: <BarChart3 className="h-12 w-12 text-primary" />,
      benefits: [
        "Interactive project dashboards",
        "Visual progress indicators",
        "Customizable report generation",
        "Team performance analytics"
      ]
    },
    {
      title: "Scheduling & Calendar",
      description: "Manage deadlines and meetings with integrated calendar features that sync with your existing tools.",
      icon: <CalendarDays className="h-12 w-12 text-primary" />,
      benefits: [
        "Deadline management",
        "Team availability tracking",
        "Meeting scheduling",
        "Calendar integrations"
      ]
    },
    {
      title: "Notifications & Alerts",
      description: "Stay informed with customizable notifications for task updates, deadlines, and team activities.",
      icon: <Bell className="h-12 w-12 text-primary" />,
      benefits: [
        "Customizable notification preferences",
        "Email and in-app alerts",
        "Deadline reminders",
        "Activity digest summaries"
      ]
    },
    {
      title: "Search & Filter",
      description: "Quickly find what you need with powerful search functionality and advanced filtering options.",
      icon: <Search className="h-12 w-12 text-primary" />,
      benefits: [
        "Full-text search across all content",
        "Advanced filtering options",
        "Saved searches and views",
        "Quick access to recent items"
      ]
    },
    {
      title: "Time Tracking",
      description: "Track time spent on tasks and projects to improve productivity and resource allocation.",
      icon: <Clock className="h-12 w-12 text-primary" />,
      benefits: [
        "Built-in time tracking",
        "Time reports and analytics",
        "Billable hours calculation",
        "Resource utilization insights"
      ]
    },
    {
      title: "Mobile Access",
      description: "Access your tasks and projects from anywhere with our responsive mobile interface.",
      icon: <Smartphone className="h-12 w-12 text-primary" />,
      benefits: [
        "Fully responsive design",
        "Native mobile experience",
        "Offline access to critical data",
        "Quick task creation on the go"
      ]
    },
    {
      title: "Security & Privacy",
      description: "Rest easy knowing your data is protected with enterprise-grade security and privacy controls.",
      icon: <ShieldCheck className="h-12 w-12 text-primary" />,
      benefits: [
        "Role-based access controls",
        "Data encryption at rest and in transit",
        "Regular security audits",
        "Compliance with privacy regulations"
      ]
    },
    {
      title: "Performance & Speed",
      description: "Experience lightning-fast performance with our optimized architecture designed for speed.",
      icon: <Zap className="h-12 w-12 text-primary" />,
      benefits: [
        "Fast page loads and interactions",
        "Optimized for large projects",
        "Smooth animations and transitions",
        "Low resource consumption"
      ]
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <div className="bg-card py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Powerful Features for Productive Teams</h1>
            <p className="text-muted-foreground text-lg md:text-xl max-w-3xl mx-auto mb-10">
              TaskFlow combines powerful project management features with intuitive design to help your team collaborate effectively and deliver projects on time.
            </p>
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Button 
                size="lg" 
                className="py-6"
                onClick={openDemoModal}
              >
                <Play className="mr-2 h-5 w-5" /> Watch Demo
              </Button>
              <Button asChild size="lg" variant="outline" className="py-6">
                <Link href="/signup">Start Free Trial</Link>
              </Button>
            </div>
          </div>
        </div>
        
        {/* Features Grid */}
        <div className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="bg-card rounded-lg border border-border p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="mb-4 p-3 bg-primary/10 rounded-full">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground mb-5">
                    {feature.description}
                  </p>
                  <div className="w-full space-y-2 text-left">
                    {feature.benefits.map((benefit, idx) => (
                      <div key={idx} className="flex items-start">
                        <div className="mr-2 mt-1 text-primary">
                          <CheckIcon className="h-4 w-4" />
                        </div>
                        <span className="text-sm">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* CTA Section */}
        <div className="bg-primary/10 py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Experience These Features?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
              Join thousands of teams that use TaskFlow to stay organized, collaborate effectively, and deliver projects on time.
            </p>
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Button asChild size="lg">
                <Link href="/signup">Start Free Trial</Link>
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={openDemoModal}
              >
                <Play className="mr-2 h-5 w-5" /> Watch Demo
              </Button>
            </div>
          </div>
        </div>
        
        {/* Comparison Section */}
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">How TaskFlow Compares</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              See why TaskFlow is the preferred choice for teams of all sizes.
            </p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-muted">
                  <th className="p-4 text-left">Feature</th>
                  <th className="p-4 text-center">TaskFlow</th>
                  <th className="p-4 text-center">Basic Tools</th>
                  <th className="p-4 text-center">Enterprise Solutions</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border">
                  <td className="p-4 font-medium">Ease of Use</td>
                  <td className="p-4 text-center text-green-500">⭐⭐⭐⭐⭐</td>
                  <td className="p-4 text-center text-muted-foreground">⭐⭐⭐⭐</td>
                  <td className="p-4 text-center text-muted-foreground">⭐⭐⭐</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="p-4 font-medium">Collaboration Features</td>
                  <td className="p-4 text-center text-green-500">⭐⭐⭐⭐⭐</td>
                  <td className="p-4 text-center text-muted-foreground">⭐⭐</td>
                  <td className="p-4 text-center text-muted-foreground">⭐⭐⭐⭐</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="p-4 font-medium">Visual Progress Tracking</td>
                  <td className="p-4 text-center text-green-500">⭐⭐⭐⭐⭐</td>
                  <td className="p-4 text-center text-muted-foreground">⭐⭐</td>
                  <td className="p-4 text-center text-muted-foreground">⭐⭐⭐⭐</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="p-4 font-medium">Affordability</td>
                  <td className="p-4 text-center text-green-500">⭐⭐⭐⭐⭐</td>
                  <td className="p-4 text-center text-muted-foreground">⭐⭐⭐⭐</td>
                  <td className="p-4 text-center text-muted-foreground">⭐⭐</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="p-4 font-medium">Mobile Access</td>
                  <td className="p-4 text-center text-green-500">⭐⭐⭐⭐⭐</td>
                  <td className="p-4 text-center text-muted-foreground">⭐⭐⭐</td>
                  <td className="p-4 text-center text-muted-foreground">⭐⭐⭐⭐</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Learn More Section */}
        <div className="container mx-auto px-4 py-16">
          <div className="bg-card rounded-lg border border-border p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">Still Have Questions?</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Explore our resources to learn more about TaskFlow features and how they can benefit your team.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Link href="/documentation" className="bg-background rounded-lg border border-border p-6 hover:shadow-md transition-shadow group">
                <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">Documentation</h3>
                <p className="text-muted-foreground mb-4">
                  Detailed guides and API documentation to help you get the most out of TaskFlow.
                </p>
                <div className="flex items-center text-primary">
                  <span>Read Docs</span>
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
              
              <Link href="/about" className="bg-background rounded-lg border border-border p-6 hover:shadow-md transition-shadow group">
                <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">About Us</h3>
                <p className="text-muted-foreground mb-4">
                  Learn about our mission to make team collaboration and productivity easier for everyone.
                </p>
                <div className="flex items-center text-primary">
                  <span>About TaskFlow</span>
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
              
              <div onClick={openDemoModal} className="bg-background rounded-lg border border-border p-6 hover:shadow-md transition-shadow group cursor-pointer">
                <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">Interactive Demo</h3>
                <p className="text-muted-foreground mb-4">
                  See TaskFlow in action with our guided interactive product tour.
                </p>
                <div className="flex items-center text-primary">
                  <span>Watch Demo</span>
                  <Play className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
      
      {/* Demo Modal */}
      <DemoModal 
        open={isDemoModalOpen} 
        onOpenChange={setIsDemoModalOpen} 
      />
    </div>
  );
};

// Simple check icon component
const CheckIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export default FeaturesPage;