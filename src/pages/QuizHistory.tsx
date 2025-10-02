import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Calendar, Target, TrendingUp, Eye } from "lucide-react";
import { format } from "date-fns";

interface QuizAttempt {
  id: string;
  quiz_id: string;
  score: number;
  total_questions: number;
  completed_at: string;
  quizzes: {
    difficulty: string;
    topic_id: string;
    quiz_topics: {
      name: string;
      icon: string;
    };
  };
}

const QuizHistory = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    const fetchHistory = async () => {
      try {
        const { data, error } = await supabase
          .from('quiz_attempts')
          .select(`
            id,
            quiz_id,
            score,
            total_questions,
            completed_at,
            quizzes (
              difficulty,
              topic_id,
              quiz_topics (
                name,
                icon
              )
            )
          `)
          .eq('user_id', user.id)
          .order('completed_at', { ascending: false })
          .limit(50);

        if (error) throw error;
        setAttempts(data || []);
      } catch (error) {
        console.error('Error fetching quiz history:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();

    // Subscribe to real-time updates for this user's quiz attempts
    const channel = supabase
      .channel('quiz-attempts-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'quiz_attempts',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          fetchHistory();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, navigate]);

  const getScoreColor = (score: number, total: number) => {
    const percentage = (score / total) * 100;
    if (percentage >= 80) return "default";
    if (percentage >= 60) return "secondary";
    return "destructive";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-20 flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Your Quiz <span className="text-gradient">History</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Track your learning progress and achievements
            </p>
          </div>

          {attempts.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Target className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-xl text-muted-foreground mb-4">
                  No quiz attempts yet
                </p>
                <Button variant="hero" onClick={() => navigate('/')}>
                  Start Your First Quiz
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {attempts.map((attempt) => {
                const percentage = Math.round((attempt.score / attempt.total_questions) * 100);
                return (
                  <Card key={attempt.id} className="hover:border-primary/50 transition-colors">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="flex items-center gap-2">
                            {attempt.quizzes.quiz_topics.name}
                            <Badge variant={getScoreColor(attempt.score, attempt.total_questions)}>
                              {attempt.score}/{attempt.total_questions}
                            </Badge>
                          </CardTitle>
                          <CardDescription className="flex items-center gap-4 mt-2">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {format(new Date(attempt.completed_at), 'MMM dd, yyyy')}
                            </span>
                            <span className="capitalize">
                              {attempt.quizzes.difficulty}
                            </span>
                          </CardDescription>
                        </div>
                        <div className="text-right">
                          <div className="text-3xl font-bold text-primary">{percentage}%</div>
                          <div className="text-sm text-muted-foreground">Score</div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <TrendingUp className="w-4 h-4" />
                          {percentage >= 80 ? "Excellent!" : percentage >= 60 ? "Good job!" : "Keep practicing!"}
                        </div>
                        <Button
                          variant="ninja"
                          size="sm"
                          onClick={() => navigate(`/quiz/${attempt.quiz_id}`)}
                        >
                          <Eye className="w-4 h-4" />
                          View Quiz
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizHistory;
