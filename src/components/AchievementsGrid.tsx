import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import AchievementBadge from "./AchievementBadge";
import { Loader2, Award } from "lucide-react";

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

const AchievementsGrid = () => {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchAchievements = async () => {
      try {
        // Get all achievements
        const { data: allAchievements } = await supabase
          .from('achievements')
          .select('*')
          .order('requirement_value', { ascending: true });

        // Get user's earned achievements
        const { data: userAchievements } = await supabase
          .from('user_achievements')
          .select('achievement_id, earned_at')
          .eq('user_id', user.id);

        // Get user stats for progress calculation
        const { data: profile } = await supabase
          .from('profiles')
          .select('current_streak, total_score, total_quizzes')
          .eq('user_id', user.id)
          .single();

        const earnedIds = new Set(userAchievements?.map(ua => ua.achievement_id) || []);
        
        const achievementsWithStatus = allAchievements?.map(achievement => {
          const isEarned = earnedIds.has(achievement.id);
          const earnedData = userAchievements?.find(ua => ua.achievement_id === achievement.id);
          
          // Calculate progress based on requirement type
          let progress = 0;
          if (!isEarned && profile) {
            switch (achievement.requirement_type) {
              case 'streak':
                progress = profile.current_streak || 0;
                break;
              case 'total_score':
                progress = profile.total_score || 0;
                break;
              case 'total_quizzes':
                progress = profile.total_quizzes || 0;
                break;
            }
          }

          return {
            ...achievement,
            earned: isEarned,
            earned_at: earnedData?.earned_at,
            progress,
          };
        }) || [];

        setAchievements(achievementsWithStatus);
      } catch (error) {
        console.error('Error fetching achievements:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAchievements();
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const earnedCount = achievements.filter(a => a.earned).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Award className="w-6 h-6 text-primary" />
          <h3 className="text-2xl font-bold">
            Detective <span className="text-gradient">Achievements</span>
          </h3>
        </div>
        <div className="text-sm text-muted-foreground">
          <span className="text-primary font-bold">{earnedCount}</span> / {achievements.length} earned
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {achievements.map((achievement) => (
          <AchievementBadge key={achievement.id} achievement={achievement} />
        ))}
      </div>
    </div>
  );
};

export default AchievementsGrid;
