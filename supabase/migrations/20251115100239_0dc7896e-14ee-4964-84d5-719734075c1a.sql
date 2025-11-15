-- Add experience and level fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN experience_points INTEGER DEFAULT 0,
ADD COLUMN level INTEGER DEFAULT 1;

-- Insert expanded achievement system
INSERT INTO public.achievements (name, description, icon, requirement_type, requirement_value) VALUES
-- Early Achievements
('First Steps', 'Complete your first case', '🎯', 'quizzes_completed', 1),
('Rookie Detective', 'Solve 5 cases', '🔍', 'quizzes_completed', 5),
('Skilled Investigator', 'Solve 10 cases', '🕵️', 'quizzes_completed', 10),
('Veteran Analyst', 'Solve 25 cases', '💼', 'quizzes_completed', 25),
('Master Detective', 'Solve 50 cases', '👔', 'quizzes_completed', 50),
('Legendary Sleuth', 'Solve 100 cases', '🎩', 'quizzes_completed', 100),

-- Score Based Achievements
('Point Collector', 'Earn 100 total points', '💯', 'total_score', 100),
('Score Hunter', 'Earn 500 total points', '🎖️', 'total_score', 500),
('Point Master', 'Earn 1000 total points', '🏆', 'total_score', 1000),
('Elite Scorer', 'Earn 2500 total points', '👑', 'total_score', 2500),
('Ultimate Champion', 'Earn 5000 total points', '💎', 'total_score', 5000),

-- Streak Achievements
('Consistency Beginner', 'Maintain a 3 day streak', '🔥', 'streak', 3),
('Dedicated Analyst', 'Maintain a 7 day streak', '⚡', 'streak', 7),
('Persistent Mind', 'Maintain a 14 day streak', '✨', 'streak', 14),
('Unwavering Focus', 'Maintain a 30 day streak', '🌟', 'streak', 30),
('Eternal Vigilance', 'Maintain a 60 day streak', '⭐', 'streak', 60),
('Supreme Discipline', 'Maintain a 100 day streak', '💫', 'streak', 100),

-- Perfect Score Achievements
('Perfection Seeker', 'Achieve 1 perfect score', '✅', 'perfect_scores', 1),
('Flawless Mind', 'Achieve 5 perfect scores', '✔️', 'perfect_scores', 5),
('Precision Expert', 'Achieve 10 perfect scores', '🎯', 'perfect_scores', 10),
('Genius Level', 'Achieve 25 perfect scores', '🧠', 'perfect_scores', 25),
('Worlds Greatest Detective', 'Achieve 50 perfect scores', '👁️', 'perfect_scores', 50);

-- Function to calculate experience and level based on user stats
CREATE OR REPLACE FUNCTION public.update_user_level()
RETURNS TRIGGER AS $$
DECLARE
  total_exp INTEGER;
  new_level INTEGER;
BEGIN
  -- Calculate total experience (100 exp per quiz, bonus for score)
  total_exp := (NEW.total_quizzes * 100) + (NEW.total_score * 10) + (NEW.current_streak * 50);
  
  -- Calculate level (every 500 exp = 1 level)
  new_level := FLOOR(total_exp / 500) + 1;
  
  -- Update experience and level
  NEW.experience_points := total_exp;
  NEW.level := new_level;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update level when stats change
DROP TRIGGER IF EXISTS update_user_level_trigger ON public.profiles;
CREATE TRIGGER update_user_level_trigger
BEFORE UPDATE ON public.profiles
FOR EACH ROW
WHEN (OLD.total_score IS DISTINCT FROM NEW.total_score 
   OR OLD.total_quizzes IS DISTINCT FROM NEW.total_quizzes 
   OR OLD.current_streak IS DISTINCT FROM NEW.current_streak)
EXECUTE FUNCTION public.update_user_level();

-- Update existing users to have proper levels
UPDATE public.profiles
SET 
  experience_points = (total_quizzes * 100) + (total_score * 10) + (current_streak * 50),
  level = FLOOR(((total_quizzes * 100) + (total_score * 10) + (current_streak * 50)) / 500) + 1
WHERE experience_points = 0;