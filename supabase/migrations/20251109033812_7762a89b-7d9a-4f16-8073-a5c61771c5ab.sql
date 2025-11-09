-- Create a function to get subject-specific leaderboard
CREATE OR REPLACE FUNCTION public.get_subject_leaderboard(subject_name TEXT)
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
  GROUP BY p.user_id, p.display_name, p.avatar_url
  HAVING COUNT(qa.id) > 0
  ORDER BY subject_score DESC
  LIMIT 50;
$$;