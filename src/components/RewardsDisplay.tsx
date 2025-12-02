import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import * as Icons from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

interface UserReward {
  id: string;
  earned_at: string;
  is_new: boolean;
  rewards: {
    id: string;
    name: string;
    description: string;
    rarity: string;
    icon: string;
    reward_type: string;
  };
}

const rarityColors = {
  common: "bg-gray-500",
  rare: "bg-blue-500",
  epic: "bg-purple-500",
  legendary: "bg-yellow-500"
};

const RewardsDisplay = () => {
  const { user } = useAuth();
  const [rewards, setRewards] = useState<UserReward[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchRewards = async () => {
      try {
        const { data, error } = await supabase
          .from('user_rewards')
          .select('*, rewards(*)')
          .eq('user_id', user.id)
          .order('earned_at', { ascending: false });

        if (error) throw error;
        setRewards(data || []);
      } catch (error) {
        console.error('Error fetching rewards:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRewards();
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (rewards.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Complete quizzes to earn rewards!
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {rewards.map((userReward) => {
        const reward = userReward.rewards;
        const IconComponent: any = Icons[reward.icon as keyof typeof Icons] || Icons.Gift;

        return (
          <Card key={userReward.id} className="p-4 hover:border-primary/30 transition-all">
            <div className="flex items-start gap-3">
              <div className={`w-12 h-12 rounded-lg ${rarityColors[reward.rarity as keyof typeof rarityColors] || 'bg-gray-500'} flex items-center justify-center flex-shrink-0`}>
                <IconComponent className="w-6 h-6 text-white" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold truncate">{reward.name}</h4>
                  {userReward.is_new && (
                    <Badge variant="secondary" className="text-xs">New</Badge>
                  )}
                </div>
                
                <p className="text-sm text-muted-foreground mb-2">
                  {reward.description}
                </p>
                
                <div className="flex items-center gap-2">
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${rarityColors[reward.rarity as keyof typeof rarityColors]?.replace('bg-', 'text-')}`}
                  >
                    {reward.rarity}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {new Date(userReward.earned_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default RewardsDisplay;