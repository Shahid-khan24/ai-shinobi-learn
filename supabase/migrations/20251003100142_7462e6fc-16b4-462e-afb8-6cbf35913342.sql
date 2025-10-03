-- Delete quizzes for Art and Music topics first
DELETE FROM public.quizzes
WHERE topic_id IN (
  SELECT id FROM public.quiz_topics 
  WHERE name IN ('Art', 'Music')
);

-- Now delete the Art and Music topics
DELETE FROM public.quiz_topics
WHERE name IN ('Art', 'Music');