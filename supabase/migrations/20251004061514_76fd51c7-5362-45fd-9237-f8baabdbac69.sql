-- Add all subtopics to quiz_topics table

-- Islam subtopics
INSERT INTO public.quiz_topics (name, icon, description) VALUES
('Quran', 'BookOpen', 'Test your knowledge of the Holy Quran'),
('Hadiths', 'Scroll', 'Learn about the sayings and teachings of Prophet Muhammad'),
('Mixed', 'Brain', 'Mixed Islamic knowledge including Quran and Hadiths');

-- Tamil subtopics
INSERT INTO public.quiz_topics (name, icon, description) VALUES
('Grammar', 'PenTool', 'Master Tamil grammar rules and structure'),
('Poetry', 'Feather', 'Explore classical and modern Tamil poetry'),
('Stories', 'BookText', 'Discover Tamil literature and storytelling');

-- English subtopics
INSERT INTO public.quiz_topics (name, icon, description) VALUES
('English Grammar', 'FileText', 'Perfect your English grammar skills'),
('English Literature', 'Library', 'Study English literary works and authors'),
('Writing', 'Edit3', 'Improve your English writing abilities'),
('Vocabulary', 'Book', 'Expand your English word knowledge'),
('Comprehension', 'Eye', 'Enhance reading comprehension skills'),
('Speaking', 'Mic', 'Practice English speaking and pronunciation');

-- Computer Science subtopics
INSERT INTO public.quiz_topics (name, icon, description) VALUES
('Programming Basics', 'Code2', 'Learn fundamental programming concepts'),
('Data Structures', 'Database', 'Master data organization and algorithms'),
('Algorithms', 'TrendingUp', 'Study computational problem-solving'),
('Web Development', 'Globe', 'Build modern web applications'),
('Database Systems', 'Server', 'Design and manage databases'),
('Operating Systems', 'Monitor', 'Understand OS fundamentals')
ON CONFLICT (name) DO NOTHING;