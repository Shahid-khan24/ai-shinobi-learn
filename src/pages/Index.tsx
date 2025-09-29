import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import SubjectGrid from "@/components/SubjectGrid";
import Dashboard from "@/components/Dashboard";
import QuizInterface from "@/components/QuizInterface";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <Hero />
      <SubjectGrid />
      <Dashboard />
      <QuizInterface />
    </div>
  );
};

export default Index;
