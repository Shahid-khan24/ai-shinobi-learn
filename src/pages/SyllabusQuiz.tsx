import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";
import { Brain, Loader2, CheckSquare } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

interface Topic {
  name: string;
  subtopics: string[];
}

const difficulties = [
  { value: 'beginner', label: 'Beginner', description: 'Get started with the basics' },
  { value: 'intermediate', label: 'Intermediate', description: 'Test your knowledge' },
  { value: 'advanced', label: 'Advanced', description: 'Challenge yourself' }
];

const SyllabusQuiz = () => {
  const { syllabusId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [syllabus, setSyllabus] = useState<any>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchSyllabus();
  }, [syllabusId]);

  const fetchSyllabus = async () => {
    if (!syllabusId || !user) return;

    try {
      const { data, error } = await supabase
        .from('syllabus')
        .select('*')
        .eq('id', syllabusId)
        .single();

      if (error) throw error;

      setSyllabus(data);
      // Properly parse topics from JSONB
      const parsedTopics: Topic[] = [];
      if (Array.isArray(data.topics)) {
        data.topics.forEach((item: any) => {
          if (item && typeof item === 'object' && 'name' in item && 'subtopics' in item) {
            parsedTopics.push({
              name: String(item.name),
              subtopics: Array.isArray(item.subtopics) ? item.subtopics.map(String) : []
            });
          }
        });
      }
      setTopics(parsedTopics);
    } catch (error) {
      console.error('Error fetching syllabus:', error);
      toast({
        title: "Error",
        description: "Failed to load syllabus",
        variant: "destructive"
      });
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const toggleTopic = (topicName: string) => {
    setSelectedTopics(prev =>
      prev.includes(topicName)
        ? prev.filter(t => t !== topicName)
        : [...prev, topicName]
    );
  };

  const handleGenerateQuiz = async () => {
    if (!selectedDifficulty || selectedTopics.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please select topics and difficulty",
        variant: "destructive"
      });
      return;
    }

    setGenerating(true);

    try {
      // Get the relevant content for selected topics
      const relevantTopics = topics
        .filter(t => selectedTopics.includes(t.name))
        .map(t => `${t.name}: ${t.subtopics.join(', ')}`)
        .join('\n');

      const context = `${syllabus.extracted_content}\n\nFocus on these topics:\n${relevantTopics}`;

      const { data, error } = await supabase.functions.invoke('generate-syllabus-quiz', {
        body: {
          syllabusId: syllabusId,
          topics: selectedTopics,
          difficulty: selectedDifficulty,
          context: context
        }
      });

      if (error) throw error;

      toast({
        title: "Quiz Generated!",
        description: "Your personalized quiz is ready",
      });

      navigate(`/quiz/${data.quiz.id}`);
    } catch (error: any) {
      console.error('Error generating quiz:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate quiz",
        variant: "destructive"
      });
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted/20 border border-primary/20 backdrop-blur-sm mb-4">
              <Brain className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">Syllabus-Based Quiz</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Generate Quiz from <span className="text-gradient">{syllabus?.title}</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Select topics and difficulty level for your personalized quiz
            </p>
          </div>

          {/* Topic Selection */}
          {topics.length > 0 && (
            <div className="mb-8 p-6 rounded-xl bg-muted/10 border-2 border-primary/20">
              <div className="flex items-center gap-2 mb-4">
                <CheckSquare className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold">Select Topics</h2>
              </div>
              <div className="space-y-3">
                {topics.map((topic, index) => (
                  <div key={index} className="p-4 rounded-lg bg-background/50 border">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        id={`topic-${index}`}
                        checked={selectedTopics.includes(topic.name)}
                        onCheckedChange={() => toggleTopic(topic.name)}
                      />
                      <div className="flex-1">
                        <label
                          htmlFor={`topic-${index}`}
                          className="font-medium cursor-pointer"
                        >
                          {topic.name}
                        </label>
                        {topic.subtopics && topic.subtopics.length > 0 && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {topic.subtopics.join(' • ')}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Difficulty Selection */}
          <div className="space-y-4 mb-8">
            <h2 className="text-lg font-semibold">Select Difficulty</h2>
            {difficulties.map((difficulty, index) => (
              <button
                key={difficulty.value}
                onClick={() => setSelectedDifficulty(difficulty.value)}
                className={`w-full p-6 rounded-xl text-left transition-all animate-fade-in ${
                  selectedDifficulty === difficulty.value
                    ? 'bg-primary/20 border-2 border-primary scale-105'
                    : 'bg-muted/10 border-2 border-transparent hover:border-primary/50 hover:scale-102'
                }`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <h3 className="text-xl font-semibold mb-2">{difficulty.label}</h3>
                <p className="text-muted-foreground">{difficulty.description}</p>
              </button>
            ))}
          </div>

          <Button
            variant="hero"
            size="lg"
            className="w-full"
            onClick={handleGenerateQuiz}
            disabled={selectedTopics.length === 0 || !selectedDifficulty || generating}
          >
            {generating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generating Quiz...
              </>
            ) : (
              <>
                <Brain className="w-5 h-5" />
                Generate Quiz
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SyllabusQuiz;