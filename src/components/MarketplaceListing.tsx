import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Store, ShoppingCart, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Reward {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: string;
}

interface UserReward {
  id: string;
  reward: Reward;
}

interface Listing {
  id: string;
  user_id: string;
  asking_description: string | null;
  created_at: string;
  user_reward: {
    id: string;
    reward: Reward;
  };
  seller_name: string;
}

const rarityColors: Record<string, string> = {
  common: "bg-secondary text-secondary-foreground",
  uncommon: "bg-green-500/20 text-green-400 border-green-500/30",
  rare: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  epic: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  legendary: "bg-amber-500/20 text-amber-400 border-amber-500/30",
};

const MarketplaceListing = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [listings, setListings] = useState<Listing[]>([]);
  const [myRewards, setMyRewards] = useState<UserReward[]>([]);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState<string | null>(null);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);

  useEffect(() => {
    fetchListings();
    if (user) fetchMyRewards();
  }, [user]);

  const fetchListings = async () => {
    const { data, error } = await supabase
      .from("marketplace_listings")
      .select(`
        id,
        user_id,
        asking_description,
        created_at,
        user_reward_id
      `)
      .eq("status", "active")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching listings:", error);
      setLoading(false);
      return;
    }

    // Fetch reward details and seller names for each listing
    const enrichedListings = await Promise.all(
      (data || []).map(async (listing) => {
        // Get user_reward with reward details
        const { data: userRewardData } = await supabase
          .from("user_rewards")
          .select("id, reward_id")
          .eq("id", listing.user_reward_id)
          .maybeSingle();

        let reward: Reward | null = null;
        if (userRewardData) {
          const { data: rewardData } = await supabase
            .from("rewards")
            .select("*")
            .eq("id", userRewardData.reward_id)
            .maybeSingle();
          reward = rewardData;
        }

        // Get seller profile
        const { data: profileData } = await supabase
          .from("profiles")
          .select("display_name")
          .eq("user_id", listing.user_id)
          .maybeSingle();

        return {
          ...listing,
          user_reward: {
            id: listing.user_reward_id,
            reward: reward as Reward,
          },
          seller_name: profileData?.display_name || "Unknown Ninja",
        };
      })
    );

    setListings(enrichedListings.filter((l) => l.user_reward.reward));
    setLoading(false);
  };

  const fetchMyRewards = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("user_rewards")
      .select("id, reward_id")
      .eq("user_id", user.id);

    if (error) {
      console.error("Error fetching rewards:", error);
      return;
    }

    // Fetch reward details
    const rewardsWithDetails = await Promise.all(
      (data || []).map(async (ur) => {
        const { data: rewardData } = await supabase
          .from("rewards")
          .select("*")
          .eq("id", ur.reward_id)
          .maybeSingle();
        return {
          id: ur.id,
          reward: rewardData as Reward,
        };
      })
    );

    setMyRewards(rewardsWithDetails.filter((r) => r.reward));
  };

  const handleClaim = async (listing: Listing, offeredRewardId: string) => {
    if (!user) return;

    setClaiming(listing.id);
    const { data, error } = await supabase.rpc("claim_marketplace_listing", {
      listing_id: listing.id,
      offered_reward_id: offeredRewardId,
    });

    if (error || !data) {
      toast({
        title: "Trade Failed",
        description: error?.message || "Unable to complete the trade",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Trade Complete!",
        description: `You traded for ${listing.user_reward.reward.name}!`,
      });
      fetchListings();
      fetchMyRewards();
    }

    setClaiming(null);
    setSelectedListing(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Store className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">Public Marketplace</h3>
        <Badge variant="outline" className="ml-auto">
          {listings.length} Active Listings
        </Badge>
      </div>

      {listings.length === 0 ? (
        <Card className="p-8 text-center">
          <ShoppingCart className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">No listings available</p>
          <p className="text-sm text-muted-foreground mt-2">
            Be the first to list a reward!
          </p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing) => (
            <Card
              key={listing.id}
              className="p-4 hover:border-primary/50 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="text-4xl">{listing.user_reward.reward.icon}</div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold truncate">
                    {listing.user_reward.reward.name}
                  </h4>
                  <Badge
                    variant="outline"
                    className={rarityColors[listing.user_reward.reward.rarity]}
                  >
                    {listing.user_reward.reward.rarity}
                  </Badge>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {listing.user_reward.reward.description}
                  </p>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  Listed by <span className="text-foreground">{listing.seller_name}</span>
                </p>
                {listing.asking_description && (
                  <p className="text-sm mt-1 italic text-muted-foreground">
                    "{listing.asking_description}"
                  </p>
                )}
              </div>

              {user && listing.user_id !== user.id && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      className="w-full mt-3"
                      size="sm"
                      onClick={() => setSelectedListing(listing)}
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      Make Offer
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Select Reward to Trade</DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-muted-foreground mb-4">
                      Choose one of your rewards to offer for{" "}
                      <strong>{listing.user_reward.reward.name}</strong>
                    </p>
                    <ScrollArea className="h-[300px]">
                      <div className="space-y-2">
                        {myRewards.length === 0 ? (
                          <p className="text-center text-muted-foreground py-8">
                            You don't have any rewards to trade
                          </p>
                        ) : (
                          myRewards.map((reward) => (
                            <Card
                              key={reward.id}
                              className="p-3 cursor-pointer hover:border-primary/50 transition-colors"
                              onClick={() => handleClaim(listing, reward.id)}
                            >
                              <div className="flex items-center gap-3">
                                <span className="text-2xl">{reward.reward.icon}</span>
                                <div className="flex-1">
                                  <p className="font-medium">{reward.reward.name}</p>
                                  <Badge
                                    variant="outline"
                                    className={rarityColors[reward.reward.rarity]}
                                  >
                                    {reward.reward.rarity}
                                  </Badge>
                                </div>
                                {claiming === listing.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Button size="sm" variant="outline">
                                    Trade
                                  </Button>
                                )}
                              </div>
                            </Card>
                          ))
                        )}
                      </div>
                    </ScrollArea>
                  </DialogContent>
                </Dialog>
              )}

              {user && listing.user_id === user.id && (
                <Badge variant="secondary" className="w-full justify-center mt-3">
                  Your Listing
                </Badge>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MarketplaceListing;
