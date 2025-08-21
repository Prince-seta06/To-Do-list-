import { useState } from "react";
import { Link } from "wouter";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import DemoModal from "../components/DemoModal";
import { Button } from "@/components/ui/button";
import { Check, Play, ArrowRight } from "lucide-react";

const HomePage = () => {
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  
  const openDemoModal = () => {
    setIsDemoModalOpen(true);
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Hero content */}
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                Collaborate & Manage Projects Effortlessly
              </h1>
              <p className="text-muted-foreground text-lg md:text-xl max-w-xl">
                Transform your team's productivity with our intuitive task management platform. Real-time collaboration, customizable workflows, and seamless organization.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 pt-4">
                <Button asChild size="lg" className="py-6">
                  <Link href="/signup">Get Started Free</Link>
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="py-6 flex items-center"
                  onClick={openDemoModal}
                >
                  <Play className="mr-2 h-5 w-5" /> Watch Demo
                </Button>
              </div>
              <div className="flex items-center space-x-6 pt-2 text-muted-foreground">
                <span className="flex items-center">
                  <Check className="h-4 w-4 text-primary mr-2" />
                  No credit card required
                </span>
                <span className="flex items-center">
                  <Check className="h-4 w-4 text-primary mr-2" />
                  14-day free trial
                </span>
              </div>
            </div>
            
            {/* Hero image */}
            <div className="relative">
              <div className="bg-card rounded-lg p-4 shadow-xl">
                <div className="flex space-x-2 mb-3">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 p-2 bg-background/80 rounded border border-border">
                    <div className="w-5 h-5 bg-primary rounded-sm flex items-center justify-center">
                      <Check className="h-3 w-3 text-white" />
                    </div>
                    <span>Design system update</span>
                  </div>
                  <div className="flex items-center space-x-2 p-2 bg-background/80 rounded border border-border">
                    <div className="w-5 h-5 bg-muted rounded-sm"></div>
                    <span>User research analysis</span>
                  </div>
                  <div className="flex items-center space-x-2 p-2 bg-background/80 rounded border border-border">
                    <div className="w-5 h-5 bg-muted rounded-sm"></div>
                    <span>Project timeline review</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="bg-card py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Designed for Teams Like Yours</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto mb-4">
                Powerful tools to keep your projects on track and your team aligned.
              </p>
              <Link href="/features" className="text-primary hover:underline inline-flex items-center">
                View all features <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <Link href="/features" className="group">
                <div className="bg-background p-6 rounded-lg border border-border hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center mb-4 group-hover:bg-primary/30 transition-colors">
                    <i className="fas fa-tasks text-primary text-xl"></i>
                  </div>
                  <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors">Task Management</h3>
                  <p className="text-muted-foreground">
                    Create, assign, and track tasks with ease. Add due dates, priorities, and custom fields.
                  </p>
                </div>
              </Link>
              
              {/* Feature 2 */}
              <Link href="/features" className="group">
                <div className="bg-background p-6 rounded-lg border border-border hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center mb-4 group-hover:bg-primary/30 transition-colors">
                    <i className="fas fa-users text-primary text-xl"></i>
                  </div>
                  <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors">Team Collaboration</h3>
                  <p className="text-muted-foreground">
                    Work together in real-time with comments, file sharing, and activity tracking.
                  </p>
                </div>
              </Link>
              
              {/* Feature 3 */}
              <Link href="/features" className="group">
                <div className="bg-background p-6 rounded-lg border border-border hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center mb-4 group-hover:bg-primary/30 transition-colors">
                    <i className="fas fa-chart-line text-primary text-xl"></i>
                  </div>
                  <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors">Progress Tracking</h3>
                  <p className="text-muted-foreground">
                    Monitor progress with intuitive dashboards, reports, and real-time updates.
                  </p>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Testimonials */}
        <div className="py-16 container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Trusted by Teams Worldwide</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              See how organizations are transforming their workflow with TaskFlow.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Testimonial 1 */}
            <div className="bg-card p-6 rounded-lg border border-border">
              <div className="flex items-center space-x-1 text-yellow-400 mb-4">
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
              </div>
              <p className="text-muted-foreground mb-4">
                "TaskFlow has completely transformed how our development team collaborates on projects. The intuitive interface and customizable workflows have increased our productivity by 40%."
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mr-3">
                  <span className="text-sm font-medium">JD</span>
                </div>
                <div>
                  <p className="font-medium">John Developer</p>
                  <p className="text-muted-foreground text-sm">CTO, TechCorp</p>
                </div>
              </div>
            </div>
            
            {/* Testimonial 2 */}
            <div className="bg-card p-6 rounded-lg border border-border">
              <div className="flex items-center space-x-1 text-yellow-400 mb-4">
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
              </div>
              <p className="text-muted-foreground mb-4">
                "Since implementing TaskFlow, our design team has reduced project delivery time by 30%. The real-time collaboration features are game-changing for our remote team."
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mr-3">
                  <span className="text-sm font-medium">SD</span>
                </div>
                <div>
                  <p className="font-medium">Sarah Designer</p>
                  <p className="text-muted-foreground text-sm">Lead Designer, CreativeStudio</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-primary/10 py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Workflow?</h2>
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

export default HomePage;
