import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import SubjectGrid from "@/components/SubjectGrid";
import Dashboard from "@/components/Dashboard";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <Hero />
      <SubjectGrid />
      <Dashboard />
    </div>
  );
};

export default Index;
