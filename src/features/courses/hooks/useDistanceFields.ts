import { UseFormReturn } from 'react-hook-form';
import { CourseFormData } from '../types';
import { yardsToMeters, metersToYards } from '../utils/distanceConversion';

export function useDistanceFields(form: UseFormReturn<CourseFormData>) {
  const { watch, setValue } = form;

  const handleDistanceChange = (
    index: number,
    key: string,
    value: string
  ) => {
    // Convert empty string or 0 to null
    const numValue = value === '' || value === '0' ? null : 
                    isNaN(Number(value)) ? null : Number(value);
    
    // Force update the form value
    setValue(`holes.${index}.${key}`, numValue, { 
      shouldDirty: true,
      shouldTouch: true 
    });
  };

  const handleUnitChange = (
    newUnit: 'yards' | 'meters',
    currentUnit: 'yards' | 'meters'
  ) => {
    if (newUnit === currentUnit) return;

    const conversionFn = newUnit === 'meters' ? yardsToMeters : metersToYards;
    
    const holes = watch('holes') || [];
    holes.forEach((_, index) => {
      const teeKeys = [
        'distanceBlackMeters',
        'distanceWhiteMeters',
        'distanceYellowMeters',
        'distanceBlueMeters',
        'distanceRedMeters'
      ];

      teeKeys.forEach(key => {
        const currentValue = watch(`holes.${index}.${key}`);
        // Only convert if there's a value
        if (currentValue !== null && currentValue !== undefined) {
          setValue(`holes.${index}.${key}`, conversionFn(currentValue));
        }
      });
    });
  };

  return {
    handleDistanceChange,
    handleUnitChange
  };
}