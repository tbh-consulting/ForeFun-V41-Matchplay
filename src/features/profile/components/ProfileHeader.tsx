import React from 'react';
import { MapPin } from 'lucide-react';
import { countries } from '../utils/countries';

interface ProfileHeaderProps {
  username: string;
  handicap: number;
  avatarUrl?: string;
  fullName?: string;
  homeClub?: string;
  country?: string;
}

export function ProfileHeader({ 
  username, 
  handicap, 
  avatarUrl,
  fullName,
  homeClub,
  country 
}: ProfileHeaderProps) {
  const countryName = countries.find(c => c.value === country)?.label;

  return (
    <div className="text-center mb-8">
      <div className="relative inline-block">
        <img
          src={avatarUrl || 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?auto=format&fit=crop&q=80&w=200&h=200'}
          alt={`${username}'s avatar`}
          className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
        />
      </div>
      <h1 className="mt-4 text-2xl font-bold text-gray-900">
        {fullName || username}
      </h1>
      {username !== fullName && (
        <p className="text-gray-500">@{username}</p>
      )}
      <div className="flex items-center justify-center gap-2 mt-2 text-gray-600">
        {homeClub && (
          <span className="text-sm">
            {homeClub}
          </span>
        )}
        {countryName && (
          <>
            <span className="text-gray-300">•</span>
            <span className="text-sm flex items-center">
              <MapPin className="w-4 h-4 mr-1" />
              {countryName}
            </span>
          </>
        )}
      </div>
      <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full bg-accent/10 text-accent">
        <span className="text-sm font-medium">
          Handicap: {handicap}
        </span>
      </div>
    </div>
  );
}