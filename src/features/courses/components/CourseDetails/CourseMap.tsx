import React from 'react';
import { Map } from 'lucide-react';

interface CourseMapProps {
  holes: any[];
}

export function CourseMap({ holes }: CourseMapProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center space-x-2 mb-4">
        <Map className="w-5 h-5 text-accent" />
        <h2 className="text-lg font-semibold text-gray-900">Course Map</h2>
      </div>
      <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
        <p className="text-gray-500 text-sm">Map view coming soon</p>
      </div>
    </div>
  );
}