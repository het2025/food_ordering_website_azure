import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDelivery } from '../context/DeliveryContext';
import { 
  ArrowRightOnRectangleIcon, 
  UserCircleIcon,
  BellIcon 
} from '@heroicons/react/24/outline';

const Header = () => {
  const navigate = useNavigate();
  const { deliveryBoy, logout } = useDelivery();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          {/* Logo */}
          <div className="flex items-center min-w-0">
            <h1 className="text-xl font-bold truncate sm:text-2xl text-primary">QuickBite</h1>
            <span className="ml-1.5 flex-shrink-0 text-xs sm:text-sm text-gray-600">Delivery</span>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Online Status */}
            <div className="flex items-center">
              <div className={`h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full flex-shrink-0 ${deliveryBoy?.isOnline ? 'bg-green-500' : 'bg-gray-400'} mr-1.5`}></div>
              <span className="hidden sm:inline text-sm text-gray-600">
                {deliveryBoy?.isOnline ? 'Online' : 'Offline'}
              </span>
              <span className="sm:hidden text-xs text-gray-600">
                {deliveryBoy?.isOnline ? 'On' : 'Off'}
              </span>
            </div>

            {/* Profile Button */}
            <button
              onClick={() => navigate('/profile')}
              className="flex items-center justify-center w-11 h-11 text-gray-700 rounded-full hover:text-primary hover:bg-gray-100"
              aria-label="Profile"
            >
              <UserCircleIcon className="w-6 h-6" />
            </button>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="flex items-center justify-center w-11 h-11 text-gray-700 rounded-full hover:text-red-600 hover:bg-red-50"
              aria-label="Logout"
            >
              <ArrowRightOnRectangleIcon className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
