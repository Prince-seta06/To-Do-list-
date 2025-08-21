import Sidebar from "../components/Dashboard/Sidebar";
import Header from "../components/Dashboard/Header";

const AboutPage = () => {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="About Us" />
        
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white shadow-md rounded-lg p-6 mb-6">
              <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
              <p className="text-gray-700 mb-4">
                TaskFlow was created to empower teams and individuals to optimize productivity through intelligent, 
                user-friendly project tracking and collaboration tools. We believe that effective task management 
                should be accessible to everyone, regardless of team size or project complexity.
              </p>
              <p className="text-gray-700 mb-4">
                Our platform combines the best practices in project management with an intuitive interface that makes 
                collaboration seamless and efficient. We're committed to helping you stay organized, meet deadlines, 
                and achieve your goals.
              </p>
            </div>
            
            <div className="bg-white shadow-md rounded-lg p-6 mb-6">
              <h2 className="text-2xl font-bold mb-4">Our Team</h2>
              <p className="text-gray-700 mb-4">
                We're a dedicated team of developers, designers, and productivity enthusiasts who are passionate 
                about creating tools that make work more efficient and enjoyable. Our diverse backgrounds and 
                expertise allow us to approach task management from multiple perspectives, resulting in a platform 
                that's versatile and user-friendly.
              </p>
            </div>
            
            <div className="bg-white shadow-md rounded-lg p-6">
              <h2 className="text-2xl font-bold mb-4">Our Values</h2>
              <p className="text-gray-700 mb-4">
                At TaskFlow, we believe in building products that respect your time and attention. Our platform is designed 
                with simplicity and efficiency in mind, ensuring that you can focus on what matters most - your work and projects.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <h3 className="font-semibold text-lg mb-2">Simplicity</h3>
                  <p className="text-gray-600">We believe in clean, intuitive interfaces that don't get in your way.</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <h3 className="font-semibold text-lg mb-2">Efficiency</h3>
                  <p className="text-gray-600">We're committed to helping you accomplish more in less time.</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <h3 className="font-semibold text-lg mb-2">Collaboration</h3>
                  <p className="text-gray-600">We build tools that bring teams together for better results.</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AboutPage;