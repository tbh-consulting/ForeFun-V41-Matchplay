import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Users, Flag, ClipboardList, Trophy } from 'lucide-react';
import { UserMenu } from './UserMenu';
import { NotificationsPopover } from './NotificationsPopover';
import { Logo } from '../common/Logo';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { Button } from '../shared/Button';

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const menuItems = [
    {
      path: '/courses',
      label: 'Golf Courses',
      icon: Flag,
      requiresAuth: true
    },
    {
      path: '/scorecards',
      label: 'Scorecards',
      icon: ClipboardList,
      requiresAuth: true
    },
    {
      path: '/ranking',
      label: 'Rankings',
      icon: Trophy,
      requiresAuth: true
    },
    {
      path: '/friends',
      label: 'Friends',
      icon: Users,
      requiresAuth: true
    }
  ] as const;

  return (
    <nav className="bg-white shadow-sm" role="navigation">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and brand */}
          <Link 
            to={isAuthenticated ? '/dashboard' : '/'} 
            className="flex items-center"
          >
            <Logo />
            <span className="ml-2 text-heading font-bold text-gray-900">ForeFun</span>
          </Link>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated && menuItems.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={`
                  flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors
                  ${isActive(path) 
                    ? 'bg-accent/10 text-accent' 
                    : 'text-gray-600 hover:text-accent hover:bg-accent/5'
                  }
                `}
              >
                <Icon className="w-5 h-5" />
                <span>{label}</span>
              </Link>
            ))}
            {isAuthenticated && (
              <>
                <NotificationsPopover />
                <UserMenu />
              </>
            )}
            {!isAuthenticated && (
              <div className="flex items-center space-x-4">
                <Button variant="secondary" onClick={() => navigate('/login')}>
                  Sign In
                </Button>
                <Button variant="primary" onClick={() => navigate('/register')}>
                  Sign Up
                </Button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-DEFAULT text-secondary hover:text-primary transition-colors duration-DEFAULT"
              aria-expanded={isOpen}
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`md:hidden ${isOpen ? 'block' : 'hidden'}`}
        role="menu"
        aria-orientation="vertical"
      >
        <div className="px-2 pt-2 pb-3 space-y-1">
          {isAuthenticated ? (
            <>
              {menuItems.map(({ path, label, icon: Icon }) => (
                <Link
                  key={path}
                  to={path}
                  className={`
                    flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors w-full
                    ${isActive(path)
                      ? 'bg-accent/10 text-accent'
                      : 'text-gray-600 hover:text-accent hover:bg-accent/5'
                    }
                  `}
                  onClick={() => setIsOpen(false)}
                >
                  <Icon className="w-5 h-5" />
                  <span>{label}</span>
                </Link>
              ))}
              <UserMenu mobile />
            </>
          ) : (
            <div className="space-y-2">
              <Button
                variant="secondary"
                className="w-full"
                onClick={() => navigate('/login')}
              >
                Sign In
              </Button>
              <Button
                variant="primary"
                className="w-full"
                onClick={() => navigate('/register')}
              >
                Sign Up
              </Button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}