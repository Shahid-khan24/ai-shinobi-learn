-- Add more subjects to quiz_topics (only new ones)
INSERT INTO quiz_topics (name, icon, description) VALUES
  ('Islam', 'Crescent', 'Learn about Islamic history, teachings, and practices'),
  ('Tamil', 'Languages', 'Master Tamil language, literature, and culture'),
  ('English', 'BookOpen', 'Improve your English language skills and literature knowledge'),
  ('Computer Science', 'Cpu', 'Learn programming, algorithms, and technology'),
  ('Art', 'Palette', 'Discover art history, techniques, and famous artists'),
  ('Music', 'Music', 'Study music theory, instruments, and composers'),
  ('Literature', 'Library', 'Dive into world literature and famous authors')
ON CONFLICT (name) DO NOTHING;
