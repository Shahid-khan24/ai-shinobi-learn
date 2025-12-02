import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Navigation from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Gift, ArrowLeftRight } from "lucide-react";
import TradeOffersList from "@/components/TradeOffersList";
import CreateTradeOffer from "@/components/CreateTradeOffer";
import GiftReward from "@/components/GiftReward";
import { useToast } from "@/hooks/use-toast";

const Trading = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);

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

          <Tabs defaultValue="offers" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="offers">
                <ArrowLeftRight className="w-4 h-4 mr-2" />
                Trade Offers
              </TabsTrigger>
              <TabsTrigger value="create">
                <ArrowLeftRight className="w-4 h-4 mr-2" />
                Create Trade
              </TabsTrigger>
              <TabsTrigger value="gift">
                <Gift className="w-4 h-4 mr-2" />
                Send Gift
              </TabsTrigger>
            </TabsList>

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