-- Create quiz topics table
CREATE TABLE public.quiz_topics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  icon TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create quizzes table
CREATE TABLE public.quizzes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  topic_id UUID NOT NULL REFERENCES public.quiz_topics(id),
  difficulty TEXT NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  questions JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create quiz attempts table
CREATE TABLE public.quiz_attempts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  quiz_id UUID NOT NULL REFERENCES public.quizzes(id),
  score INTEGER NOT NULL DEFAULT 0,
  total_questions INTEGER NOT NULL,
  answers JSONB NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create achievements table
CREATE TABLE public.achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  requirement_type TEXT NOT NULL,
  requirement_value INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user achievements table
CREATE TABLE public.user_achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  achievement_id UUID NOT NULL REFERENCES public.achievements(id),
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

-- Enable RLS
ALTER TABLE public.quiz_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

-- RLS Policies for quiz_topics (public read)
CREATE POLICY "Anyone can view quiz topics"
ON public.quiz_topics FOR SELECT
USING (true);

-- RLS Policies for quizzes (public read)
CREATE POLICY "Anyone can view quizzes"
ON public.quizzes FOR SELECT
USING (true);

-- RLS Policies for quiz_attempts
CREATE POLICY "Users can view their own attempts"
ON public.quiz_attempts FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own attempts"
ON public.quiz_attempts FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- RLS Policies for achievements (public read)
CREATE POLICY "Anyone can view achievements"
ON public.achievements FOR SELECT
USING (true);

-- RLS Policies for user_achievements
CREATE POLICY "Users can view their own achievements"
ON public.user_achievements FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own achievements"
ON public.user_achievements FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Insert initial quiz topics
INSERT INTO public.quiz_topics (name, icon, description) VALUES
('Mathematics', 'Calculator', 'Master mathematical concepts from basic to advanced'),
('Science', 'Flask', 'Explore physics, chemistry, and biology'),
('History', 'Clock', 'Learn about historical events and civilizations'),
('Geography', 'Globe', 'Discover the world and its cultures'),
('Literature', 'BookOpen', 'Study classic and modern literature'),
('Technology', 'Laptop', 'Learn programming and tech concepts');

-- Insert initial achievements
INSERT INTO public.achievements (name, description, icon, requirement_type, requirement_value) VALUES
('First Steps', 'Complete your first quiz', 'Award', 'quizzes_completed', 1),
('Quiz Master', 'Complete 10 quizzes', 'Trophy', 'quizzes_completed', 10),
('Perfect Score', 'Get 100% on any quiz', 'Star', 'perfect_scores', 1),
('Week Warrior', 'Maintain a 7-day streak', 'Flame', 'streak', 7),
('Century Club', 'Score 100 total points', 'Target', 'total_score', 100),
('Knowledge Seeker', 'Complete 50 quizzes', 'GraduationCap', 'quizzes_completed', 50);

-- Function to update user stats after quiz attempt
CREATE OR REPLACE FUNCTION public.update_user_stats_after_quiz()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update user profile stats
  UPDATE public.profiles
  SET 
    total_score = total_score + NEW.score,
    total_quizzes = total_quizzes + 1,
    updated_at = now()
  WHERE user_id = NEW.user_id;
  
  -- Update streak (simplified - checks if quiz was completed today)
  UPDATE public.profiles
  SET current_streak = current_streak + 1
  WHERE user_id = NEW.user_id
  AND NOT EXISTS (
    SELECT 1 FROM public.quiz_attempts
    WHERE user_id = NEW.user_id
    AND DATE(completed_at) = CURRENT_DATE
    AND id != NEW.id
  );
  
  RETURN NEW;
END;
$$;

-- Trigger to update stats after quiz attempt
CREATE TRIGGER on_quiz_attempt_completed
AFTER INSERT ON public.quiz_attempts
FOR EACH ROW
EXECUTE FUNCTION public.update_user_stats_after_quiz();

-- Function to check and award achievements
CREATE OR REPLACE FUNCTION public.check_achievements()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  achievement_record RECORD;
  user_stats RECORD;
  perfect_score_count INTEGER;
BEGIN
  -- Get user stats
  SELECT total_score, total_quizzes, current_streak
  INTO user_stats
  FROM public.profiles
  WHERE user_id = NEW.user_id;
  
  -- Count perfect scores
  SELECT COUNT(*)
  INTO perfect_score_count
  FROM public.quiz_attempts
  WHERE user_id = NEW.user_id
  AND score = total_questions;
  
  -- Check each achievement
  FOR achievement_record IN 
    SELECT * FROM public.achievements
  LOOP
    -- Check if user already has this achievement
    IF NOT EXISTS (
      SELECT 1 FROM public.user_achievements
      WHERE user_id = NEW.user_id
      AND achievement_id = achievement_record.id
    ) THEN
      -- Check if user meets the requirement
      IF (achievement_record.requirement_type = 'quizzes_completed' AND user_stats.total_quizzes >= achievement_record.requirement_value)
        OR (achievement_record.requirement_type = 'total_score' AND user_stats.total_score >= achievement_record.requirement_value)
        OR (achievement_record.requirement_type = 'streak' AND user_stats.current_streak >= achievement_record.requirement_value)
        OR (achievement_record.requirement_type = 'perfect_scores' AND perfect_score_count >= achievement_record.requirement_value)
      THEN
        -- Award the achievement
        INSERT INTO public.user_achievements (user_id, achievement_id)
        VALUES (NEW.user_id, achievement_record.id);
      END IF;
    END IF;
  END LOOP;
  
  RETURN NEW;
END;
$$;

-- Trigger to check achievements after stats update
CREATE TRIGGER on_quiz_stats_updated
AFTER INSERT ON public.quiz_attempts
FOR EACH ROW
EXECUTE FUNCTION public.check_achievements();