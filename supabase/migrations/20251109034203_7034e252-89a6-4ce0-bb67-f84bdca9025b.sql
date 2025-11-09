-- Create function to get overall leaderboard with time period filter
CREATE OR REPLACE FUNCTION public.get_overall_leaderboard(time_period TEXT DEFAULT 'all_time')
RETURNS TABLE (
  id UUID,
  display_name TEXT,
  total_score BIGINT,
  total_quizzes BIGINT,
  current_streak INTEGER,
  avatar_url TEXT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    p.id,
    p.display_name,
    COALESCE(SUM(qa.score), 0)::BIGINT as total_score,
    COUNT(qa.id)::BIGINT as total_quizzes,
    p.current_streak,
    p.avatar_url
  FROM profiles p
  LEFT JOIN quiz_attempts qa ON p.user_id = qa.user_id
  WHERE 
    CASE 
      WHEN time_period = 'weekly' THEN qa.completed_at >= NOW() - INTERVAL '7 days'
      WHEN time_period = 'monthly' THEN qa.completed_at >= NOW() - INTERVAL '30 days'
      ELSE TRUE
    END
  GROUP BY p.id, p.display_name, p.current_streak, p.avatar_url
  HAVING COUNT(qa.id) > 0 OR time_period = 'all_time'
  ORDER BY total_score DESC
  LIMIT 50;
$$;

-- Update subject leaderboard function to support time periods
CREATE OR REPLACE FUNCTION public.get_subject_leaderboard(subject_name TEXT, time_period TEXT DEFAULT 'all_time')
RETURNS TABLE (
  user_id UUID,
  display_name TEXT,
  subject_score BIGINT,
  quiz_count BIGINT,
  avatar_url TEXT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    p.user_id,
    p.display_name,
    COALESCE(SUM(qa.score), 0)::BIGINT as subject_score,
    COUNT(qa.id)::BIGINT as quiz_count,
    p.avatar_url
  FROM profiles p
  LEFT JOIN quiz_attempts qa ON p.user_id = qa.user_id
  LEFT JOIN quizzes q ON qa.quiz_id = q.id
  LEFT JOIN quiz_topics qt ON q.topic_id = qt.id
  WHERE qt.name = subject_name
    AND CASE 
      WHEN time_period = 'weekly' THEN qa.completed_at >= NOW() - INTERVAL '7 days'
      WHEN time_period = 'monthly' THEN qa.completed_at >= NOW() - INTERVAL '30 days'
      ELSE TRUE
    END
  GROUP BY p.user_id, p.display_name, p.avatar_url
  HAVING COUNT(qa.id) > 0
  ORDER BY subject_score DESC
  LIMIT 50;
$$;