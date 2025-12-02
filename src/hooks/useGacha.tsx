import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

interface Reward {
  id: string;
  name: string;
  description: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  icon: string;
  reward_type: string;
  reward_value: any;
}

export const useGacha = () => {
  const { user } = useAuth();
  const [isGachaOpen, setIsGachaOpen] = useState(false);
  const [earnedRewards, setEarnedRewards] = useState<Reward[]>([]);

  const rollGacha = async (score: number, totalQuestions: number): Promise<Reward[]> => {
    if (!user) return [];

    try {
      // Fetch all available rewards
      const { data: allRewards } = await supabase
        .from('rewards')
        .select('*');

      if (!allRewards || allRewards.length === 0) return [];

      // Type cast to Reward[]
      const typedRewards = allRewards as unknown as Reward[];

      // Calculate number of rolls based on score
      const percentage = (score / totalQuestions) * 100;
      let numRolls = 1;
      if (percentage >= 80) numRolls = 2;
      if (percentage >= 95) numRolls = 3;
      if (percentage === 100) numRolls = 4;

      const rewards: Reward[] = [];
      
      for (let i = 0; i < numRolls; i++) {
        const reward = selectRewardByRarity(typedRewards, percentage);
        if (reward) {
          rewards.push(reward);
          
          // Save to database
          await supabase
            .from('user_rewards')
            .insert({
              user_id: user.id,
              reward_id: reward.id,
              is_new: true
            });
        }
      }

      return rewards;
    } catch (error) {
      console.error('Error rolling gacha:', error);
      return [];
    }
  };

  const selectRewardByRarity = (rewards: Reward[], scorePercentage: number): Reward | null => {
    // Adjust drop rates based on score
    let rarityWeights = {
      common: 60,
      rare: 25,
      epic: 10,
      legendary: 5
    };

    // Better scores = better drop rates
    if (scorePercentage >= 90) {
      rarityWeights = { common: 30, rare: 35, epic: 25, legendary: 10 };
    } else if (scorePercentage >= 80) {
      rarityWeights = { common: 40, rare: 35, epic: 20, legendary: 5 };
    }

    // Select rarity
    const rand = Math.random() * 100;
    let cumulative = 0;
    let selectedRarity: string = 'common';

    for (const [rarity, weight] of Object.entries(rarityWeights)) {
      cumulative += weight;
      if (rand <= cumulative) {
        selectedRarity = rarity;
        break;
      }
    }

    // Filter rewards by selected rarity
    const eligibleRewards = rewards.filter(r => r.rarity === selectedRarity);
    
    if (eligibleRewards.length === 0) return null;

    // Random selection from eligible rewards
    return eligibleRewards[Math.floor(Math.random() * eligibleRewards.length)];
  };

  const triggerGacha = async (score: number, totalQuestions: number) => {
    const rewards = await rollGacha(score, totalQuestions);
    if (rewards.length > 0) {
      setEarnedRewards(rewards);
      setIsGachaOpen(true);
    }
  };

  const closeGacha = () => {
    setIsGachaOpen(false);
    setEarnedRewards([]);
  };

  return {
    isGachaOpen,
    earnedRewards,
    triggerGacha,
    closeGacha
  };
};
