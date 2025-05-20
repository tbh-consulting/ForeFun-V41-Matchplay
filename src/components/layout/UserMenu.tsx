import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, LogOut } from 'lucide-react';
import { useAuth } from '@/features/auth/hooks/useAuth';

interface UserMenuProps {
  mobile?: boolean;
}

export function UserMenu({ mobile = false }: UserMenuProps) {
  const navigate = useNavigate();
  const { logout } = useAuth();
  
  const menuItems = [
    { icon: User, label: 'Profile', onClick: () => navigate('/profile') },
    { icon: LogOut, label: 'Sign Out', onClick: () => logout() },
  ];

  if (mobile) {
    return (
      <>
        {menuItems.map(({ icon: Icon, label, onClick }) => (
          <button
            key={label}
            onClick={onClick}
            className="w-full flex items-center px-3 py-2 rounded-DEFAULT text-secondary hover:text-primary hover:bg-gray-50 transition-colors duration-DEFAULT"
          >
            <Icon className="h-5 w-5" />
            <span className="ml-2">{label}</span>
          </button>
        ))}
      </>
    );
  }

  return (
    <>
      {menuItems.map(({ icon: Icon, label, onClick }) => (
        <button
          key={label}
          onClick={onClick}
          className="p-2 text-secondary hover:text-primary rounded-DEFAULT transition-colors duration-DEFAULT"
          aria-label={label}
        >
          <Icon className="h-6 w-6" />
        </button>
      ))}
    </>
  );
}