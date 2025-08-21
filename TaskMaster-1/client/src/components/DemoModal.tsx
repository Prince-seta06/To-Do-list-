import { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle2, ArrowRight, ArrowLeft, Play } from 'lucide-react';

interface DemoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Demo steps with content
const demoSteps = [
  {
    title: "Task Management Made Simple",
    description: "Create, assign, and track tasks with our intuitive interface. Customize task statuses, set due dates, and add detailed descriptions.",
    image: "task-management.png", // Placeholder - we'll use CSS for now
    icon: <CheckCircle2 className="h-6 w-6 text-primary" />
  },
  {
    title: "Real-time Collaboration",
    description: "Work with your team in real-time. Share files, add comments, and see who's working on what at any moment.",
    image: "collaboration.png", // Placeholder - we'll use CSS for now
    icon: <CheckCircle2 className="h-6 w-6 text-primary" />
  },
  {
    title: "Track Progress Visually",
    description: "Monitor project progress with customizable dashboards, visual reports, and real-time analytics.",
    image: "progress-tracking.png", // Placeholder - we'll use CSS for now
    icon: <CheckCircle2 className="h-6 w-6 text-primary" />
  },
  {
    title: "Smart Task Organization",
    description: "Organize tasks into projects, assign team members, and set priorities to ensure nothing falls through the cracks.",
    image: "organization.png", // Placeholder - we'll use CSS for now
    icon: <CheckCircle2 className="h-6 w-6 text-primary" />
  },
  {
    title: "Mobile Accessibility",
    description: "Access your tasks and projects from anywhere with our responsive mobile interface.",
    image: "mobile.png", // Placeholder - we'll use CSS for now
    icon: <CheckCircle2 className="h-6 w-6 text-primary" />
  }
];

const DemoModal = ({ open, onOpenChange }: DemoModalProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Auto-advance timer reference
  const autoAdvanceTimer = 5000; // 5 seconds
  
  // Handle playing the demo automatically
  const togglePlayDemo = () => {
    if (isPlaying) {
      setIsPlaying(false);
      // Clear any timers if needed
    } else {
      setIsPlaying(true);
      // Start auto-advancing
      const interval = setInterval(() => {
        setCurrentStep((prev) => {
          if (prev >= demoSteps.length - 1) {
            clearInterval(interval);
            setIsPlaying(false);
            return 0; // Reset to first step
          }
          return prev + 1;
        });
      }, autoAdvanceTimer);
      
      // Clean up the interval when the modal closes
      return () => clearInterval(interval);
    }
  };
  
  // Navigate to the next step
  const nextStep = () => {
    if (currentStep < demoSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setCurrentStep(0); // Loop back to the beginning
    }
  };
  
  // Navigate to the previous step
  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      setCurrentStep(demoSteps.length - 1); // Loop to the end
    }
  };
  
  const currentDemoStep = demoSteps[currentStep];
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl text-center">TaskFlow Demo</DialogTitle>
          <DialogDescription className="text-center">
            See how TaskFlow can transform your team's productivity
          </DialogDescription>
        </DialogHeader>
        
        {/* Step indicator */}
        <div className="flex justify-center mt-2 mb-4">
          {demoSteps.map((_, index) => (
            <div 
              key={index}
              className={`h-2 w-8 mx-1 rounded-full transition-all ${
                index === currentStep 
                  ? 'bg-primary' 
                  : 'bg-muted'
              }`}
              onClick={() => setCurrentStep(index)}
            />
          ))}
        </div>
        
        {/* Demo content */}
        <div className="py-4 flex flex-col items-center">
          {/* Preview image area - using placeholder for now */}
          <div className="w-full h-[250px] mb-6 bg-muted rounded-lg overflow-hidden flex items-center justify-center">
            <div className="text-4xl text-primary/30">
              {currentDemoStep.icon}
            </div>
            {/* Simulated UI for each step */}
            <div className={`
              absolute inset-0 m-auto h-[200px] w-[80%] rounded-lg 
              bg-background border border-border p-4 flex flex-col
              transform transition-all
              ${currentStep % 2 === 0 ? 'translate-y-2' : '-translate-y-2'}
            `}>
              <div className="flex items-center space-x-2 mb-3">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
              
              <div className="flex-1 overflow-hidden">
                {currentStep === 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 p-2 bg-card rounded border border-border">
                      <div className="w-5 h-5 bg-primary rounded-sm flex items-center justify-center">
                        <CheckCircle2 className="h-3 w-3 text-white" />
                      </div>
                      <span>Design system update</span>
                    </div>
                    <div className="flex items-center space-x-2 p-2 bg-card rounded border border-border">
                      <div className="w-5 h-5 bg-muted rounded-sm"></div>
                      <span>User research analysis</span>
                    </div>
                  </div>
                )}
                
                {currentStep === 1 && (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-2 bg-card rounded border border-border">
                      <span>Team Chat</span>
                      <div className="flex space-x-1">
                        <div className="w-6 h-6 rounded-full bg-muted"></div>
                        <div className="w-6 h-6 rounded-full bg-muted"></div>
                      </div>
                    </div>
                    <div className="p-2 bg-card rounded border border-border">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="w-8 h-8 rounded-full bg-muted"></div>
                        <div className="text-sm">Great work on the new design!</div>
                      </div>
                    </div>
                  </div>
                )}
                
                {currentStep === 2 && (
                  <div className="h-full flex flex-col">
                    <div className="bg-card rounded border border-border p-2 mb-2">
                      Project Progress
                    </div>
                    <div className="flex-1 grid grid-cols-3 gap-2">
                      <div className="bg-green-100 rounded p-2 text-center text-xs">
                        75% Complete
                      </div>
                      <div className="bg-yellow-100 rounded p-2 text-center text-xs">
                        15% In Progress
                      </div>
                      <div className="bg-red-100 rounded p-2 text-center text-xs">
                        10% Blocked
                      </div>
                    </div>
                  </div>
                )}
                
                {currentStep === 3 && (
                  <div className="space-y-2">
                    <div className="flex justify-between p-2 bg-card rounded border border-border">
                      <span>Project Alpha</span>
                      <span className="text-xs bg-green-100 px-2 py-1 rounded">On Track</span>
                    </div>
                    <div className="flex justify-between p-2 bg-card rounded border border-border">
                      <span>Project Beta</span>
                      <span className="text-xs bg-yellow-100 px-2 py-1 rounded">At Risk</span>
                    </div>
                  </div>
                )}
                
                {currentStep === 4 && (
                  <div className="h-full flex items-center justify-center">
                    <div className="w-[120px] h-[180px] bg-card rounded-lg border border-border p-2">
                      <div className="w-full h-4 bg-muted mb-2 rounded"></div>
                      <div className="w-full h-20 bg-muted mb-2 rounded"></div>
                      <div className="w-full h-4 bg-muted rounded"></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <h3 className="text-xl font-semibold mb-2">{currentDemoStep.title}</h3>
          <p className="text-muted-foreground text-center max-w-md mb-6">
            {currentDemoStep.description}
          </p>
        </div>
        
        <DialogFooter className="flex justify-between items-center">
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={prevStep}
            >
              <ArrowLeft className="h-4 w-4 mr-1" /> Previous
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={nextStep}
            >
              Next <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
          
          <Button 
            variant={isPlaying ? "secondary" : "default"} 
            size="sm" 
            onClick={togglePlayDemo}
          >
            <Play className="h-4 w-4 mr-1" /> 
            {isPlaying ? "Pause Demo" : "Auto Play Demo"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DemoModal;