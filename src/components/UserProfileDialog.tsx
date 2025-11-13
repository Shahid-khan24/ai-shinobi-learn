import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Trophy, Target, Flame, BookOpen } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface UserProfileDialogProps {
  userId: string | null;
  displayName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface UserStats {
  total_score: number;
  total_quizzes: number;
  current_streak: number;
  avatar_url: string | null;
}

interface SubjectStats {
  subject: string;
  score: number;
  quiz_count: number;
  avg_score: number;
}

interface RecentQuiz {
  quiz_name: string;
  score: number;
  total_questions: number;
  completed_at: string;
  subject: string;
}

const UserProfileDialog = ({ userId, displayName, open, onOpenChange }: UserProfileDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [subjectStats, setSubjectStats] = useState<SubjectStats[]>([]);
  const [recentQuizzes, setRecentQuizzes] = useState<RecentQuiz[]>([]);

  useEffect(() => {
    if (open && userId) {
      fetchUserDetails();
    }
  }, [open, userId]);

  const fetchUserDetails = async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      // Fetch user profile stats
      const { data: profile } = await supabase
        .from('profiles')
        .select('total_score, total_quizzes, current_streak, avatar_url')
        .eq('user_id', userId)
        .single();

      if (profile) {
        setUserStats(profile);
      }

      // Fetch subject-wise stats
      const { data: attempts } = await supabase
        .from('quiz_attempts')
        .select(`
          score,
          total_questions,
          quizzes!inner(
            topic_id,
            quiz_topics!inner(name)
          )
        `)
        .eq('user_id', userId);

      if (attempts) {
        const subjectMap = new Map<string, { score: number; count: number }>();
        
        attempts.forEach((attempt: any) => {
          const subject = attempt.quizzes.quiz_topics.name;
          const current = subjectMap.get(subject) || { score: 0, count: 0 };
          subjectMap.set(subject, {
            score: current.score + attempt.score,
            count: current.count + 1
          });
        });

        const subjects: SubjectStats[] = Array.from(subjectMap.entries()).map(([subject, data]) => ({
          subject,
          score: data.score,
          quiz_count: data.count,
          avg_score: Math.round((data.score / data.count) * 100) / 100
        }));

        setSubjectStats(subjects);
      }

      // Fetch recent quizzes
      const { data: recent } = await supabase
        .from('quiz_attempts')
        .select(`
          score,
          total_questions,
          completed_at,
          quizzes!inner(
            quiz_topics!inner(name)
          )
        `)
        .eq('user_id', userId)
        .order('completed_at', { ascending: false })
        .limit(5);

      if (recent) {
        const recentQuizzes: RecentQuiz[] = recent.map((quiz: any) => ({
          quiz_name: quiz.quizzes.quiz_topics.name,
          score: quiz.score,
          total_questions: quiz.total_questions,
          completed_at: quiz.completed_at,
          subject: quiz.quizzes.quiz_topics.name
        }));
        setRecentQuizzes(recentQuizzes);
      }

    } catch (error) {
      console.error('Error fetching user details:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSubjectContent = (subject: string) => {
    switch (subject) {
      case 'Tamil':
        return {
          title: 'தமிழ் இலக்கணம்',
          description: 'எழுத்து, சொல், பொருள், யாப்பு, அணி ஆகியவற்றை கற்றல்',
          emoji: '📚'
        };
      case 'Islam':
        return {
          title: 'الإسلام / Islam',
          description: 'Learning about faith, practice, and Islamic knowledge',
          emoji: '☪️'
        };
      case 'English':
        return {
          title: 'English',
          description: 'Grammar, vocabulary, and communication skills',
          emoji: '📖'
        };
      case 'Technology':
        return {
          title: 'Technology',
          description: 'Modern tech concepts and digital literacy',
          emoji: '💻'
        };
      default:
        return {
          title: subject,
          description: 'Subject statistics',
          emoji: '📚'
        };
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="bg-primary/20 text-primary font-semibold text-2xl">
                {displayName?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="text-2xl font-bold">{displayName || 'Anonymous User'}</div>
              {userStats && (
                <div className="flex gap-2 mt-1">
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Trophy className="w-3 h-3" />
                    {userStats.total_score} points
                  </Badge>
                  {userStats.current_streak > 0 && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Flame className="w-3 h-3" />
                      {userStats.current_streak} day streak
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Overall Stats */}
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6 text-center">
                  <Trophy className="w-8 h-8 text-primary mx-auto mb-2" />
                  <div className="text-2xl font-bold">{userStats?.total_score || 0}</div>
                  <div className="text-sm text-muted-foreground">Total Points</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <Target className="w-8 h-8 text-primary mx-auto mb-2" />
                  <div className="text-2xl font-bold">{userStats?.total_quizzes || 0}</div>
                  <div className="text-sm text-muted-foreground">Quizzes</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <Flame className="w-8 h-8 text-primary mx-auto mb-2" />
                  <div className="text-2xl font-bold">{userStats?.current_streak || 0}</div>
                  <div className="text-sm text-muted-foreground">Day Streak</div>
                </CardContent>
              </Card>
            </div>

            {/* Subject Stats & Recent Activity */}
            <Tabs defaultValue="subjects" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="subjects">Subject Stats</TabsTrigger>
                <TabsTrigger value="recent">Recent Activity</TabsTrigger>
              </TabsList>

              <TabsContent value="subjects" className="space-y-3 mt-4">
                {subjectStats.length === 0 ? (
                  <Card>
                    <CardContent className="py-8 text-center">
                      <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">No subject stats yet</p>
                    </CardContent>
                  </Card>
                ) : (
                  subjectStats.map((stat) => {
                    const content = getSubjectContent(stat.subject);
                    return (
                      <Card key={stat.subject}>
                        <CardContent className="py-4">
                          <div className="flex items-start gap-3">
                            <div className="text-3xl">{content.emoji}</div>
                            <div className="flex-1">
                              <div className="font-semibold text-lg">{content.title}</div>
                              <div className="text-sm text-muted-foreground mb-2">
                                {content.description}
                              </div>
                              <div className="flex gap-4 text-sm">
                                <div>
                                  <span className="font-semibold text-primary">{stat.score}</span> points
                                </div>
                                <div>
                                  <span className="font-semibold text-primary">{stat.quiz_count}</span> quizzes
                                </div>
                                <div>
                                  <span className="font-semibold text-primary">{stat.avg_score}</span> avg score
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </TabsContent>

              <TabsContent value="recent" className="space-y-3 mt-4">
                {recentQuizzes.length === 0 ? (
                  <Card>
                    <CardContent className="py-8 text-center">
                      <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">No recent activity</p>
                    </CardContent>
                  </Card>
                ) : (
                  recentQuizzes.map((quiz, index) => (
                    <Card key={index}>
                      <CardContent className="py-3">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="font-semibold">{quiz.quiz_name}</div>
                            <div className="text-sm text-muted-foreground">
                              {new Date(quiz.completed_at).toLocaleDateString()}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-primary">
                              {quiz.score}/{quiz.total_questions}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {Math.round((quiz.score / quiz.total_questions) * 100)}%
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>
            </Tabs>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default UserProfileDialog;
