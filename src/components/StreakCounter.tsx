import { useEffect, useState } from "react";
import { Flame, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const StreakCounter = () => {
  const { user } = useAuth();
  const [streak, setStreak] = useState(0);
  const [lastQuizDate, setLastQuizDate] = useState<Date | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchStreak = async () => {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('current_streak')
        .eq('user_id', user.id)
        .single();

      if (profileData) {
        setStreak(profileData.current_streak || 0);
      }

      // Get last quiz date
      const { data: lastQuiz } = await supabase
        .from('quiz_attempts')
        .select('completed_at')
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false })
        .limit(1)
        .single();

      if (lastQuiz) {
        setLastQuizDate(new Date(lastQuiz.completed_at));
      }
    };

    fetchStreak();
  }, [user]);

  const getStreakMessage = () => {
    if (streak === 0) return "Start your investigation...";
    if (streak < 3) return "Building momentum...";
    if (streak < 7) return "Good progress, detective";
    if (streak < 14) return "Impressive deduction";
    if (streak < 30) return "L would be proud";
    return "Master detective level!";
  };

  const getStreakColor = () => {
    if (streak === 0) return "text-muted-foreground";
    if (streak < 7) return "text-blue-400";
    if (streak < 14) return "text-blue-500";
    if (streak < 30) return "text-primary";
    return "text-red-500";
  };

  return (
    <div className="relative card-glow p-6 rounded-xl border border-border/50 overflow-hidden group hover:border-primary/30 transition-all duration-300">
      {/* Animated background effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Flame className={`w-6 h-6 ${getStreakColor()} animate-pulse`} />
            <h3 className="text-lg font-semibold">Investigation Streak</h3>
          </div>
          <Calendar className="w-5 h-5 text-muted-foreground" />
        </div>

        <div className="space-y-3">
          <div className="flex items-baseline gap-2">
            <span className={`text-5xl font-bold ${getStreakColor()} animate-fade-in`}>
              {streak}
            </span>
            <span className="text-2xl text-muted-foreground">days</span>
          </div>

          <p className="text-sm text-muted-foreground italic">
            "{getStreakMessage()}"
          </p>

          {lastQuizDate && (
            <p className="text-xs text-muted-foreground">
              Last quiz: {lastQuizDate.toLocaleDateString()}
            </p>
          )}

          {/* Streak visualization */}
          <div className="flex gap-1 pt-2">
            {Array.from({ length: Math.min(streak, 14) }).map((_, i) => (
              <div
                key={i}
                className="h-2 flex-1 bg-gradient-to-t from-primary to-accent rounded-full animate-scale-in"
                style={{ animationDelay: `${i * 50}ms` }}
              />
            ))}
            {streak < 14 && Array.from({ length: 14 - streak }).map((_, i) => (
              <div
                key={`empty-${i}`}
                className="h-2 flex-1 bg-muted/20 rounded-full"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StreakCounter;
