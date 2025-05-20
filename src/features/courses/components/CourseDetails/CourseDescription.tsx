import React from 'react';
import { Info } from 'lucide-react';

interface CourseDescriptionProps {
  description?: string;
}

export function CourseDescription({ description }: CourseDescriptionProps) {
  if (!description) return null;

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center space-x-2 mb-4">
        <Info className="w-5 h-5 text-accent" />
        <h2 className="text-lg font-semibold text-gray-900">About this course</h2>
      </div>
      <p className="text-gray-600 whitespace-pre-line">{description}</p>
    </div>
  );
}