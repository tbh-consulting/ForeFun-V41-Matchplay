import React from 'react';
import { User, Bell } from 'lucide-react';
import { Logo } from '../common/Logo';
import { DatabaseStatus } from '../shared/DatabaseStatus';

export function Header() {
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Logo />
            <span className="ml-2 text-heading font-bold text-gray-900">ForeFun</span>
          </div>
          <div className="flex items-center space-x-4">
            <DatabaseStatus />
            <button className="p-2 text-secondary hover:text-primary rounded-DEFAULT transition-colors duration-DEFAULT">
              <Bell className="h-6 w-6" />
            </button>
            <button className="p-2 text-secondary hover:text-primary rounded-DEFAULT transition-colors duration-DEFAULT">
              <User className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}