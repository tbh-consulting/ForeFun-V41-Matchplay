import React from 'react';
import { Input } from '@/components/shared/Input';
import { ProfileFormSection } from '../ProfileFormSection';
import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { ProfileFormData } from '../../types';

interface GolfDetailsSectionProps {
  register: UseFormRegister<ProfileFormData>;
  errors: FieldErrors<ProfileFormData>;
}

export function GolfDetailsSection({ register, errors }: GolfDetailsSectionProps) {
  return (
    <ProfileFormSection title="Golf Details">
      <div className="space-y-4">
        <Input
          label="Handicap"
          type="number"
          step="0.1"
          min={-10}
          max={54}
          error={errors.handicap?.message}
          {...register('handicap', { 
            valueAsNumber: true,
            setValueAs: v => v === '' ? null : parseFloat(v)
          })}
        />
        <Input
          label="Home Club"
          error={errors.homeClub?.message}
          {...register('homeClub')}
        />
      </div>
    </ProfileFormSection>
  );
}