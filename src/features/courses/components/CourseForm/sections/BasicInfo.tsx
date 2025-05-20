import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Input } from '@/components/shared/Input';
import { SearchableSelect } from '@/components/shared/SearchableSelect/SearchableSelect';
import { Select } from '@/components/shared/Select';
import { ImageUpload } from '../ImageUpload';
import { countries } from '@/features/profile/utils/countries';
import { CourseFormData } from '../../../types';

interface BasicInfoProps {
  form: UseFormReturn<CourseFormData>;
  onHolesChange: (holes: 9 | 18) => void;
  onImageUpload: (file: File) => Promise<string>;
  onImageRemove: () => Promise<void>;
}

export function BasicInfo({ form, onHolesChange, onImageUpload, onImageRemove }: BasicInfoProps) {
  const { register, setValue, watch, formState: { errors } } = form;
  const imageUrl = watch('course.imageUrl');
  const country = watch('course.country');

  const handleHolesChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = parseInt(e.target.value) as 9 | 18;
    onHolesChange(value);
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Basic Information</h2>
      <div className="space-y-6">
        <Input
          label="Course Name"
          error={errors.course?.name?.message}
          {...register('course.name')}
        />
        
        <Input
          label="Address"
          error={errors.course?.address?.message}
          {...register('course.address')}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SearchableSelect
            label="Country"
            options={countries}
            value={country || ''}
            onChange={(value) => setValue('course.country', value)}
            error={errors.course?.country?.message}
          />
          
          <Select
            label="Dogs Allowed"
            options={[
              { value: 'yes', label: 'Yes' },
              { value: 'no', label: 'No' },
              { value: 'na', label: 'N/A' }
            ]}
            error={errors.course?.dogPolicy?.message}
            {...register('course.dogPolicy')}
          />
        </div>
        
        <Select
          label="Number of Holes"
          options={[
            { value: '9', label: '9' },
            { value: '18', label: '18' }
          ]}
          error={errors.course?.holes?.message}
          {...register('course.holes', {
            valueAsNumber: true,
            onChange: handleHolesChange
          })}
        />
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Course Image
          </label>
          <ImageUpload
            currentImage={imageUrl}
            onUpload={async (file) => {
              const url = await onImageUpload(file);
              setValue('course.imageUrl', url);
            }}
            onRemove={async () => {
              if (imageUrl) {
                await onImageRemove();
                setValue('course.imageUrl', '');
              }
            }}
          />
        </div>
        
        <div>
          <Input
            label="Description"
            error={errors.course?.description?.message}
            {...register('course.description')}
          />
        </div>
      </div>
    </div>
  );
}