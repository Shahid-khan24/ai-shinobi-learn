import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { ArrowRight } from "lucide-react";
import * as Icons from "lucide-react";
import SubtopicSelection from "./SubtopicSelection";
import LoadingSharingan from "./LoadingSharingan";

interface Subject {
  id: string;
  name: string;
  icon: string;
  description: string | null;
}

const SubjectGrid = () => {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const { data, error } = await supabase
          .from('quiz_topics')
          .select('*');

        if (error) throw error;
        const SUBJECT_NAMES = [
          'Islam', 'Tamil', 'English', 'Computer Science', 'Mathematics',
          'Science', 'Technology', 'History', 'Literature', 'Geography'
        ];
        // Filter out syllabus topics and only show main subjects
        const filtered = (data || []).filter((s) => 
          SUBJECT_NAMES.includes(s.name) && !s.name.startsWith('Syllabus:')
        );
        setSubjects(filtered);
      } catch (error) {
        console.error('Error fetching subjects:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubjects();
  }, []);

  const handleSubjectClick = (topicName: string) => {
    setSelectedSubject(topicName);
  };

  if (loading) {
    return (
      <section id="subjects" className="py-20 relative">
        <div className="container mx-auto px-4 flex flex-col items-center gap-4">
          <LoadingSharingan size={72} />
          <p className="text-muted-foreground">Loading subjects...</p>
        </div>
      </section>
    );
  }

  return (
    <section id="subjects" className="py-20 relative">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Choose Your <span className="text-gradient">Learning Path</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Master any subject with AI-powered quizzes designed to adapt to your learning style
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {subjects.map((subject, index) => {
            const iconName = subject.icon as keyof typeof Icons;
            const IconComponent: any = Icons[iconName] || Icons.BookOpen;
            
            return (
              <div 
                key={subject.id} 
                className="subject-card group animate-ninja-appear"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-primary to-accent flex items-center justify-center">
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>
                </div>

                <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                  {subject.name}
                </h3>
                <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
                  {subject.description || 'Start your learning journey'}
                </p>

                <Button 
                  variant="ninja" 
                  size="sm" 
                  className="w-full group-hover:bg-primary/20 transition-colors"
                  onClick={() => handleSubjectClick(subject.name)}
                >
                  Start Learning
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            );
          })}
        </div>
      </div>

      <SubtopicSelection 
        subject={selectedSubject || ""}
        isOpen={!!selectedSubject}
        onClose={() => setSelectedSubject(null)}
      />
    </section>
  );
};

export default SubjectGrid;