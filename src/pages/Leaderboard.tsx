import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Trophy, Medal, Award } from "lucide-react";
import UserProfileDialog from "@/components/UserProfileDialog";

interface LeaderboardEntry {
  id: string;
  display_name: string;
  total_score: number;
  total_quizzes: number;
  current_streak: number;
  avatar_url: string | null;
}

interface SubjectLeaderboardEntry {
  user_id: string;
  display_name: string;
  subject_score: number;
  quiz_count: number;
  avatar_url: string | null;
}

const Leaderboard = () => {
  const [leaders, setLeaders] = useState<LeaderboardEntry[]>([]);
  const [subjectLeaders, setSubjectLeaders] = useState<{ [key: string]: SubjectLeaderboardEntry[] }>({});
  const [loading, setLoading] = useState(true);
  const [timePeriod, setTimePeriod] = useState<'weekly' | 'monthly' | 'all_time'>('all_time');
  const [subjects] = useState(['Islam', 'Tamil', 'English', 'Technology']);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUserName, setSelectedUserName] = useState<string>('');
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        // Fetch overall leaderboard with time period
        const overallResult = await (supabase.rpc as any)('get_overall_leaderboard', { 
          time_period: timePeriod 
        });

        if (!overallResult.error && overallResult.data) {
          setLeaders(overallResult.data as LeaderboardEntry[]);
        }

        // Fetch subject-specific leaderboards
        const subjectData: { [key: string]: SubjectLeaderboardEntry[] } = {};
        
        for (const subject of subjects) {
          const result = await (supabase.rpc as any)('get_subject_leaderboard', { 
            subject_name: subject,
            time_period: timePeriod 
          });

          if (!result.error && result.data) {
            subjectData[subject] = result.data as SubjectLeaderboardEntry[];
          }
        }
        
        setSubjectLeaders(subjectData);
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('leaderboard-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'quiz_attempts'
        },
        () => {
          fetchLeaderboard();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [subjects, timePeriod]);

  const getMedalIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Award className="w-6 h-6 text-orange-600" />;
      default:
        return <span className="text-lg font-bold text-muted-foreground">#{position}</span>;
    }
  };


  const handleEntryClick = (userId: string, displayName: string) => {
    setSelectedUserId(userId);
    setSelectedUserName(displayName);
    setProfileDialogOpen(true);
  };

  const renderLeaderboardList = (entries: (LeaderboardEntry | SubjectLeaderboardEntry)[], isSubject = false) => {
    if (entries.length === 0) {
      return (
        <Card>
          <CardContent className="py-12 text-center">
            <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-xl text-muted-foreground">
              No learners yet. Be the first!
            </p>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-3">
        {entries.map((entry, index) => {
          const score = isSubject ? (entry as SubjectLeaderboardEntry).subject_score : (entry as LeaderboardEntry).total_score;
          const quizCount = isSubject ? (entry as SubjectLeaderboardEntry).quiz_count : (entry as LeaderboardEntry).total_quizzes;
          const displayName = entry.display_name;
          const streak = !isSubject ? (entry as LeaderboardEntry).current_streak : 0;
          const entryId = isSubject ? (entry as SubjectLeaderboardEntry).user_id : (entry as LeaderboardEntry).id;

          return (
            <Card 
              key={entryId} 
              className="hover:border-primary/50 transition-colors animate-ninja-appear cursor-pointer"
              onClick={() => handleEntryClick(entryId, displayName)}
            >
              <CardContent className="py-4">
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-12 text-center">
                    {getMedalIcon(index + 1)}
                  </div>
                  
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-primary/20 text-primary font-semibold">
                      {displayName?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <div className="font-semibold text-lg">
                      {displayName || 'Anonymous User'}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {quizCount} quizzes completed
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {!isSubject && streak > 0 && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        🔥 {streak} day streak
                      </Badge>
                    )}
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">
                        {score}
                      </div>
                      <div className="text-xs text-muted-foreground">points</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12 animate-ninja-appear">
            <Trophy className="w-16 h-16 text-primary mx-auto mb-4 animate-shuriken-spin" />
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="text-gradient">Leaderboard</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              See how you stack up against other learners
            </p>
          </div>

          {/* Time Period Selector */}
          <div className="flex justify-center mb-8">
            <Tabs value={timePeriod} onValueChange={(value) => setTimePeriod(value as any)} className="w-full max-w-md">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="weekly" className="animate-ninja-appear">
                  This Week
                </TabsTrigger>
                <TabsTrigger value="monthly" className="animate-ninja-appear" style={{ animationDelay: '0.1s' }}>
                  This Month
                </TabsTrigger>
                <TabsTrigger value="all_time" className="animate-ninja-appear" style={{ animationDelay: '0.2s' }}>
                  All Time
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <Tabs defaultValue="overall" className="w-full">
              <TabsList className="grid w-full grid-cols-5 mb-8">
                <TabsTrigger value="overall">Overall</TabsTrigger>
                <TabsTrigger value="Islam">Islam</TabsTrigger>
                <TabsTrigger value="Tamil">Tamil</TabsTrigger>
                <TabsTrigger value="English">English</TabsTrigger>
                <TabsTrigger value="Technology">Technology</TabsTrigger>
              </TabsList>

              <TabsContent value="overall">
                {renderLeaderboardList(leaders)}
              </TabsContent>

              {subjects.map(subject => (
                <TabsContent key={subject} value={subject}>
                  {renderLeaderboardList(subjectLeaders[subject] || [], true)}
                </TabsContent>
              ))}
            </Tabs>
          )}
        </div>
      </div>

      <UserProfileDialog
        userId={selectedUserId}
        displayName={selectedUserName}
        open={profileDialogOpen}
        onOpenChange={setProfileDialogOpen}
      />
    </div>
  );
};

export default Leaderboard;
