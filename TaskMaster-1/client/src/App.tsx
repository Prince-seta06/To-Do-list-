import { Switch, Route } from "wouter";
import HomePage from "./pages/HomePage";
import FeaturesPage from "./pages/FeaturesPage";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import DashboardPage from "./pages/DashboardPage";
import ProjectDetailsPage from "./pages/ProjectDetailsPage";
import AboutPage from "./pages/AboutPage";
import BuyMeCoffeePage from "./pages/BuyMeCoffeePage";
import DocumentationPage from "./pages/DocumentationPage";
import NotFound from "./pages/not-found";
import { useEffect } from "react";
import { useAuth } from "./hooks/useAuth";
import { ConfettiProvider, useConfetti } from "./contexts/ConfettiContext";
import TaskCompletionConfetti from "./components/TaskCompletionConfetti";

// Wrapper component for Confetti
const ConfettiWrapper = () => {
  const { isConfettiActive, settings, hideConfetti } = useConfetti();
  
  return (
    <TaskCompletionConfetti
      show={isConfettiActive}
      duration={settings.duration}
      colors={settings.colors}
      numberOfPieces={settings.numberOfPieces}
      recycle={settings.recycle}
      shape={settings.shape}
      onComplete={hideConfetti}
    />
  );
};

function AppContent() {
  const { checkAuthStatus } = useAuth();

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  return (
    <>
      <ConfettiWrapper />
      <Switch>
        <Route path="/" component={HomePage} />
        <Route path="/features" component={FeaturesPage} />
        <Route path="/login" component={LoginPage} />
        <Route path="/signup" component={SignUpPage} />
        <Route path="/dashboard" component={DashboardPage} />
        <Route path="/project/:id" component={ProjectDetailsPage} />
        <Route path="/about" component={AboutPage} />
        <Route path="/buy-me-coffee" component={BuyMeCoffeePage} />
        <Route path="/docs" component={DocumentationPage} />
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

function App() {
  return (
    <ConfettiProvider>
      <AppContent />
    </ConfettiProvider>
  );
}

export default App;
