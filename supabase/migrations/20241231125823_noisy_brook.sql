-- Create storage bucket for course images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('course-images', 'course-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policy to allow authenticated users to upload their own course images
CREATE POLICY "Users can upload their own course images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'course-images' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to update their own course images
CREATE POLICY "Users can update their own course images"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'course-images' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to delete their own course images
CREATE POLICY "Users can delete their own course images"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'course-images' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow anyone to read course images
CREATE POLICY "Anyone can view course images"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'course-images');

-- Update courses table to use address and country instead of location
ALTER TABLE courses 
DROP COLUMN location,
ADD COLUMN address text NOT NULL,
ADD COLUMN country text NOT NULL;