import React from 'react';
import { Database } from 'lucide-react';

export function ConnectionRequired() {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
      <Database className="w-12 h-12 text-blue-500 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        Database Connection Required
      </h3>
      <p className="text-gray-600 mb-4">
        Please connect to Supabase using the "Connect to Supabase" button in the top right corner to continue.
      </p>
    </div>
  );
}