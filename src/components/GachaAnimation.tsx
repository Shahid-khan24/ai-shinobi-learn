import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as Icons from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

interface Reward {
  id: string;
  name: string;
  description: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  icon: string;
}

interface GachaAnimationProps {
  rewards: Reward[];
  isOpen: boolean;
  onClose: () => void;
}

const rarityColors = {
  common: "from-gray-400 to-gray-600",
  rare: "from-blue-400 to-blue-600",
  epic: "from-purple-400 to-purple-600",
  legendary: "from-yellow-400 to-orange-600"
};

const rarityGlow = {
  common: "shadow-gray-500/50",
  rare: "shadow-blue-500/50",
  epic: "shadow-purple-500/50",
  legendary: "shadow-yellow-500/50"
};

const GachaAnimation = ({ rewards, isOpen, onClose }: GachaAnimationProps) => {
  const [showRewards, setShowRewards] = useState(false);
  const [currentRewardIndex, setCurrentRewardIndex] = useState(0);

  useEffect(() => {
    if (isOpen) {
      // Delay before showing rewards
      setTimeout(() => setShowRewards(true), 1000);
    } else {
      setShowRewards(false);
      setCurrentRewardIndex(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentReward = rewards[currentRewardIndex];
  const IconComponent: any = Icons[currentReward?.icon as keyof typeof Icons] || Icons.Gift;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={(e) => e.target === e.currentTarget && rewards.length === currentRewardIndex + 1 && onClose()}
      >
        <div className="relative">
          {!showRewards ? (
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.8, type: "spring" }}
              className="relative"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-32 h-32 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center"
              >
                <Sparkles className="w-16 h-16 text-white" />
              </motion.div>
              
              {/* Particle effects */}
              {[...Array(12)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0, x: 0, y: 0 }}
                  animate={{
                    scale: [0, 1, 0],
                    x: Math.cos((i * 30 * Math.PI) / 180) * 100,
                    y: Math.sin((i * 30 * Math.PI) / 180) * 100,
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: i * 0.1,
                  }}
                  className="absolute top-1/2 left-1/2 w-2 h-2 bg-primary rounded-full"
                />
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ scale: 0, rotateY: -180 }}
              animate={{ scale: 1, rotateY: 0 }}
              transition={{ duration: 0.6, type: "spring" }}
              className="bg-background/95 backdrop-blur-sm rounded-2xl p-8 max-w-md w-full shadow-2xl border-2 border-border"
            >
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className={`w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br ${rarityColors[currentReward.rarity]} flex items-center justify-center shadow-2xl ${rarityGlow[currentReward.rarity]}`}
                >
                  <IconComponent className="w-16 h-16 text-white" />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <div className={`inline-block px-4 py-1 rounded-full text-xs font-bold mb-3 bg-gradient-to-r ${rarityColors[currentReward.rarity]} text-white uppercase tracking-wider`}>
                    {currentReward.rarity}
                  </div>
                  
                  <h3 className="text-2xl font-bold mb-2 text-gradient">
                    {currentReward.name}
                  </h3>
                  
                  <p className="text-muted-foreground mb-6">
                    {currentReward.description}
                  </p>

                  {currentRewardIndex < rewards.length - 1 ? (
                    <Button
                      onClick={() => setCurrentRewardIndex(prev => prev + 1)}
                      className="w-full"
                      variant="hero"
                    >
                      Next Reward
                      <Sparkles className="ml-2 w-4 h-4" />
                    </Button>
                  ) : (
                    <Button
                      onClick={onClose}
                      className="w-full"
                      variant="hero"
                    >
                      Awesome!
                    </Button>
                  )}
                </motion.div>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default GachaAnimation;