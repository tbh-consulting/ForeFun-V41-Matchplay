import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { profileSchema } from '../schemas/profileSchema';
import { ProfileFormData } from '../types';
import { useDebounce } from '@/hooks/useDebounce';

export function useProfileForm(initialData: ProfileFormData, onSubmit: (data: ProfileFormData) => Promise<void>) {
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showOptionalFields, setShowOptionalFields] = useState(false);

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: initialData,
  });

  const values = form.watch();
  const debouncedValues = useDebounce(values, 1000);

  // Auto-save functionality
  useEffect(() => {
    if (hasUnsavedChanges) {
      onSubmit(debouncedValues);
      setHasUnsavedChanges(false);
    }
  }, [debouncedValues, hasUnsavedChanges, onSubmit]);

  // Detect changes
  useEffect(() => {
    const subscription = form.watch(() => setHasUnsavedChanges(true));
    return () => subscription.unsubscribe();
  }, [form.watch]);

  // Warn about unsaved changes before leaving
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  return {
    form,
    showOptionalFields,
    setShowOptionalFields,
    hasUnsavedChanges,
  };
}