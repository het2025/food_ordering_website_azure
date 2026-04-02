import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  ClipboardDocumentListIcon,
  TruckIcon,
  ClockIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import {
  HomeIcon as HomeIconSolid,
  ClipboardDocumentListIcon as ClipboardSolid,
  TruckIcon as TruckIconSolid,
  ClockIcon as ClockIconSolid,
  UserIcon as UserIconSolid
} from '@heroicons/react/24/solid';

const navItems = [
  { label: 'Home', path: '/dashboard', Icon: HomeIcon, ActiveIcon: HomeIconSolid },
  { label: 'Orders', path: '/orders/available', Icon: ClipboardDocumentListIcon, ActiveIcon: ClipboardSolid },
  { label: 'Active', path: '/orders/active', Icon: TruckIcon, ActiveIcon: TruckIconSolid },
  { label: 'History', path: '/history', Icon: ClockIcon, ActiveIcon: ClockIconSolid },
  { label: 'Profile', path: '/profile', Icon: UserIcon, ActiveIcon: UserIconSolid },
];

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 md:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex">
        {navItems.map(({ label, path, Icon, ActiveIcon }) => {
          const isActive = location.pathname === path;
          const NavIcon = isActive ? ActiveIcon : Icon;
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`relative flex flex-col items-center justify-center flex-1 min-h-[56px] py-2 text-[11px] font-medium transition-colors active:bg-gray-50 ${
                isActive ? 'text-primary' : 'text-gray-400'
              }`}
            >
              {isActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-b-full bg-primary" />
              )}
              <NavIcon className="flex-shrink-0 w-6 h-6 mb-0.5" />
              <span>{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
