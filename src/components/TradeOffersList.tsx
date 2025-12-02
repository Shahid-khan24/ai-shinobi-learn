import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Check, X, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import * as Icons from "lucide-react";

interface TradeOffer {
  id: string;
  from_user_id: string;
  to_user_id: string;
  status: string;
  message: string | null;
  created_at: string;
  from_profile: {
    display_name: string;
    avatar_url: string | null;
  };
  to_profile: {
    display_name: string;
    avatar_url: string | null;
  };
  offering_rewards: Array<{
    id: string;
    rewards: {
      name: string;
      icon: string;
      rarity: string;
    };
  }>;
  requesting_rewards: Array<{
    name: string;
    icon: string;
    rarity: string;
  }>;
}

const rarityColors = {
  common: "bg-gray-500",
  rare: "bg-blue-500",
  epic: "bg-purple-500",
  legendary: "bg-yellow-500"
};

const TradeOffersList = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [offers, setOffers] = useState<TradeOffer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchOffers();
  }, [user]);

  const fetchOffers = async () => {
    try {
      const { data, error } = await supabase
        .from('trade_offers')
        .select('*')
        .or(`from_user_id.eq.${user?.id},to_user_id.eq.${user?.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch profile and reward details for each offer
      const offersWithRewards = await Promise.all(
        (data || []).map(async (offer) => {
          // Fetch profiles
          const { data: fromProfile } = await supabase
            .from('profiles')
            .select('display_name, avatar_url')
            .eq('user_id', offer.from_user_id)
            .single();

          const { data: toProfile } = await supabase
            .from('profiles')
            .select('display_name, avatar_url')
            .eq('user_id', offer.to_user_id)
            .single();

          // Fetch offering rewards
          const { data: offeringRewards } = await supabase
            .from('user_rewards')
            .select('id, rewards(name, icon, rarity)')
            .in('id', offer.offering_reward_ids);

          // Fetch requesting reward details
          const { data: requestingRewards } = await supabase
            .from('rewards')
            .select('name, icon, rarity')
            .in('id', offer.requesting_reward_ids);

          return {
            ...offer,
            from_profile: fromProfile || { display_name: 'Unknown', avatar_url: null },
            to_profile: toProfile || { display_name: 'Unknown', avatar_url: null },
            offering_rewards: offeringRewards || [],
            requesting_rewards: requestingRewards || []
          };
        })
      );

      setOffers(offersWithRewards as any);
    } catch (error) {
      console.error('Error fetching offers:', error);
      toast({
        title: "Error",
        description: "Failed to load trade offers",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const acceptTrade = async (tradeId: string) => {
    try {
      const { data, error } = await supabase.rpc('complete_trade', {
        trade_id: tradeId
      });

      if (error) throw error;

      toast({
        title: "Trade Completed!",
        description: "Rewards have been exchanged successfully."
      });

      fetchOffers();
    } catch (error) {
      console.error('Error accepting trade:', error);
      toast({
        title: "Error",
        description: "Failed to complete trade",
        variant: "destructive"
      });
    }
  };

  const rejectTrade = async (tradeId: string) => {
    try {
      const { error } = await supabase
        .from('trade_offers')
        .update({ status: 'rejected' })
        .eq('id', tradeId);

      if (error) throw error;

      toast({
        title: "Trade Rejected",
        description: "The trade offer has been declined."
      });

      fetchOffers();
    } catch (error) {
      console.error('Error rejecting trade:', error);
      toast({
        title: "Error",
        description: "Failed to reject trade",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (offers.length === 0) {
    return (
      <Card className="p-12 text-center">
        <p className="text-muted-foreground">No trade offers yet</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {offers.map((offer) => {
        const isReceiver = offer.to_user_id === user?.id;
        const otherUser = isReceiver ? offer.from_profile : offer.to_profile;

        return (
          <Card key={offer.id} className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">{otherUser.display_name || 'Anonymous'}</p>
                  <p className="text-sm text-muted-foreground">
                    {isReceiver ? 'wants to trade with you' : 'you offered a trade'}
                  </p>
                </div>
              </div>
              <Badge variant={
                offer.status === 'pending' ? 'default' :
                offer.status === 'accepted' ? 'secondary' :
                'destructive'
              }>
                {offer.status}
              </Badge>
            </div>

            {offer.message && (
              <p className="text-sm text-muted-foreground mb-4 italic">"{offer.message}"</p>
            )}

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">Offering:</h4>
                <div className="space-y-2">
                  {offer.offering_rewards.map((rew: any) => {
                    const IconComponent: any = Icons[rew.rewards.icon as keyof typeof Icons] || Icons.Gift;
                    return (
                      <div key={rew.id} className="flex items-center gap-2 p-2 rounded bg-muted/30">
                        <div className={`w-8 h-8 rounded ${rarityColors[rew.rewards.rarity as keyof typeof rarityColors]} flex items-center justify-center`}>
                          <IconComponent className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-sm">{rew.rewards.name}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Requesting:</h4>
                <div className="space-y-2">
                  {offer.requesting_rewards.map((rew: any, idx: number) => {
                    const IconComponent: any = Icons[rew.icon as keyof typeof Icons] || Icons.Gift;
                    return (
                      <div key={idx} className="flex items-center gap-2 p-2 rounded bg-muted/30">
                        <div className={`w-8 h-8 rounded ${rarityColors[rew.rarity as keyof typeof rarityColors]} flex items-center justify-center`}>
                          <IconComponent className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-sm">{rew.name}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {isReceiver && offer.status === 'pending' && (
              <div className="flex gap-2 mt-4">
                <Button onClick={() => acceptTrade(offer.id)} variant="hero">
                  <Check className="w-4 h-4 mr-2" />
                  Accept Trade
                </Button>
                <Button onClick={() => rejectTrade(offer.id)} variant="outline">
                  <X className="w-4 h-4 mr-2" />
                  Decline
                </Button>
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
};

export default TradeOffersList;