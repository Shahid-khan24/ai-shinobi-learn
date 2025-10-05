import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";
import { Brain, Loader2, PenLine } from "lucide-react";

const difficulties = [
  { value: 'beginner', label: 'Beginner', description: 'Get started with the basics' },
  { value: 'intermediate', label: 'Intermediate', description: 'Test your knowledge' },
  { value: 'advanced', label: 'Advanced', description: 'Challenge yourself' }
];

const QuizSelection = () => {
  const { topic } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [customTopic, setCustomTopic] = useState('');
  const [loading, setLoading] = useState(false);

  const handleStartQuiz = async () => {
    const finalTopic = customTopic.trim() || topic;
    
    if (!selectedDifficulty || !finalTopic) {
      toast({
        title: "Missing Information",
        description: "Please select a difficulty and topic",
        variant: "destructive"
      });
      return;
    }

    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to start a quiz",
        variant: "destructive"
      });
      navigate('/auth');
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('generate-quiz', {
        body: { 
          topic: finalTopic,
          difficulty: selectedDifficulty 
        }
      });

      if (error) {
        console.error('Error generating quiz:', error);
        throw error;
      }

      toast({
        title: "Quiz Generated!",
        description: "Your personalized quiz is ready",
      });

      navigate(`/quiz/${data.quiz.id}`);
    } catch (error: any) {
      console.error('Error starting quiz:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate quiz. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted/20 border border-primary/20 backdrop-blur-sm mb-4">
              <Brain className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground capitalize">{topic}</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Customize Your <span className="text-gradient">Quiz</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Specify your topic and select a difficulty level
            </p>
          </div>

          {/* Custom Topic Input */}
          <div className="mb-8 p-6 rounded-xl bg-muted/10 border-2 border-primary/20">
            <Label htmlFor="customTopic" className="flex items-center gap-2 text-lg font-semibold mb-3">
              <PenLine className="w-5 h-5 text-primary" />
              Specific Topic (Optional)
            </Label>
            <Input
              id="customTopic"
              type="text"
              placeholder={`e.g., "Islamic Prophets", "Tamil Grammar", "Shakespeare's plays"...`}
              value={customTopic}
              onChange={(e) => setCustomTopic(e.target.value)}
              className="text-base"
            />
            <p className="text-sm text-muted-foreground mt-2">
              Leave blank to use the general subject "{topic}", or specify a more focused topic
            </p>
          </div>

          <div className="space-y-4 mb-8">
            {difficulties.map((difficulty, index) => (
              <button
                key={difficulty.value}
                onClick={() => setSelectedDifficulty(difficulty.value)}
                className={`w-full p-6 rounded-xl text-left transition-all animate-ninja-appear hover-scale ${
                  selectedDifficulty === difficulty.value
                    ? 'bg-primary/20 border-2 border-primary scale-105 chakra-glow'
                    : 'bg-muted/10 border-2 border-transparent hover:border-primary/50'
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
            onClick={handleStartQuiz}
            disabled={!selectedDifficulty || loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generating Quiz...
              </>
            ) : (
              <>
                <Brain className="w-5 h-5" />
                Start Quiz
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default QuizSelection;