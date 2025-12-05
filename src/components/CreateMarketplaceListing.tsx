import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Package, Plus, Trash2 } from "lucide-react";
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

interface MyListing {
  id: string;
  asking_description: string | null;
  status: string;
  created_at: string;
  user_reward: {
    id: string;
    reward: Reward;
  };
}

const rarityColors: Record<string, string> = {
  common: "bg-secondary text-secondary-foreground",
  uncommon: "bg-green-500/20 text-green-400 border-green-500/30",
  rare: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  epic: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  legendary: "bg-amber-500/20 text-amber-400 border-amber-500/30",
};

const CreateMarketplaceListing = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [myRewards, setMyRewards] = useState<UserReward[]>([]);
  const [myListings, setMyListings] = useState<MyListing[]>([]);
  const [selectedReward, setSelectedReward] = useState<string>("");
  const [askingDescription, setAskingDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    if (!user) return;

    // Fetch user's rewards
    const { data: rewardsData } = await supabase
      .from("user_rewards")
      .select("id, reward_id")
      .eq("user_id", user.id);

    // Get already listed reward IDs
    const { data: listingsData } = await supabase
      .from("marketplace_listings")
      .select("id, user_reward_id, asking_description, status, created_at")
      .eq("user_id", user.id)
      .eq("status", "active");

    const listedRewardIds = new Set(
      (listingsData || []).map((l) => l.user_reward_id)
    );

    // Enrich rewards with details
    const rewardsWithDetails = await Promise.all(
      (rewardsData || [])
        .filter((r) => !listedRewardIds.has(r.id))
        .map(async (ur) => {
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

    // Enrich listings with reward details
    const listingsWithDetails = await Promise.all(
      (listingsData || []).map(async (listing) => {
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

        return {
          ...listing,
          user_reward: {
            id: listing.user_reward_id,
            reward: reward as Reward,
          },
        };
      })
    );

    setMyRewards(rewardsWithDetails.filter((r) => r.reward));
    setMyListings(listingsWithDetails.filter((l) => l.user_reward.reward));
    setLoading(false);
  };

  const handleCreateListing = async () => {
    if (!user || !selectedReward) return;

    setSubmitting(true);
    const { error } = await supabase.from("marketplace_listings").insert({
      user_id: user.id,
      user_reward_id: selectedReward,
      asking_description: askingDescription || null,
    });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to create listing",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Listing Created!",
        description: "Your reward is now on the marketplace",
      });
      setSelectedReward("");
      setAskingDescription("");
      fetchData();
    }

    setSubmitting(false);
  };

  const handleDeleteListing = async (listingId: string) => {
    setDeleting(listingId);
    const { error } = await supabase
      .from("marketplace_listings")
      .delete()
      .eq("id", listingId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to remove listing",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Listing Removed",
        description: "Your reward has been unlisted",
      });
      fetchData();
    }

    setDeleting(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Create New Listing */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Plus className="w-5 h-5 text-primary" />
          List a Reward
        </h3>

        {myRewards.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">
            You don't have any rewards available to list
          </p>
        ) : (
          <div className="space-y-4">
            <div>
              <Label>Select Reward to List</Label>
              <div className="grid gap-2 mt-2 max-h-[200px] overflow-y-auto">
                {myRewards.map((reward) => (
                  <Card
                    key={reward.id}
                    className={`p-3 cursor-pointer transition-colors ${
                      selectedReward === reward.id
                        ? "border-primary bg-primary/5"
                        : "hover:border-primary/50"
                    }`}
                    onClick={() => setSelectedReward(reward.id)}
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
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="asking">What are you looking for? (Optional)</Label>
              <Textarea
                id="asking"
                placeholder="e.g., Looking for any legendary reward..."
                value={askingDescription}
                onChange={(e) => setAskingDescription(e.target.value)}
                className="mt-2"
              />
            </div>

            <Button
              onClick={handleCreateListing}
              disabled={!selectedReward || submitting}
              className="w-full"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Plus className="w-4 h-4 mr-2" />
              )}
              Create Listing
            </Button>
          </div>
        )}
      </Card>

      {/* My Active Listings */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Package className="w-5 h-5 text-primary" />
          My Active Listings
        </h3>

        {myListings.length === 0 ? (
          <Card className="p-6 text-center">
            <p className="text-muted-foreground">You have no active listings</p>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {myListings.map((listing) => (
              <Card key={listing.id} className="p-4">
                <div className="flex items-start gap-3">
                  <span className="text-3xl">
                    {listing.user_reward.reward.icon}
                  </span>
                  <div className="flex-1">
                    <p className="font-semibold">
                      {listing.user_reward.reward.name}
                    </p>
                    <Badge
                      variant="outline"
                      className={rarityColors[listing.user_reward.reward.rarity]}
                    >
                      {listing.user_reward.reward.rarity}
                    </Badge>
                    {listing.asking_description && (
                      <p className="text-sm text-muted-foreground mt-2 italic">
                        "{listing.asking_description}"
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleDeleteListing(listing.id)}
                    disabled={deleting === listing.id}
                  >
                    {deleting === listing.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateMarketplaceListing;
