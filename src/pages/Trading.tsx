import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import Navigation from "@/components/Navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Gift, ArrowLeftRight, Store } from "lucide-react";
import TradeOffersList from "@/components/TradeOffersList";
import CreateTradeOffer from "@/components/CreateTradeOffer";
import GiftReward from "@/components/GiftReward";
import MarketplaceListing from "@/components/MarketplaceListing";
import CreateMarketplaceListing from "@/components/CreateMarketplaceListing";

const Trading = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    setLoading(false);
  }, [user, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="text-gradient">Trading Hub</span>
            </h1>
            <p className="text-muted-foreground text-lg">
              Trade rewards with other users or send gifts to friends
            </p>
          </div>

          <Tabs defaultValue="marketplace" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="marketplace">
                <Store className="w-4 h-4 mr-2" />
                Marketplace
              </TabsTrigger>
              <TabsTrigger value="list">
                <Store className="w-4 h-4 mr-2" />
                List Item
              </TabsTrigger>
              <TabsTrigger value="offers">
                <ArrowLeftRight className="w-4 h-4 mr-2" />
                Offers
              </TabsTrigger>
              <TabsTrigger value="create">
                <ArrowLeftRight className="w-4 h-4 mr-2" />
                Create Trade
              </TabsTrigger>
              <TabsTrigger value="gift">
                <Gift className="w-4 h-4 mr-2" />
                Gift
              </TabsTrigger>
            </TabsList>

            <TabsContent value="marketplace">
              <MarketplaceListing />
            </TabsContent>

            <TabsContent value="list">
              <CreateMarketplaceListing />
            </TabsContent>

            <TabsContent value="offers">
              <TradeOffersList />
            </TabsContent>

            <TabsContent value="create">
              <CreateTradeOffer />
            </TabsContent>

            <TabsContent value="gift">
              <GiftReward />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Trading;