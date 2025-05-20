import { useCallback } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useToast } from '@/components/shared/Toast/useToast';
import { CourseFormData } from '../types';

export function useCourseForm(form: UseFormReturn<CourseFormData>) {
  const { user } = useAuth();
  const { addToast } = useToast();

  const handleHolesChange = useCallback((holes: 9 | 18) => {
    const newHoles = Array.from({ length: holes }, (_, index) => ({
      holeNumber: index + 1,
      par: 4,
      handicap: null,
      distanceBlackMeters: null,
      distanceWhiteMeters: null,
      distanceYellowMeters: null,
      distanceBlueMeters: null,
      distanceRedMeters: null
    }));

    form.setValue('holes', newHoles);
  }, [form]);

  const uploadImage = async (file: File): Promise<string | null> => {
    if (!user?.id) {
      addToast('error', 'You must be logged in to upload images');
      return null;
    }

    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('course-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('course-images')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      addToast('error', 'Failed to upload image');
      return null;
    }
  };

  const removeImage = async (url: string | null): Promise<void> => {
    if (!user?.id || !url) {
      return;
    }

    try {
      // Extract filename from URL
      const urlParts = url.split('/');
      const filename = urlParts[urlParts.length - 1];
      
      if (!filename) {
        throw new Error('Invalid image URL');
      }

      const filePath = `${user.id}/${filename}`;

      const { error } = await supabase.storage
        .from('course-images')
        .remove([filePath]);

      if (error) throw error;
    } catch (error) {
      console.error('Error removing image:', error);
      addToast('error', 'Failed to remove image');
    }
  };

  return {
    handleHolesChange,
    uploadImage,
    removeImage
  };
}