import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/shared/Button';
import { ProfileFormData } from '../types';
import { ProfileFormSection } from './ProfileFormSection';
import { ProfileImageUpload } from './ProfileImageUpload';
import { useProfileImage } from '../hooks/useProfileImage';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { BasicInfoSection } from './form-sections/BasicInfoSection';
import { GolfDetailsSection } from './form-sections/GolfDetailsSection';
import { ContactInfoSection } from './form-sections/ContactInfoSection';
import { profileSchema } from '../schemas/profileSchema';

interface ProfileFormProps {
  initialData: ProfileFormData;
  onSubmit: (data: ProfileFormData) => Promise<void>;
  onCancel: () => void;
}

export function ProfileForm({ initialData, onSubmit, onCancel }: ProfileFormProps) {
  const { user } = useAuth();
  const { uploadImage, removeImage, isUploading } = useProfileImage(user?.id || '');
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: initialData,
  });

  const values = watch();
  const avatarUrl = watch('avatarUrl');

  const handleImageUpload = async (file: File) => {
    const url = await uploadImage(file);
    if (url) {
      setValue('avatarUrl', url);
    }
  };

  const handleImageRemove = async () => {
    if (avatarUrl) {
      await removeImage(avatarUrl);
      setValue('avatarUrl', '');
    }
  };

  const handleFormSubmit = async (data: ProfileFormData) => {
    try {
      await onSubmit({
        ...data,
        email: initialData.email // Ensure email remains unchanged
      });
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
      <ProfileFormSection title="Profile Picture">
        <ProfileImageUpload
          currentImage={avatarUrl}
          onUpload={handleImageUpload}
          onRemove={handleImageRemove}
          isLoading={isUploading}
        />
      </ProfileFormSection>

      <BasicInfoSection 
        register={register} 
        errors={errors} 
        email={initialData.email}
      />
      <GolfDetailsSection register={register} errors={errors} />
      <ContactInfoSection 
        register={register} 
        setValue={setValue}
        errors={errors}
        values={values}
      />

      <div className="flex flex-col sm:flex-row gap-4 pt-4">
        <Button
          type="submit"
          className="flex-1 sm:flex-none"
          isLoading={isSubmitting || isUploading}
        >
          Save Changes
        </Button>
        <Button
          type="button"
          variant="secondary"
          className="flex-1 sm:flex-none"
          onClick={onCancel}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}