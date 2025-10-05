import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { 
  CheckCircle, 
  XCircle, 
  Lightbulb, 
  Timer, 
  Brain,
  ArrowRight,
  RotateCcw,
  Loader2,
  Home
} from "lucide-react";
import ShareScore from "@/components/ShareScore";

interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

const Quiz = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [quiz, setQuiz] = useState<any>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);

  useEffect(() => {
    if (!quizId) return;
    
    const fetchQuiz = async () => {
      try {
        const { data, error } = await supabase
          .from('quizzes')
          .select('*, quiz_topics(name, icon)')
          .eq('id', quizId)
          .single();

        if (error) throw error;
        
        setQuiz(data);
        setQuestions(data.questions as any as Question[]);
      } catch (error) {
        console.error('Error fetching quiz:', error);
        toast({
          title: "Error",
          description: "Failed to load quiz",
          variant: "destructive"
        });
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [quizId, navigate, toast]);

  const handleAnswerSelect = (index: number) => {
    if (!showExplanation) {
      setSelectedAnswer(index);
    }
  };

  const handleSubmit = () => {
    if (selectedAnswer === null) return;
    
    setShowExplanation(true);
    const newAnswers = [...userAnswers, selectedAnswer];
    setUserAnswers(newAnswers);
    
    if (selectedAnswer === questions[currentQuestionIndex].correctAnswer) {
      setScore(score + 1);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      // Quiz completed
      saveQuizAttempt();
    }
  };

  const saveQuizAttempt = async () => {
    if (!user || !quiz) return;

    try {
      const { error } = await supabase
        .from('quiz_attempts')
        .insert({
          user_id: user.id,
          quiz_id: quiz.id,
          score: score,
          total_questions: questions.length,
          answers: userAnswers
        });

      if (error) throw error;

      setQuizCompleted(true);

      toast({
        title: "Quiz Completed!",
        description: `You scored ${score} out of ${questions.length}!`,
      });
    } catch (error) {
      console.error('Error saving quiz attempt:', error);
      toast({
        title: "Error",
        description: "Failed to save your progress",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!quiz || questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-muted-foreground">Quiz not found</p>
          <Button onClick={() => navigate('/')} className="mt-4">Go Home</Button>
        </div>
      </div>
    );
  }

  // Show completion screen
  if (quizCompleted) {
    const percentage = Math.round((score / questions.length) * 100);
    return (
      <div className="min-h-screen bg-background py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="card-glow p-12 rounded-xl animate-ninja-appear chakra-glow">
              <Brain className="w-20 h-20 text-primary mx-auto mb-6 rasengan-effect" />
              <h2 className="text-4xl font-bold mb-4">
                Quiz <span className="text-gradient">Completed!</span>
              </h2>
              <div className="text-6xl font-bold text-gradient my-8">
                {score}/{questions.length}
              </div>
              <p className="text-2xl text-muted-foreground mb-8">
                You scored {percentage}%
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <ShareScore 
                  score={score}
                  totalQuestions={questions.length}
                  subject={quiz.quiz_topics?.name || "Quiz"}
                />
                <Button 
                  variant="hero" 
                  size="lg"
                  onClick={() => navigate('/')}
                >
                  <Home className="w-5 h-5" />
                  Go Home
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progressPercentage = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-background py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Quiz Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted/20 border border-primary/20 backdrop-blur-sm mb-4">
              <Brain className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">
                {quiz.quiz_topics?.name} • {quiz.difficulty}
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-2">
              AI-Powered <span className="text-gradient">Quiz</span>
            </h2>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">
                Question {currentQuestionIndex + 1} of {questions.length}
              </span>
              <span className="text-sm text-muted-foreground">
                Score: {score}/{questions.length}
              </span>
            </div>
            <div className="w-full bg-muted/20 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-primary to-accent h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>

          {/* Question Card */}
          <div className="card-glow p-8 rounded-xl mb-8">
            <h3 className="text-xl md:text-2xl font-semibold mb-6 leading-relaxed">
              {currentQuestion.question}
            </h3>

            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => {
                let buttonClass = "ninja";
                let icon = null;

                if (showExplanation) {
                  if (index === currentQuestion.correctAnswer) {
                    buttonClass = "default";
                    icon = <CheckCircle className="w-5 h-5 text-green-500" />;
                  } else if (index === selectedAnswer && index !== currentQuestion.correctAnswer) {
                    buttonClass = "destructive";
                    icon = <XCircle className="w-5 h-5 text-red-500" />;
                  }
                } else if (selectedAnswer === index) {
                  buttonClass = "default";
                }

                return (
                  <Button
                    key={index}
                    variant={buttonClass as any}
                    className="w-full justify-start text-left p-6 h-auto animate-kunai-throw hover-scale-102"
                    style={{ animationDelay: `${index * 50}ms` }}
                    onClick={() => handleAnswerSelect(index)}
                    disabled={showExplanation}
                  >
                    <div className="flex items-center gap-3 w-full">
                      <span className="w-6 h-6 rounded-full border-2 border-current flex items-center justify-center text-xs font-bold">
                        {String.fromCharCode(65 + index)}
                      </span>
                      <span className="flex-1">{option}</span>
                      {icon}
                    </div>
                  </Button>
                );
              })}
            </div>
          </div>

          {/* AI Explanation */}
          {showExplanation && (
            <div className="card-glow p-6 rounded-xl mb-8 border-l-4 border-primary animate-ninja-appear chakra-glow">
              <div className="flex items-start gap-3">
                <Lightbulb className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold mb-2 text-primary">AI Explanation</h4>
                  <p className="text-muted-foreground leading-relaxed">
                    {currentQuestion.explanation}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {!showExplanation ? (
              <Button 
                variant="hero" 
                size="lg"
                onClick={handleSubmit}
                disabled={selectedAnswer === null}
              >
                Submit Answer
              </Button>
            ) : (
              <Button variant="hero" size="lg" onClick={handleNext}>
                {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
                <ArrowRight className="w-5 h-5" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Quiz;