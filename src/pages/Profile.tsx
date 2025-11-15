import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Trophy, 
  TrendingUp, 
  Target, 
  Zap, 
  Award,
  Calendar,
  Clock,
  Loader2,
  Crown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import UserProfileDialog from "@/components/UserProfileDialog";

interface Profile {
  display_name: string;
  avatar_url: string | null;
  total_score: number;
  total_quizzes: number;
  current_streak: number;
  experience_points: number;
  level: number;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  earned_at?: string;
  requirement_type: string;
  requirement_value: number;
}

interface QuizHistory {
  id: string;
  score: number;
  total_questions: number;
  completed_at: string;
  quiz: {
    difficulty: string;
    topic: {
      name: string;
    };
  };
}

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [earnedAchievements, setEarnedAchievements] = useState<Set<string>>(new Set());
  const [quizHistory, setQuizHistory] = useState<QuizHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showProfileDialog, setShowProfileDialog] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    fetchProfileData();
  }, [user, navigate]);

  const fetchProfileData = async () => {
    if (!user) return;

    try {
      // Fetch profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profileData) {
        setProfile(profileData);
      }

      // Fetch all achievements
      const { data: allAchievements } = await supabase
        .from('achievements')
        .select('*')
        .order('requirement_value', { ascending: true });

      // Fetch earned achievements
      const { data: earnedData } = await supabase
        .from('user_achievements')
        .select('achievement_id, earned_at, achievements(*)')
        .eq('user_id', user.id);

      if (allAchievements) {
        const earnedIds = new Set(earnedData?.map(e => e.achievement_id) || []);
        setEarnedAchievements(earnedIds);
        
        const achievementsWithStatus = allAchievements.map(achievement => ({
          ...achievement,
          earned_at: earnedData?.find(e => e.achievement_id === achievement.id)?.earned_at
        }));
        
        setAchievements(achievementsWithStatus);
      }

      // Fetch quiz history
      const { data: historyData } = await supabase
        .from('quiz_attempts')
        .select(`
          id,
          score,
          total_questions,
          completed_at,
          quizzes (
            difficulty,
            quiz_topics (
              name
            )
          )
        `)
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false })
        .limit(20);

      if (historyData) {
        const formatted = historyData.map(item => ({
          id: item.id,
          score: item.score,
          total_questions: item.total_questions,
          completed_at: item.completed_at,
          quiz: {
            difficulty: (item.quizzes as any)?.difficulty || 'unknown',
            topic: {
              name: (item.quizzes as any)?.quiz_topics?.name || 'Unknown Topic'
            }
          }
        }));
        setQuizHistory(formatted);
      }
    } catch (error) {
      console.error('Error fetching profile data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-20 flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-20 text-center">
          <p className="text-muted-foreground">Profile not found</p>
        </div>
      </div>
    );
  }

  const expToNextLevel = 500;
  const currentLevelExp = profile.experience_points % expToNextLevel;
  const expProgress = (currentLevelExp / expToNextLevel) * 100;
  
  const earnedCount = earnedAchievements.size;
  const totalAchievements = achievements.length;
  const achievementProgress = (earnedCount / totalAchievements) * 100;

  const getLevelTitle = (level: number) => {
    if (level >= 20) return "World's Greatest Detective";
    if (level >= 15) return "Legendary Investigator";
    if (level >= 10) return "Master Analyst";
    if (level >= 5) return "Skilled Detective";
    return "Aspiring Detective";
  };

  const getProgressToTitle = () => {
    const currentTitle = getLevelTitle(profile.level);
    if (currentTitle === "World's Greatest Detective") {
      return { title: currentTitle, progress: 100, nextLevel: profile.level };
    }
    
    let nextMilestone = 5;
    if (profile.level >= 15) nextMilestone = 20;
    else if (profile.level >= 10) nextMilestone = 15;
    else if (profile.level >= 5) nextMilestone = 10;
    
    const progressToTitle = ((profile.level / nextMilestone) * 100);
    return {
      title: currentTitle,
      nextTitle: getLevelTitle(nextMilestone),
      progress: progressToTitle,
      nextLevel: nextMilestone
    };
  };

  const titleProgress = getProgressToTitle();

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-24">
        {/* Profile Header */}
        <Card className="p-8 mb-8 bg-gradient-to-br from-card/50 to-card border-primary/20">
          <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-4xl font-bold border-2 border-primary/30">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                ) : (
                  profile.display_name?.charAt(0) || '?'
                )}
              </div>
              <div className="absolute -bottom-2 -right-2 bg-primary text-primary-foreground rounded-full w-10 h-10 flex items-center justify-center font-bold border-2 border-background">
                {profile.level}
              </div>
            </div>
            
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold mb-2">{profile.display_name || 'Anonymous Detective'}</h1>
              <div className="flex items-center gap-2 justify-center md:justify-start mb-4">
                <Crown className="w-5 h-5 text-primary" />
                <span className="text-lg text-primary font-semibold">{titleProgress.title}</span>
              </div>
              
              {/* Level Progress */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Level {profile.level}</span>
                  <span className="text-muted-foreground">{currentLevelExp} / {expToNextLevel} XP</span>
                </div>
                <Progress value={expProgress} className="h-3" />
              </div>

              {/* Title Progress */}
              {titleProgress.nextTitle && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Progress to "{titleProgress.nextTitle}"</span>
                    <span className="text-muted-foreground">Level {titleProgress.nextLevel}</span>
                  </div>
                  <Progress value={titleProgress.progress} className="h-2" />
                </div>
              )}
            </div>

            <Button onClick={() => setShowProfileDialog(true)} variant="outline">
              Edit Profile
            </Button>
          </div>
        </Card>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-4 text-center">
            <Trophy className="w-6 h-6 text-primary mx-auto mb-2" />
            <div className="text-2xl font-bold">{profile.total_score}</div>
            <div className="text-sm text-muted-foreground">Total Score</div>
          </Card>
          <Card className="p-4 text-center">
            <Target className="w-6 h-6 text-accent mx-auto mb-2" />
            <div className="text-2xl font-bold">{profile.total_quizzes}</div>
            <div className="text-sm text-muted-foreground">Cases Solved</div>
          </Card>
          <Card className="p-4 text-center">
            <Zap className="w-6 h-6 text-primary mx-auto mb-2" />
            <div className="text-2xl font-bold">{profile.current_streak}</div>
            <div className="text-sm text-muted-foreground">Day Streak</div>
          </Card>
          <Card className="p-4 text-center">
            <Award className="w-6 h-6 text-accent mx-auto mb-2" />
            <div className="text-2xl font-bold">{earnedCount}/{totalAchievements}</div>
            <div className="text-sm text-muted-foreground">Achievements</div>
          </Card>
        </div>

        {/* Tabs Section */}
        <Tabs defaultValue="achievements" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
            <TabsTrigger value="history">Case History</TabsTrigger>
          </TabsList>

          {/* Achievements Tab */}
          <TabsContent value="achievements" className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Achievement Collection</h2>
                <div className="text-sm text-muted-foreground">
                  {achievementProgress.toFixed(0)}% Complete
                </div>
              </div>
              <Progress value={achievementProgress} className="mb-6 h-3" />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {achievements.map((achievement) => {
                  const isEarned = earnedAchievements.has(achievement.id);
                  return (
                    <Card 
                      key={achievement.id}
                      className={`p-4 ${isEarned ? 'bg-primary/5 border-primary/30' : 'opacity-50'}`}
                    >
                      <div className="flex items-start gap-4">
                        <div className="text-4xl">{achievement.icon}</div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold">{achievement.name}</h3>
                            {isEarned && <Badge variant="secondary" className="text-xs">Earned</Badge>}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{achievement.description}</p>
                          {achievement.earned_at && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Calendar className="w-3 h-3" />
                              {new Date(achievement.earned_at).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </Card>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-4">
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-6">Recent Cases</h2>
              
              {quizHistory.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No cases solved yet</p>
              ) : (
                <div className="space-y-3">
                  {quizHistory.map((quiz) => {
                    const percentage = Math.round((quiz.score / quiz.total_questions) * 100);
                    const isPerfect = percentage === 100;
                    
                    return (
                      <Card key={quiz.id} className="p-4 hover:border-primary/30 transition-all">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold">{quiz.quiz.topic.name}</h3>
                              <Badge variant="outline" className="text-xs capitalize">
                                {quiz.quiz.difficulty}
                              </Badge>
                              {isPerfect && <Badge className="text-xs bg-primary">Perfect!</Badge>}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {new Date(quiz.completed_at).toLocaleDateString()}
                              </div>
                              <div className="flex items-center gap-1">
                                <TrendingUp className="w-3 h-3" />
                                {quiz.score}/{quiz.total_questions} correct
                              </div>
                            </div>
                          </div>
                          <div className={`text-2xl font-bold ${isPerfect ? 'text-primary' : ''}`}>
                            {percentage}%
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <UserProfileDialog 
        open={showProfileDialog}
        onOpenChange={setShowProfileDialog}
        userId={user?.id || null}
        displayName={profile.display_name || 'Anonymous'}
      />
    </div>
  );
};

export default Profile;
