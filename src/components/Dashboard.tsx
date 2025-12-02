import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { 
  Target, 
  Trophy, 
  Brain,
  Loader2
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import StreakCounter from "./StreakCounter";
import AchievementsGrid from "./AchievementsGrid";
import LComparisonCard from "./LComparisonCard";

interface UserStats {
  total_score: number;
  total_quizzes: number;
  current_streak: number;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  earned_at: string;
}

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        // Fetch user stats
        const { data: profileData } = await supabase
          .from('profiles')
          .select('total_score, total_quizzes, current_streak')
          .eq('user_id', user.id)
          .maybeSingle();

        if (profileData) {
          setStats(profileData);
        }

        // Fetch recent quiz attempts
        const { data: attemptsData } = await supabase
          .from('quiz_attempts')
          .select('*, quizzes(difficulty, quiz_topics(name))')
          .eq('user_id', user.id)
          .order('completed_at', { ascending: false })
          .limit(4);

        if (attemptsData) {
          setRecentActivity(attemptsData);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (loading) {
    return (
      <section id="dashboard" className="py-20 relative">
        <div className="container mx-auto px-4 flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </section>
    );
  }

  if (!user) {
    return (
      <section id="dashboard" className="py-20 relative">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground mb-4">Sign in to track your progress</p>
          <Button variant="hero" onClick={() => navigate('/auth')}>
            Sign In
          </Button>
        </div>
      </section>
    );
  }

  const statsDisplay = [
    { label: "Total Score", value: stats?.total_score || 0, icon: Trophy, color: "text-primary" },
    { label: "Cases Solved", value: stats?.total_quizzes || 0, icon: Target, color: "text-accent" },
    { label: "Intelligence", value: "Genius", icon: Brain, color: "text-primary" }
  ];

  // Calculate stats for L comparison
  const totalScore = stats?.total_score || 0;
  const totalQuizzes = stats?.total_quizzes || 0;
  const accuracy = totalQuizzes > 0 ? (totalScore / (totalQuizzes * 10)) * 100 : 0; // Assuming 10 questions per quiz
  const averageTime = recentActivity.length > 0 
    ? recentActivity.reduce((acc, activity) => acc + 45, 0) / recentActivity.length // Placeholder: 45s average
    : 60;

  const comparisonStats = {
    accuracy: Math.round(accuracy),
    averageTime: Math.round(averageTime),
    totalQuizzes: totalQuizzes,
    streak: stats?.current_streak || 0,
  };

  return (
    <section id="dashboard" className="py-20 relative">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Your <span className="text-gradient">Investigation</span> Progress
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto italic">
            "There are many types of monsters in this world. Monsters who will not show themselves and who cause trouble..."
          </p>
        </div>
        
        {/* Streak Counter - Prominent Display */}
        <div className="max-w-md mx-auto mb-12 animate-fade-in">
          <StreakCounter />
        </div>

        {/* L Comparison Card */}
        <div className="max-w-2xl mx-auto mb-12 animate-fade-in" style={{ animationDelay: '100ms' }}>
          <LComparisonCard userStats={comparisonStats} />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto">
          {statsDisplay.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <div key={index} className="card-glow p-6 rounded-xl text-center animate-scale-in hover:border-primary/30 transition-all duration-300" style={{ animationDelay: `${index * 100}ms` }}>
                <IconComponent className={`w-8 h-8 ${stat.color} mx-auto mb-3 animate-pulse`} />
                <div className="text-3xl font-bold mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            );
          })}
        </div>

        {/* Achievements Section */}
        <div className="mb-12 animate-fade-in" style={{ animationDelay: '300ms' }}>
          <AchievementsGrid />
        </div>

        {/* Recent Activity */}
        <div className="max-w-4xl mx-auto">
          <div className="card-glow p-6 rounded-xl animate-fade-in" style={{ animationDelay: '400ms' }}>
            <h3 className="text-2xl font-bold mb-6">
              Recent <span className="text-gradient">Cases</span>
            </h3>

            <div className="space-y-4">
              {recentActivity.length === 0 ? (
                <p className="text-muted-foreground text-center py-8 italic">
                  Begin your investigation...
                </p>
              ) : (
                recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-muted/10 hover:bg-muted/20 transition-all duration-300 animate-scale-in border border-border/30 hover:border-primary/30" style={{ animationDelay: `${index * 50}ms` }}>
                    <div>
                      <div className="font-medium">{activity.quizzes?.quiz_topics?.name}</div>
                      <div className="text-sm text-muted-foreground flex items-center gap-2">
                        <span className="capitalize">{activity.quizzes?.difficulty}</span>
                        <span>•</span>
                        <span>{new Date(activity.completed_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-primary">
                        {Math.round((activity.score / activity.total_questions) * 100)}%
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {activity.score}/{activity.total_questions}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Dashboard;