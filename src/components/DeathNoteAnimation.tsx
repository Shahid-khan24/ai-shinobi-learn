import { useEffect, useState } from "react";

interface DeathNoteAnimationProps {
  score: number;
  totalQuestions: number;
  username?: string;
}

const DeathNoteAnimation = ({ score, totalQuestions, username }: DeathNoteAnimationProps) => {
  const [showAnimation, setShowAnimation] = useState(true);
  const percentage = Math.round((score / totalQuestions) * 100);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowAnimation(false);
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  if (!showAnimation) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 animate-fade-in">
      <div className="relative max-w-2xl w-full mx-4">
        {/* Death Note Paper Effect */}
        <div className="relative bg-gradient-to-br from-gray-100 to-gray-200 p-12 rounded-lg shadow-2xl border-2 border-gray-300">
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
          <div className="absolute left-12 top-0 bottom-0 w-0.5 bg-red-400 opacity-50" />

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
            
            <div className="death-note-write text-2xl font-bold text-primary" style={{ animationDelay: '2s' }}>
              Result: {percentage}%
            </div>

            <div className="death-note-write text-lg italic opacity-70" style={{ animationDelay: '2.8s' }}>
              Mission Complete...
            </div>
          </div>

          {/* Red glow effect */}
          <div className="absolute -inset-2 bg-primary/10 blur-2xl -z-10 animate-pulse" />
        </div>

        {/* Falling apple animation (Ryuk's apple) */}
        <div className="ryuk-apple">
          🍎
        </div>
      </div>
    </div>
  );
};

export default DeathNoteAnimation;
