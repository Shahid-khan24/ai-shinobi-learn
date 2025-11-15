import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Brain, Clock, Target, TrendingUp } from "lucide-react";

interface LComparisonCardProps {
  userStats: {
    accuracy: number;
    averageTime: number;
    totalQuizzes: number;
    streak: number;
  };
}

const LComparisonCard = ({ userStats }: LComparisonCardProps) => {
  // L's theoretical perfect stats
  const lStats = {
    accuracy: 100,
    averageTime: 30, // 30 seconds per question
    deductionSpeed: 100,
    analyticalPower: 100,
  };

  // Calculate user's comparison to L
  const accuracyMatch = Math.min((userStats.accuracy / lStats.accuracy) * 100, 100);
  const speedMatch = Math.min((30 / (userStats.averageTime || 60)) * 100, 100);
  const consistencyMatch = Math.min((userStats.streak / 30) * 100, 100); // 30 day streak = 100%
  const overallMatch = (accuracyMatch + speedMatch + consistencyMatch) / 3;

  const getMatchLevel = (score: number) => {
    if (score >= 90) return { level: "World's Greatest Detective", color: "text-primary" };
    if (score >= 75) return { level: "Elite Detective", color: "text-blue-400" };
    if (score >= 60) return { level: "Skilled Investigator", color: "text-cyan-400" };
    if (score >= 45) return { level: "Apprentice Detective", color: "text-slate-400" };
    return { level: "Rookie Detective", color: "text-muted-foreground" };
  };

  const matchLevel = getMatchLevel(overallMatch);

  return (
    <Card className="p-6 bg-gradient-to-br from-card/50 to-card border-primary/20 backdrop-blur-sm">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold text-foreground">L's Analysis</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Deductive Ability Comparison
            </p>
          </div>
          <div className="text-6xl opacity-10">
            <span 
              style={{ 
                fontFamily: 'Times New Roman, serif',
                fontStyle: 'italic',
                fontWeight: '900',
                letterSpacing: '-4px'
              }}
            >
              L
            </span>
          </div>
        </div>

        {/* Overall Match */}
        <div className="relative p-6 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/30">
          <div className="text-center">
            <div className="text-5xl font-bold text-primary mb-2 animate-scale-in">
              {overallMatch.toFixed(1)}%
            </div>
            <div className={`text-lg font-semibold ${matchLevel.color} mb-1`}>
              {matchLevel.level}
            </div>
            <p className="text-xs text-muted-foreground">
              Match to L's Abilities
            </p>
          </div>
        </div>

        {/* Detailed Stats */}
        <div className="space-y-4">
          {/* Accuracy */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Deductive Accuracy</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {accuracyMatch.toFixed(1)}%
              </span>
            </div>
            <Progress value={accuracyMatch} className="h-2" />
            <p className="text-xs text-muted-foreground">
              You: {userStats.accuracy}% | L: {lStats.accuracy}%
            </p>
          </div>

          {/* Speed */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Analytical Speed</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {speedMatch.toFixed(1)}%
              </span>
            </div>
            <Progress value={speedMatch} className="h-2" />
            <p className="text-xs text-muted-foreground">
              Avg: {userStats.averageTime}s | L's Standard: {lStats.averageTime}s
            </p>
          </div>

          {/* Consistency */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Consistency</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {consistencyMatch.toFixed(1)}%
              </span>
            </div>
            <Progress value={consistencyMatch} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {userStats.streak} day streak | Target: 30 days
            </p>
          </div>
        </div>

        {/* L's Quote */}
        <div className="pt-4 border-t border-border/50">
          <div className="text-sm italic text-muted-foreground">
            "{overallMatch >= 75 
              ? "Impressive deductive reasoning. You're approaching my level." 
              : overallMatch >= 50
              ? "You show potential. Continue sharpening your analytical skills."
              : "Keep practicing. Even I started somewhere."}"
          </div>
          <div className="text-xs text-muted-foreground mt-1 text-right">— L</div>
        </div>
      </div>
    </Card>
  );
};

export default LComparisonCard;
