import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  CheckCircle, 
  XCircle, 
  Lightbulb, 
  Timer, 
  Brain,
  ArrowRight,
  RotateCcw
} from "lucide-react";

const QuizInterface = () => {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [currentQuestion] = useState(1);
  const totalQuestions = 10;

  const question = {
    text: "What is the time complexity of searching for an element in a balanced binary search tree?",
    options: [
      "O(1) - Constant time",
      "O(log n) - Logarithmic time", 
      "O(n) - Linear time",
      "O(n²) - Quadratic time"
    ],
    correctAnswer: 1,
    difficulty: "Medium",
    subject: "Computer Science",
    explanation: "In a balanced binary search tree, the height is O(log n), and searching requires traversing from root to leaf, which takes at most O(log n) comparisons. This is because we eliminate half of the remaining nodes at each level."
  };

  const handleAnswerSelect = (index: number) => {
    setSelectedAnswer(index);
  };

  const handleSubmit = () => {
    setShowExplanation(true);
  };

  const progressPercentage = (currentQuestion / totalQuestions) * 100;

  return (
    <section id="quiz" className="py-20 relative min-h-screen flex items-center">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Quiz Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted/20 border border-primary/20 backdrop-blur-sm mb-4">
              <Brain className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">{question.subject} • {question.difficulty}</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-2">
              AI-Powered <span className="text-gradient">Quiz</span>
            </h2>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">
                Question {currentQuestion} of {totalQuestions}
              </span>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Timer className="w-4 h-4" />
                <span>2:45</span>
              </div>
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
              {question.text}
            </h3>

            <div className="space-y-3">
              {question.options.map((option, index) => {
                let buttonClass = "ninja";
                let icon = null;

                if (showExplanation) {
                  if (index === question.correctAnswer) {
                    buttonClass = "default";
                    icon = <CheckCircle className="w-5 h-5 text-green-500" />;
                  } else if (index === selectedAnswer && index !== question.correctAnswer) {
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
                    className="w-full justify-start text-left p-6 h-auto"
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
            <div className="card-glow p-6 rounded-xl mb-8 border-l-4 border-primary">
              <div className="flex items-start gap-3">
                <Lightbulb className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold mb-2 text-primary">AI Explanation</h4>
                  <p className="text-muted-foreground leading-relaxed">
                    {question.explanation}
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
              <>
                <Button variant="ninja" size="lg">
                  <RotateCcw className="w-5 h-5" />
                  Try Again
                </Button>
                <Button variant="hero" size="lg">
                  Next Question
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default QuizInterface;