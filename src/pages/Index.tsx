import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import SubjectGrid from "@/components/SubjectGrid";
import Dashboard from "@/components/Dashboard";
import SyllabusUpload from "@/components/SyllabusUpload";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <Hero />
      <div className="container mx-auto px-4 py-12">
        <SyllabusUpload />
      </div>
      <SubjectGrid />
      <Dashboard />
    </div>
  );
};

export default Index;
