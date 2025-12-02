-- Create rewards table for gacha system
CREATE TABLE public.rewards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  rarity TEXT NOT NULL CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  icon TEXT NOT NULL,
  reward_type TEXT NOT NULL CHECK (reward_type IN ('badge', 'title', 'xp_boost', 'cosmetic')),
  reward_value JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_rewards table to track earned rewards
CREATE TABLE public.user_rewards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  reward_id UUID NOT NULL REFERENCES public.rewards(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_new BOOLEAN DEFAULT true
);

-- Enable RLS
ALTER TABLE public.rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_rewards ENABLE ROW LEVEL SECURITY;

-- Rewards are viewable by everyone
CREATE POLICY "Rewards are viewable by everyone" 
ON public.rewards 
FOR SELECT 
USING (true);

-- Users can view their own rewards
CREATE POLICY "Users can view their own rewards" 
ON public.user_rewards 
FOR SELECT 
USING (auth.uid() = user_id);

-- Users can insert their own rewards
CREATE POLICY "Users can insert their own rewards" 
ON public.user_rewards 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Users can update their own rewards
CREATE POLICY "Users can update their own rewards" 
ON public.user_rewards 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Insert some default rewards
INSERT INTO public.rewards (name, description, rarity, icon, reward_type, reward_value) VALUES
('Beginner Badge', 'Completed your first quiz!', 'common', 'Award', 'badge', '{"badge": "beginner"}'),
('Quick Thinker', 'Solved 5 quizzes in one day', 'rare', 'Zap', 'badge', '{"badge": "quick_thinker"}'),
('Master Mind', 'Achieved 100% accuracy', 'epic', 'Brain', 'badge', '{"badge": "master_mind"}'),
('Legendary Scholar', 'Completed 100 quizzes', 'legendary', 'Crown', 'badge', '{"badge": "legendary"}'),
('XP Boost x2', 'Double XP for next 3 quizzes', 'rare', 'TrendingUp', 'xp_boost', '{"multiplier": 2, "uses": 3}'),
('XP Boost x3', 'Triple XP for next quiz', 'epic', 'Sparkles', 'xp_boost', '{"multiplier": 3, "uses": 1}'),
('Detective Title', 'Unlock Detective rank title', 'rare', 'Search', 'title', '{"title": "Detective"}'),
('Genius Title', 'Unlock Genius rank title', 'epic', 'Lightbulb', 'title', '{"title": "Genius"}'),
('Cosmic Frame', 'Special profile frame', 'legendary', 'Frame', 'cosmetic', '{"type": "frame", "style": "cosmic"}'),
('Fire Trail', 'Animated fire trail effect', 'epic', 'Flame', 'cosmetic', '{"type": "trail", "style": "fire"}');