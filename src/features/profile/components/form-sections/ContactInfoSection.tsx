import React from 'react';
import { Input } from '@/components/shared/Input';
import { ProfileFormSection } from '../ProfileFormSection';
import { SearchableSelect } from '@/components/shared/SearchableSelect/SearchableSelect';
import { UseFormRegister, FieldErrors, UseFormSetValue } from 'react-hook-form';
import { ProfileFormData } from '../../types';
import { countries } from '../../utils/countries';

interface ContactInfoSectionProps {
  register: UseFormRegister<ProfileFormData>;
  setValue: UseFormSetValue<ProfileFormData>;
  errors: FieldErrors<ProfileFormData>;
  values: ProfileFormData;
}

export function ContactInfoSection({ 
  register, 
  setValue,
  errors,
  values 
}: ContactInfoSectionProps) {
  return (
    <ProfileFormSection title="Contact Information">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Phone"
          error={errors.phone?.message}
          {...register('phone')}
        />
        <SearchableSelect
          label="Country"
          options={countries}
          value={values.country || ''}
          onChange={(value) => setValue('country', value)}
          error={errors.country?.message}
        />
        <div className="md:col-span-2">
          <Input
            label="Address"
            error={errors.address?.message}
            {...register('address')}
          />
        </div>
      </div>
    </ProfileFormSection>
  );
}