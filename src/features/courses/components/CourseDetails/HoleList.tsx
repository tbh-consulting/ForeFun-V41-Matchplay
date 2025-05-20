import React, { useState } from 'react';
import { Flag } from 'lucide-react';
import { CourseHole } from '../../types';
import { DistanceUnitToggle } from './DistanceUnitToggle';
import { metersToYards } from '../../utils/distanceConversion';
import { teeColors } from '../../constants/teeColors';

interface HoleListProps {
  holes?: CourseHole[] | null;
}

export function HoleList({ holes }: HoleListProps) {
  const [unit, setUnit] = useState<'meters' | 'yards'>('meters');
  
  if (!holes || holes.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Flag className="w-5 h-5 text-accent" />
          <h2 className="text-lg font-semibold text-gray-900">Course Details</h2>
        </div>
        <p className="text-gray-500 text-center py-4">Loading hole details...</p>
      </div>
    );
  }

  const validHoles = [...holes].sort((a, b) => a.holeNumber - b.holeNumber);
  const frontNine = validHoles.slice(0, 9);
  const backNine = validHoles.slice(9, 18);

  const getDistance = (meters: number | null) => {
    if (!meters) return '-';
    return unit === 'meters' ? meters : metersToYards(meters);
  };

  const calculateTotal = (holes: CourseHole[], key: typeof teeColors[number]['key']) => {
    return holes.reduce((sum, hole) => sum + (hole[key] || 0), 0);
  };

  const renderTable = (holes: CourseHole[], title: string) => {
    if (holes.length === 0) return null;

    return (
      <div className="overflow-x-auto">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <table className="w-full text-sm border border-gray-200">
          <thead>
            <tr className="bg-gray-800 text-white">
              <th className="px-2 py-1 text-left">Hole</th>
              {holes.map(hole => (
                <th key={hole.id} className="px-2 py-1 text-center">{hole.holeNumber}</th>
              ))}
              <th className="px-2 py-1 text-center">Total</th>
            </tr>
          </thead>
          <tbody>
            {teeColors.map(({ label, key, className }) => (
              <tr key={label} className={className}>
                <td className="px-2 py-1 font-medium">{label}</td>
                {holes.map(hole => (
                  <td key={hole.id} className="px-2 py-1 text-center">
                    {getDistance(hole[key])}
                  </td>
                ))}
                <td className="px-2 py-1 text-center font-bold">
                  {getDistance(calculateTotal(holes, key))}
                </td>
              </tr>
            ))}
            <tr className="bg-gray-100">
              <td className="px-2 py-1 font-medium">Par</td>
              {holes.map(hole => (
                <td key={hole.id} className="px-2 py-1 text-center">{hole.par}</td>
              ))}
              <td className="px-2 py-1 text-center font-bold">
                {holes.reduce((sum, hole) => sum + hole.par, 0)}
              </td>
            </tr>
            <tr>
              <td className="px-2 py-1 font-medium">S.I.</td>
              {holes.map(hole => (
                <td key={hole.id} className="px-2 py-1 text-center">
                  {hole.handicap || '-'}
                </td>
              ))}
              <td className="px-2 py-1"></td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Flag className="w-5 h-5 text-accent" />
          <h2 className="text-lg font-semibold text-gray-900">Course Details</h2>
        </div>
        <DistanceUnitToggle unit={unit} onChange={setUnit} />
      </div>

      <div className="space-y-8">
        {frontNine.length > 0 && renderTable(frontNine, 'Front Nine')}
        {backNine.length > 0 && renderTable(backNine, 'Back Nine')}

        {validHoles.length > 0 && (
          <div className="overflow-x-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Course Totals</h3>
            <table className="w-full text-sm border border-gray-200">
              <thead>
                <tr className="bg-gray-800 text-white">
                  <th className="px-2 py-1 text-left">Total</th>
                  <th className="px-2 py-1 text-center">Front 9</th>
                  <th className="px-2 py-1 text-center">Back 9</th>
                  <th className="px-2 py-1 text-center font-bold">Total</th>
                </tr>
              </thead>
              <tbody>
                {teeColors.map(({ label, key, className }) => (
                  <tr key={label} className={className}>
                    <td className="px-2 py-1 font-medium">{label}</td>
                    <td className="px-2 py-1 text-center">{getDistance(calculateTotal(frontNine, key))}</td>
                    <td className="px-2 py-1 text-center">{getDistance(calculateTotal(backNine, key))}</td>
                    <td className="px-2 py-1 text-center font-bold">
                      {getDistance(calculateTotal(validHoles, key))}
                    </td>
                  </tr>
                ))}
                <tr className="bg-gray-100">
                  <td className="px-2 py-1 font-medium">Par</td>
                  <td className="px-2 py-1 text-center">
                    {frontNine.reduce((sum, hole) => sum + hole.par, 0)}
                  </td>
                  <td className="px-2 py-1 text-center">
                    {backNine.reduce((sum, hole) => sum + hole.par, 0)}
                  </td>
                  <td className="px-2 py-1 text-center font-bold">
                    {validHoles.reduce((sum, hole) => sum + hole.par, 0)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}