import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Gift } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import * as Icons from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface UserReward {
  id: string;
  rewards: {
    name: string;
    icon: string;
    rarity: string;
  };
}

const rarityColors = {
  common: "bg-gray-500",
  rare: "bg-blue-500",
  epic: "bg-purple-500",
  legendary: "bg-yellow-500"
};

const GiftReward = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [myRewards, setMyRewards] = useState<UserReward[]>([]);
  const [recipientUsername, setRecipientUsername] = useState("");
  const [selectedReward, setSelectedReward] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!user) return;
    fetchMyRewards();
  }, [user]);

  const fetchMyRewards = async () => {
    try {
      const { data } = await supabase
        .from('user_rewards')
        .select('id, rewards(name, icon, rarity)')
        .eq('user_id', user?.id);

      setMyRewards(data || []);
    } catch (error) {
      console.error('Error fetching rewards:', error);
    }
  };

  const sendGift = async () => {
    if (!recipientUsername || !selectedReward) {
      toast({
        title: "Error",
        description: "Please select a reward and recipient",
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
        .ilike('display_name', recipientUsername)
        .single();

      if (!recipientProfile) {
        toast({
          title: "Error",
          description: "User not found",
          variant: "destructive"
        });
        return;
      }

      // Process the gift
      const { data, error } = await supabase.rpc('process_gift', {
        gift_user_reward_id: selectedReward,
        recipient_user_id: recipientProfile.user_id,
        gift_message: message || null
      });

      if (error) throw error;

      toast({
        title: "Gift Sent!",
        description: `Your gift has been sent to ${recipientUsername}`
      });

      // Reset form
      setRecipientUsername("");
      setSelectedReward("");
      setMessage("");
      fetchMyRewards();
    } catch (error) {
      console.error('Error sending gift:', error);
      toast({
        title: "Error",
        description: "Failed to send gift",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Gift className="w-8 h-8 text-primary" />
        <h3 className="text-2xl font-bold">Send a Gift</h3>
      </div>

      <div className="space-y-6">
        <div>
          <Label htmlFor="recipient">Recipient Username</Label>
          <Input
            id="recipient"
            placeholder="Enter username"
            value={recipientUsername}
            onChange={(e) => setRecipientUsername(e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="reward">Select Reward</Label>
          <Select value={selectedReward} onValueChange={setSelectedReward}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a reward to gift" />
            </SelectTrigger>
            <SelectContent>
              {myRewards.map((userReward) => {
                const reward = userReward.rewards;
                return (
                  <SelectItem key={userReward.id} value={userReward.id}>
                    <div className="flex items-center gap-2">
                      <span>{reward.name}</span>
                      <span className="text-xs text-muted-foreground">
                        ({reward.rarity})
                      </span>
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        {selectedReward && (
          <div className="p-4 rounded-lg bg-muted/30">
            {(() => {
              const userReward = myRewards.find(r => r.id === selectedReward);
              if (!userReward) return null;
              const reward = userReward.rewards;
              const IconComponent: any = Icons[reward.icon as keyof typeof Icons] || Icons.Gift;
              return (
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-lg ${rarityColors[reward.rarity as keyof typeof rarityColors]} flex items-center justify-center`}>
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold">{reward.name}</p>
                    <p className="text-sm text-muted-foreground capitalize">{reward.rarity}</p>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        <div>
          <Label htmlFor="gift-message">Gift Message (Optional)</Label>
          <Textarea
            id="gift-message"
            placeholder="Add a personal message to your gift..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>

        <Button onClick={sendGift} disabled={loading} className="w-full" variant="hero">
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Gift className="w-4 h-4 mr-2" />
              Send Gift
            </>
          )}
        </Button>
      </div>
    </Card>
  );
};

export default GiftReward;