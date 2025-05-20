import React, { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { CourseFormData } from '../../../types';
import { DistanceUnitToggle } from './DistanceUnitToggle';
import { teeColors } from '../../../constants/teeColors';
import { useDistanceFields } from '../../../hooks/useDistanceFields';

interface HoleDetailsProps {
  form: UseFormReturn<CourseFormData>;
}

export function HoleDetails({ form }: HoleDetailsProps) {
  const { register, watch, setValue } = form;
  const holes = watch('course.holes') || 18;
  const allHoles = watch('holes') || [];
  const [distanceUnit, setDistanceUnit] = useState<'meters' | 'yards'>('meters');
  const { handleDistanceChange, handleUnitChange } = useDistanceFields(form);

  const usedHandicaps = allHoles.map(hole => hole.handicap).filter(Boolean);

  const getHandicapOptions = (currentHoleHandicap?: number | null) => {
    return Array.from({ length: holes }, (_, i) => i + 1)
      .filter(num => !usedHandicaps.includes(num) || num === currentHoleHandicap);
  };

  const onUnitChange = (newUnit: 'yards' | 'meters') => {
    handleUnitChange(newUnit, distanceUnit);
    setDistanceUnit(newUnit);
  };

  const handleParChange = (index: number, value: string) => {
    const par = parseInt(value, 10);
    if (!isNaN(par)) {
      setValue(`holes.${index}.par`, par, { 
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true 
      });
    }
  };

  const handleHandicapChange = (index: number, value: string) => {
    const handicap = value === '' ? null : parseInt(value, 10);
    setValue(`holes.${index}.handicap`, handicap, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true
    });
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Hole Details</h2>
        <DistanceUnitToggle unit={distanceUnit} onChange={onUnitChange} />
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-800 text-white">
              <th className="p-2 text-left">Hole</th>
              <th className="p-2 text-center">Par</th>
              <th className="p-2 text-center">S.I.</th>
              {teeColors.map(({ label }) => (
                <th key={label} className="p-2 text-center">{label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array(holes).fill(0).map((_, index) => {
              const currentHandicap = watch(`holes.${index}.handicap`);
              const handicapOptions = getHandicapOptions(currentHandicap);

              return (
                <tr key={index} className={`${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-gray-100`}>
                  <td className="p-4 font-medium text-gray-900">{index + 1}</td>
                  <td className="p-4">
                    <select
                      value={watch(`holes.${index}.par`)}
                      onChange={(e) => handleParChange(index, e.target.value)}
                      className="w-20 rounded-lg border-gray-200 focus:border-accent focus:ring-accent text-sm"
                    >
                      {[3, 4, 5].map((par) => (
                        <option key={par} value={par}>{par}</option>
                      ))}
                    </select>
                  </td>
                  <td className="p-4">
                    <select
                      value={watch(`holes.${index}.handicap`) || ''}
                      onChange={(e) => handleHandicapChange(index, e.target.value)}
                      className="w-20 rounded-lg border-gray-200 focus:border-accent focus:ring-accent text-sm"
                    >
                      <option value="">S.I.</option>
                      {handicapOptions.map((num) => (
                        <option key={num} value={num}>{num}</option>
                      ))}
                    </select>
                  </td>
                  {teeColors.map(({ key, label, className }) => (
                    <td key={label} className={`p-4 ${className}`}>
                      <input
                        type="number"
                        value={watch(`holes.${index}.${key}`) ?? ''}
                        onChange={(e) => handleDistanceChange(index, key, e.target.value)}
                        className="w-20 rounded-lg border-gray-200 focus:border-accent focus:ring-accent text-sm bg-white"
                        placeholder={distanceUnit}
                      />
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}