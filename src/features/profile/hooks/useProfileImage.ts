import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/shared/Toast/useToast';

export function useProfileImage(userId: string) {
  const [isUploading, setIsUploading] = useState(false);
  const { addToast } = useToast();

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      setIsUploading(true);

      const fileExt = file.name.split('.').pop();
      const filePath = `${userId}/${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('profile-pictures')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      addToast('error', 'Failed to upload image');
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = async (url: string) => {
    try {
      setIsUploading(true);
      const path = url.split('/').pop();
      
      if (!path) return;

      const { error } = await supabase.storage
        .from('profile-pictures')
        .remove([`${userId}/${path}`]);

      if (error) throw error;
    } catch (error) {
      console.error('Error removing image:', error);
      addToast('error', 'Failed to remove image');
    } finally {
      setIsUploading(false);
    }
  };

  return {
    uploadImage,
    removeImage,
    isUploading
  };
}