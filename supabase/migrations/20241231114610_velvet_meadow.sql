/*
  # Add additional profile fields

  1. Changes
    - Add new columns to profiles table:
      - full_name (text)
      - home_club (text)
      - language (text)
      - phone (text)
      - address (text)
    - Update avatar_url to handle file storage path
  
  2. Storage
    - Create storage bucket for profile pictures
*/

-- Add new columns to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS full_name text,
ADD COLUMN IF NOT EXISTS home_club text,
ADD COLUMN IF NOT EXISTS language text,
ADD COLUMN IF NOT EXISTS phone text,
ADD COLUMN IF NOT EXISTS address text;

-- Create storage bucket for profile pictures
INSERT INTO storage.buckets (id, name, public) 
VALUES ('profile-pictures', 'profile-pictures', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policy to allow authenticated users to upload their own pictures
CREATE POLICY "Users can upload their own profile picture"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'profile-pictures' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow users to read profile pictures
CREATE POLICY "Anyone can view profile pictures"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'profile-pictures');