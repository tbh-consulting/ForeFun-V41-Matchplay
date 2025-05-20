import React from 'react';
import { Input } from '@/components/shared/Input';
import { ProfileFormSection } from '../ProfileFormSection';
import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { ProfileFormData } from '../../types';

interface BasicInfoSectionProps {
  register: UseFormRegister<ProfileFormData>;
  errors: FieldErrors<ProfileFormData>;
  email: string;
}

export function BasicInfoSection({ register, errors, email }: BasicInfoSectionProps) {
  return (
    <ProfileFormSection title="Basic Information">
      <div className="space-y-4">
        <Input
          label="Username"
          required
          error={errors.username?.message}
          {...register('username')}
        />
        <Input
          label="Email"
          type="email"
          value={email}
          disabled
          className="bg-gray-50 cursor-not-allowed"
        />
        <Input
          label="Full Name"
          error={errors.fullName?.message}
          {...register('fullName')}
        />
      </div>
    </ProfileFormSection>
  );
}