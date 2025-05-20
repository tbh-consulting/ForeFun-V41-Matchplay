import React from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';

export function WelcomeHeader() {
  const { user } = useAuth();
  const username = user?.username || 'Golfer';

  return (
    <h1 className="text-heading font-bold text-gray-900 mb-8">
      Welcome back, {username}!
    </h1>
  );
}