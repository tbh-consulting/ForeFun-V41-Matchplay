import React from 'react';

interface ProfileFormSectionProps {
  title: string;
  children: React.ReactNode;
}

export function ProfileFormSection({ title, children }: ProfileFormSectionProps) {
  return (
    <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm">
      <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
}