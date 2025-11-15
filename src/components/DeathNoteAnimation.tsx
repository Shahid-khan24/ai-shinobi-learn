import { useEffect, useState } from "react";

interface DeathNoteAnimationProps {
  score: number;
  totalQuestions: number;
  username?: string;
}

const DeathNoteAnimation = ({ score, totalQuestions, username }: DeathNoteAnimationProps) => {
  const [showAnimation, setShowAnimation] = useState(true);
  const percentage = Math.round((score / totalQuestions) * 100);
  
  // Determine animation intensity based on score
  const isPerfect = percentage === 100;
  const isHigh = percentage >= 80 && percentage < 100;
  const isMedium = percentage >= 60 && percentage < 80;
  const isLow = percentage < 60;
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowAnimation(false);
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  if (!showAnimation) return null;

  // Different styles based on score
  const getBackgroundStyle = () => {
    if (isPerfect) return "bg-black/98"; // Most dramatic
    if (isHigh) return "bg-black/95";
    if (isMedium) return "bg-black/90";
    return "bg-black/85"; // More subtle
  };

  const getPaperGradient = () => {
    if (isPerfect) return "from-red-50 to-red-100"; // Red tint for perfect
    if (isHigh) return "from-gray-100 to-gray-200";
    if (isMedium) return "from-gray-200 to-gray-300";
    return "from-gray-300 to-gray-400"; // Darker for low scores
  };

  const getBorderColor = () => {
    if (isPerfect) return "border-red-400";
    if (isHigh) return "border-gray-300";
    if (isMedium) return "border-gray-400";
    return "border-gray-500";
  };

  const getGlowEffect = () => {
    if (isPerfect) return "absolute -inset-4 bg-primary/30 blur-3xl -z-10 animate-pulse";
    if (isHigh) return "absolute -inset-2 bg-primary/15 blur-2xl -z-10 animate-pulse";
    if (isMedium) return "absolute -inset-2 bg-primary/8 blur-xl -z-10";
    return "absolute -inset-2 bg-muted/20 blur-xl -z-10"; // No red glow for low scores
  };

  const getMessage = () => {
    if (isPerfect) return "Perfect Execution...";
    if (isHigh) return "Mission Complete...";
    if (isMedium) return "Task Finished...";
    return "Better luck next time...";
  };

  const getResultColor = () => {
    if (isPerfect) return "text-red-600 font-extrabold";
    if (isHigh) return "text-primary font-bold";
    if (isMedium) return "text-muted-foreground font-semibold";
    return "text-muted-foreground";
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center ${getBackgroundStyle()} animate-fade-in`}>
      <div className="relative max-w-2xl w-full mx-4">
        {/* Investigation Report Paper Effect */}
        <div className={`relative bg-gradient-to-br ${getPaperGradient()} p-12 rounded-lg shadow-2xl border-2 ${getBorderColor()}`}>
          {/* Horizontal lines like notebook paper */}
          <div className="absolute inset-0 pointer-events-none opacity-20">
            {[...Array(12)].map((_, i) => (
              <div 
                key={i} 
                className="absolute left-0 right-0 border-b border-blue-300"
                style={{ top: `${(i + 1) * 8.33}%` }}
              />
            ))}
          </div>

          {/* Red margin line */}
          <div className={`absolute left-12 top-0 bottom-0 w-0.5 ${isPerfect ? 'bg-red-500 opacity-80' : 'bg-red-400 opacity-50'}`} />

          {/* Handwritten text effect */}
          <div className="relative z-10 space-y-4 text-gray-900 font-serif">
            <div className="death-note-write text-3xl font-bold mb-8" style={{ animationDelay: '0s' }}>
              Quiz Completed
            </div>
            
            <div className="death-note-write text-xl" style={{ animationDelay: '0.8s' }}>
              Name: {username || "Shinobi"}
            </div>
            
            <div className="death-note-write text-xl" style={{ animationDelay: '1.4s' }}>
              Score: {score}/{totalQuestions}
            </div>
            
            <div className={`death-note-write text-2xl ${getResultColor()}`} style={{ animationDelay: '2s' }}>
              Result: {percentage}%
            </div>

            <div className="death-note-write text-lg italic opacity-70" style={{ animationDelay: '2.8s' }}>
              {getMessage()}
            </div>
          </div>

          {/* Dynamic glow effect based on score */}
          <div className={getGlowEffect()} />
        </div>

        {/* Falling apple animation - multiple for perfect score */}
        {isPerfect && (
          <>
            <div className="ryuk-apple" style={{ left: '20%', animationDelay: '0s' }}>🍎</div>
            <div className="ryuk-apple" style={{ left: '50%', animationDelay: '0.3s' }}>🍎</div>
            <div className="ryuk-apple" style={{ left: '80%', animationDelay: '0.6s' }}>🍎</div>
          </>
        )}
        {isHigh && (
          <div className="ryuk-apple">🍎</div>
        )}
        {isMedium && (
          <div className="ryuk-apple" style={{ opacity: 0.6 }}>🍎</div>
        )}
      </div>
    </div>
  );
};

export default DeathNoteAnimation;
