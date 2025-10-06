import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { FileText, Trash2, BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import LoadingSharingan from "./LoadingSharingan";

interface Syllabus {
  id: string;
  title: string;
  file_name: string;
  created_at: string;
}

const SyllabusSection = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [syllabusList, setSyllabusList] = useState<Syllabus[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchSyllabusList();
    }
  }, [user]);

  const fetchSyllabusList = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('syllabus')
        .select('id, title, file_name, created_at')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSyllabusList(data || []);
    } catch (error) {
      console.error('Error fetching syllabus:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSyllabus = async (id: string, fileName: string) => {
    try {
      const { error: dbError } = await supabase
        .from('syllabus')
        .delete()
        .eq('id', id);

      if (dbError) throw dbError;

      const filePathMatch = fileName.match(/^(.+)\/[^/]+$/);
      if (filePathMatch) {
        await supabase.storage
          .from('syllabus-files')
          .remove([fileName]);
      }

      toast({
        title: "Deleted",
        description: "Syllabus deleted successfully",
      });

      fetchSyllabusList();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete syllabus",
        variant: "destructive"
      });
    }
  };

  if (!user) return null;

  if (loading) {
    return (
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center gap-4">
            <LoadingSharingan size={48} />
            <p className="text-muted-foreground">Loading your syllabus quizzes...</p>
          </div>
        </div>
      </section>
    );
  }

  if (syllabusList.length === 0) return null;

  return (
    <section className="py-12 border-t border-border/40">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Your <span className="text-gradient">Syllabus Quizzes</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            AI-generated quizzes based on your uploaded course materials
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {syllabusList.map((syllabus, index) => (
            <Card 
              key={syllabus.id}
              className="card-glow group animate-ninja-appear hover-scale"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-primary to-accent flex items-center justify-center mb-2">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => handleDeleteSyllabus(syllabus.id, syllabus.file_name)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <CardTitle className="text-lg group-hover:text-primary transition-colors">
                  {syllabus.title}
                </CardTitle>
                <CardDescription className="text-sm">
                  Uploaded {new Date(syllabus.created_at).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  variant="ninja"
                  className="w-full"
                  onClick={() => navigate(`/syllabus-quiz/${syllabus.id}`)}
                >
                  <BookOpen className="w-4 h-4" />
                  Start Quiz
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SyllabusSection;
