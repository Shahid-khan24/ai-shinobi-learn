import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { 
  Target, 
  Flame, 
  Trophy, 
  Brain,
  Calendar,
  Award,
  Loader2
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface UserStats {
  current_streak: number;
  total_score: number;
  total_quizzes: number;
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
          .select('current_streak, total_score, total_quizzes')
          .eq('user_id', user.id)
          .single();

        if (profileData) {
          setStats(profileData);
        }

        // Fetch recent achievements
        const { data: achievementsData } = await supabase
          .from('user_achievements')
          .select('*, achievements(*)')
          .eq('user_id', user.id)
          .order('earned_at', { ascending: false })
          .limit(3);

        if (achievementsData) {
          setAchievements(achievementsData.map(ua => ({
            ...ua.achievements,
            earned_at: ua.earned_at
          })));
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
    { label: "Current Streak", value: `${stats?.current_streak || 0} days`, icon: Flame, color: "text-orange-500" },
    { label: "Total Score", value: stats?.total_score || 0, icon: Trophy, color: "text-yellow-500" },
    { label: "Quizzes Completed", value: stats?.total_quizzes || 0, icon: Target, color: "text-green-500" },
    { label: "Achievements", value: achievements.length, icon: Award, color: "text-purple-500" }
  ];

  return (
    <section id="dashboard" className="py-20 relative">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Track Your <span className="text-gradient">Progress</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Monitor your learning journey with detailed analytics and performance insights
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12 max-w-6xl mx-auto">
          {statsDisplay.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <div key={index} className="card-glow p-6 rounded-xl text-center animate-ninja-appear ninja-hover" style={{ animationDelay: `${index * 100}ms` }}>
                <IconComponent className={`w-8 h-8 ${stat.color} mx-auto mb-3 rasengan-effect`} />
                <div className="text-2xl font-bold mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Achievements */}
          <div className="card-glow p-6 rounded-xl animate-ninja-appear" style={{ animationDelay: '200ms' }}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <Award className="w-5 h-5 text-primary shuriken-rotate" />
                Recent Achievements
              </h3>
            </div>
            
            <div className="space-y-4">
              {achievements.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Complete quizzes to earn achievements!
                </p>
              ) : (
                achievements.map((achievement) => (
                  <div key={achievement.id} className="flex items-center gap-4 p-3 rounded-lg bg-muted/10 animate-ninja-appear hover-scale chakra-glow">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                      <Trophy className="w-6 h-6 text-primary rasengan-effect" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold">{achievement.name}</div>
                      <div className="text-sm text-muted-foreground">{achievement.description}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="card-glow p-6 rounded-xl animate-ninja-appear" style={{ animationDelay: '300ms' }}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Recent Activity
              </h3>
            </div>

            <div className="space-y-4">
              {recentActivity.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Start a quiz to see your activity!
                </p>
              ) : (
                recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/10 hover:bg-muted/20 transition-colors animate-kunai-throw hover-scale" style={{ animationDelay: `${index * 50}ms` }}>
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

        {/* CTA */}
        <div className="text-center mt-12">
          <Button variant="hero" size="lg" onClick={() => navigate('/#subjects')}>
            <Brain className="w-5 h-5" />
            Continue Learning
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Dashboard;