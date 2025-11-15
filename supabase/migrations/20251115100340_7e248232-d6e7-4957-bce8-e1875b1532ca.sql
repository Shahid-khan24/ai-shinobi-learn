-- Fix security issue: Set search_path for the update_user_level function
-- Drop the trigger first, then recreate the function
DROP TRIGGER IF EXISTS update_user_level_trigger ON public.profiles;
DROP FUNCTION IF EXISTS public.update_user_level() CASCADE;

CREATE OR REPLACE FUNCTION public.update_user_level()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

-- Recreate the trigger
CREATE TRIGGER update_user_level_trigger
BEFORE UPDATE ON public.profiles
FOR EACH ROW
WHEN (OLD.total_score IS DISTINCT FROM NEW.total_score 
   OR OLD.total_quizzes IS DISTINCT FROM NEW.total_quizzes 
   OR OLD.current_streak IS DISTINCT FROM NEW.current_streak)
EXECUTE FUNCTION public.update_user_level();