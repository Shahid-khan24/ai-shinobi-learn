import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import * as Icons from "lucide-react";

interface UserReward {
  id: string;
  rewards: {
    id: string;
    name: string;
    icon: string;
    rarity: string;
  };
}

interface Reward {
  id: string;
  name: string;
  icon: string;
  rarity: string;
}

const rarityColors = {
  common: "bg-gray-500",
  rare: "bg-blue-500",
  epic: "bg-purple-500",
  legendary: "bg-yellow-500"
};

const CreateTradeOffer = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [myRewards, setMyRewards] = useState<UserReward[]>([]);
  const [allRewards, setAllRewards] = useState<Reward[]>([]);
  const [recipientEmail, setRecipientEmail] = useState("");
  const [selectedOffering, setSelectedOffering] = useState<string[]>([]);
  const [selectedRequesting, setSelectedRequesting] = useState<string[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!user) return;
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      // Fetch user's rewards
      const { data: userRewardsData } = await supabase
        .from('user_rewards')
        .select('id, rewards(id, name, icon, rarity)')
        .eq('user_id', user?.id);

      setMyRewards(userRewardsData || []);

      // Fetch all available rewards
      const { data: rewardsData } = await supabase
        .from('rewards')
        .select('*');

      setAllRewards(rewardsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const toggleOffering = (rewardId: string) => {
    setSelectedOffering(prev =>
      prev.includes(rewardId)
        ? prev.filter(id => id !== rewardId)
        : [...prev, rewardId]
    );
  };

  const toggleRequesting = (rewardId: string) => {
    setSelectedRequesting(prev =>
      prev.includes(rewardId)
        ? prev.filter(id => id !== rewardId)
        : [...prev, rewardId]
    );
  };

  const createTrade = async () => {
    if (!recipientEmail || selectedOffering.length === 0 || selectedRequesting.length === 0) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Find recipient user
      const { data: recipientProfile } = await supabase
        .from('profiles')
        .select('user_id')
        .ilike('display_name', recipientEmail)
        .single();

      if (!recipientProfile) {
        toast({
          title: "Error",
          description: "User not found",
          variant: "destructive"
        });
        return;
      }

      // Create trade offer
      const { error } = await supabase
        .from('trade_offers')
        .insert({
          from_user_id: user?.id,
          to_user_id: recipientProfile.user_id,
          offering_reward_ids: selectedOffering,
          requesting_reward_ids: selectedRequesting,
          message
        });

      if (error) throw error;

      toast({
        title: "Trade Offer Sent!",
        description: "Your trade offer has been sent successfully."
      });

      // Reset form
      setRecipientEmail("");
      setSelectedOffering([]);
      setSelectedRequesting([]);
      setMessage("");
    } catch (error) {
      console.error('Error creating trade:', error);
      toast({
        title: "Error",
        description: "Failed to create trade offer",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <h3 className="text-2xl font-bold mb-6">Create Trade Offer</h3>

      <div className="space-y-6">
        <div>
          <Label htmlFor="recipient">Recipient Username</Label>
          <Input
            id="recipient"
            placeholder="Enter username"
            value={recipientEmail}
            onChange={(e) => setRecipientEmail(e.target.value)}
          />
        </div>

        <div>
          <Label>Your Rewards (Offering)</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
            {myRewards.map((userReward) => {
              const reward = userReward.rewards;
              const IconComponent: any = Icons[reward.icon as keyof typeof Icons] || Icons.Gift;
              return (
                <div
                  key={userReward.id}
                  className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedOffering.includes(userReward.id)
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => toggleOffering(userReward.id)}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-8 h-8 rounded ${rarityColors[reward.rarity as keyof typeof rarityColors]} flex items-center justify-center`}>
                      <IconComponent className="w-4 h-4 text-white" />
                    </div>
                    <Checkbox checked={selectedOffering.includes(userReward.id)} />
                  </div>
                  <p className="text-sm font-medium">{reward.name}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <Label>Requesting Rewards</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
            {allRewards.map((reward) => {
              const IconComponent: any = Icons[reward.icon as keyof typeof Icons] || Icons.Gift;
              return (
                <div
                  key={reward.id}
                  className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedRequesting.includes(reward.id)
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => toggleRequesting(reward.id)}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-8 h-8 rounded ${rarityColors[reward.rarity as keyof typeof rarityColors]} flex items-center justify-center`}>
                      <IconComponent className="w-4 h-4 text-white" />
                    </div>
                    <Checkbox checked={selectedRequesting.includes(reward.id)} />
                  </div>
                  <p className="text-sm font-medium">{reward.name}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <Label htmlFor="message">Message (Optional)</Label>
          <Textarea
            id="message"
            placeholder="Add a message to your trade offer..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>

        <Button onClick={createTrade} disabled={loading} className="w-full" variant="hero">
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Creating...
            </>
          ) : (
            'Send Trade Offer'
          )}
        </Button>
      </div>
    </Card>
  );
};

export default CreateTradeOffer;