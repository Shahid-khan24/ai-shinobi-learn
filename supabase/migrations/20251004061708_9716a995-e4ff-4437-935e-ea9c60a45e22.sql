-- Create storage bucket for syllabus files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'syllabus-files',
  'syllabus-files',
  false,
  10485760, -- 10MB limit
  ARRAY['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'application/msword']
);

-- Create RLS policies for syllabus bucket
CREATE POLICY "Users can upload their own syllabus files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'syllabus-files' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own syllabus files"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'syllabus-files' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own syllabus files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'syllabus-files' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Create syllabus table to store metadata
CREATE TABLE public.syllabus (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  extracted_content TEXT,
  topics JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.syllabus ENABLE ROW LEVEL SECURITY;

-- RLS Policies for syllabus table
CREATE POLICY "Users can create their own syllabus"
ON public.syllabus FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own syllabus"
ON public.syllabus FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own syllabus"
ON public.syllabus FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own syllabus"
ON public.syllabus FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_syllabus_updated_at
BEFORE UPDATE ON public.syllabus
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();