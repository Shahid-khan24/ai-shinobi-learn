import { Award, Lock, CheckCircle } from "lucide-react";
import { useState } from "react";

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement_type: string;
  requirement_value: number;
  earned?: boolean;
  earned_at?: string;
  progress?: number;
}

interface AchievementBadgeProps {
  achievement: Achievement;
}

const AchievementBadge = ({ achievement }: AchievementBadgeProps) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const getIconEmoji = (icon: string) => {
    const icons: Record<string, string> = {
      'brain': '🧠',
      'fire': '🔥',
      'trophy': '🏆',
      'star': '⭐',
      'crown': '👑',
      'lightning': '⚡',
      'skull': '💀',
      'book': '📖',
      'target': '🎯',
      'apple': '🍎',
    };
    return icons[icon.toLowerCase()] || '🏅';
  };

  const progressPercentage = achievement.earned 
    ? 100 
    : Math.min(((achievement.progress || 0) / achievement.requirement_value) * 100, 100);

  return (
    <div
      className={`relative card-glow p-4 rounded-xl border transition-all duration-300 ${
        achievement.earned
          ? 'border-primary/50 bg-gradient-to-br from-primary/10 to-accent/10 hover:border-primary hover:shadow-lg hover:shadow-primary/20'
          : 'border-border/30 bg-muted/5 grayscale hover:grayscale-0'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Paper texture effect */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        {[...Array(5)].map((_, i) => (
          <div 
            key={i} 
            className="absolute left-0 right-0 border-b border-current"
            style={{ top: `${(i + 1) * 20}%` }}
          />
        ))}
      </div>

      <div className="relative z-10 space-y-3">
        {/* Icon and Status */}
        <div className="flex items-start justify-between">
          <div className={`text-4xl transform transition-transform duration-300 ${
            isHovered ? 'scale-110 rotate-6' : 'scale-100'
          }`}>
            {achievement.earned ? getIconEmoji(achievement.icon) : '🔒'}
          </div>
          
          {achievement.earned && (
            <CheckCircle className="w-5 h-5 text-primary animate-scale-in" />
          )}
        </div>

        {/* Title and Description */}
        <div className="space-y-1">
          <h4 className={`font-bold ${achievement.earned ? 'text-foreground' : 'text-muted-foreground'}`}>
            {achievement.name}
          </h4>
          <p className="text-xs text-muted-foreground line-clamp-2">
            {achievement.description}
          </p>
        </div>

        {/* Progress Bar */}
        {!achievement.earned && (
          <div className="space-y-1">
            <div className="w-full bg-muted/20 rounded-full h-1.5 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-primary to-accent h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {achievement.progress || 0} / {achievement.requirement_value}
            </p>
          </div>
        )}

        {/* Earned Date */}
        {achievement.earned && achievement.earned_at && (
          <p className="text-xs text-muted-foreground italic">
            Earned {new Date(achievement.earned_at).toLocaleDateString()}
          </p>
        )}
      </div>

      {/* Glow effect for earned achievements */}
      {achievement.earned && (
        <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-accent/20 blur-xl -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      )}
    </div>
  );
};

export default AchievementBadge;
