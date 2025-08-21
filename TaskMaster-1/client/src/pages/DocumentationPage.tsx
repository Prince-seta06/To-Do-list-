import Sidebar from "../components/Dashboard/Sidebar";
import Header from "../components/Dashboard/Header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const DocumentationPage = () => {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Documentation" />
        
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white shadow-md rounded-lg p-6 mb-6">
              <h2 className="text-2xl font-bold mb-4">TaskFlow Documentation</h2>
              <p className="text-gray-700 mb-6">
                Welcome to the TaskFlow documentation! Here you'll find everything you need to know about using 
                our platform effectively. Choose a category below to get started.
              </p>
              
              <Tabs defaultValue="getting-started">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="getting-started">Getting Started</TabsTrigger>
                  <TabsTrigger value="tasks">Tasks</TabsTrigger>
                  <TabsTrigger value="projects">Projects</TabsTrigger>
                  <TabsTrigger value="collaboration">Collaboration</TabsTrigger>
                </TabsList>
                
                <TabsContent value="getting-started" className="mt-6">
                  <h3 className="text-xl font-semibold mb-3">Getting Started with TaskFlow</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-lg font-medium mb-2">1. Create an Account</h4>
                      <p className="text-gray-700">
                        To begin using TaskFlow, sign up for an account by providing your name, email, and a secure password.
                        Once registered, you'll be able to access all features of the platform.
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="text-lg font-medium mb-2">2. Navigate Your Dashboard</h4>
                      <p className="text-gray-700">
                        Your dashboard is the central hub for all your tasks and projects. Here you can view upcoming 
                        deadlines, track progress, and get quick access to your most important work.
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="text-lg font-medium mb-2">3. Create Your First Task</h4>
                      <p className="text-gray-700">
                        Click the "New Task" button to create your first task. Give it a clear title, set a due date if needed, 
                        and assign it a priority level. You can also add detailed descriptions or attach it to a project.
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="text-lg font-medium mb-2">4. Organize with Projects</h4>
                      <p className="text-gray-700">
                        For related tasks, create a project to keep everything organized. Projects help you group tasks 
                        together and track overall progress on larger initiatives.
                      </p>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="tasks" className="mt-6">
                  <h3 className="text-xl font-semibold mb-3">Working with Tasks</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-lg font-medium mb-2">Creating Tasks</h4>
                      <p className="text-gray-700">
                        Tasks are the basic unit of work in TaskFlow. Each task has a title, status (todo, in progress, completed), 
                        and priority level. You can also add optional details like descriptions, due dates, and assignees.
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="text-lg font-medium mb-2">Managing Task Status</h4>
                      <p className="text-gray-700">
                        As you work on tasks, update their status to reflect your progress. Drag and drop tasks between columns 
                        on the board view, or use the status dropdown to update them directly.
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="text-lg font-medium mb-2">Setting Priorities</h4>
                      <p className="text-gray-700">
                        Use the priority field to indicate which tasks are most important. This helps you and your team 
                        focus on high-impact work first.
                      </p>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="projects" className="mt-6">
                  <h3 className="text-xl font-semibold mb-3">Project Management</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-lg font-medium mb-2">Creating Projects</h4>
                      <p className="text-gray-700">
                        Projects help you organize related tasks together. Each project has a title, description, and tracks 
                        overall progress based on the completion status of its tasks.
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="text-lg font-medium mb-2">Project Dashboard</h4>
                      <p className="text-gray-700">
                        The project dashboard gives you a high-level view of project progress, including task completion rates, 
                        upcoming deadlines, and team members involved.
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="text-lg font-medium mb-2">Managing Project Tasks</h4>
                      <p className="text-gray-700">
                        Within each project, you can create, assign, and track tasks specific to that project. This keeps all 
                        related work organized in one place.
                      </p>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="collaboration" className="mt-6">
                  <h3 className="text-xl font-semibold mb-3">Team Collaboration</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-lg font-medium mb-2">Inviting Team Members</h4>
                      <p className="text-gray-700">
                        Add team members to your projects by clicking the "Invite" button on the project page. Enter their 
                        email address and they'll receive an invitation to join your project.
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="text-lg font-medium mb-2">Assigning Tasks</h4>
                      <p className="text-gray-700">
                        Assign tasks to specific team members to clarify ownership and responsibility. Assignees will see 
                        these tasks on their dashboard and receive notifications about them.
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="text-lg font-medium mb-2">Activity Tracking</h4>
                      <p className="text-gray-700">
                        TaskFlow tracks all project activity, making it easy to see who did what and when. This creates 
                        transparency and helps keep everyone informed about project progress.
                      </p>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
            
            <div className="bg-white shadow-md rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-3">Need More Help?</h3>
              <p className="text-gray-700 mb-4">
                If you can't find what you're looking for in our documentation, we're here to help! Contact our support 
                team for assistance with any questions or issues you may encounter.
              </p>
              <div className="bg-gray-100 p-4 rounded">
                <p className="mb-0"><strong>Email:</strong> support@taskflow.com</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DocumentationPage;