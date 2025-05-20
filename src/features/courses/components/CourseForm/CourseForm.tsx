import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/shared/Button';
import { CourseFormData } from '../../types';
import { BasicInfo } from './sections/BasicInfo';
import { HoleDetails } from './sections/HoleDetails';
import { courseFormSchema } from '../../schemas/courseFormSchema';
import { useCourseForm } from '../../hooks/useCourseForm';

interface CourseFormProps {
  onSubmit: (data: CourseFormData) => Promise<void>;
  isLoading?: boolean;
  initialData?: CourseFormData;
  mode?: 'create' | 'edit';
}

export function CourseForm({ 
  onSubmit, 
  isLoading,
  initialData,
  mode = 'create' 
}: CourseFormProps) {
  const form = useForm<CourseFormData>({
    resolver: zodResolver(courseFormSchema),
    defaultValues: initialData || {
      course: {
        holes: 18,
      },
      holes: Array(18).fill(null).map((_, index) => ({
        holeNumber: index + 1,
        par: 4,
        handicap: null,
        distanceBlackMeters: null,
        distanceWhiteMeters: null,
        distanceYellowMeters: null,
        distanceBlueMeters: null,
        distanceRedMeters: null
      })),
    },
  });

  const { handleHolesChange, uploadImage, removeImage } = useCourseForm(form);

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
      <BasicInfo
        form={form}
        onHolesChange={handleHolesChange}
        onImageUpload={uploadImage}
        onImageRemove={removeImage}
      />
      
      <HoleDetails form={form} />

      <div className="flex justify-end pt-4">
        <Button 
          type="submit" 
          isLoading={isLoading}
        >
          {mode === 'create' ? 'Create Course' : 'Save Changes'}
        </Button>
      </div>
    </form>
  );
}