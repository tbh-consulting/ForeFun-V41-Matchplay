import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/shared/Button';
import { GolfDetailsSection } from './GolfDetailsSection';
import { ContactInfoSection } from './ContactInfoSection';
import { UseFormReturn } from 'react-hook-form';
import { ProfileFormData } from '../../types';

interface OptionalFieldsProps {
  form: UseFormReturn<ProfileFormData>;
  show: boolean;
  onToggle: () => void;
}

export function OptionalFields({ form, show, onToggle }: OptionalFieldsProps) {
  return (
    <div className="space-y-4">
      <Button
        type="button"
        variant="secondary"
        onClick={onToggle}
        className="w-full flex items-center justify-center gap-2"
      >
        {show ? (
          <>
            <ChevronUp className="w-4 h-4" />
            Show Less
          </>
        ) : (
          <>
            <ChevronDown className="w-4 h-4" />
            Add More Details
          </>
        )}
      </Button>

      {show && (
        <div className="space-y-6 animate-slideDown">
          <GolfDetailsSection register={form.register} errors={form.formState.errors} />
          <ContactInfoSection register={form.register} errors={form.formState.errors} />
        </div>
      )}
    </div>
  );
}