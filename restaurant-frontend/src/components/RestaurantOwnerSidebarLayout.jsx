import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  Home,
  ClipboardList,
  User,
  UtensilsCrossed,
  LogOut,
  Wallet, // ✅ NEW
  Menu,
  X
} from 'lucide-react';

function RestaurantOwnerSidebarLayout() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  const handleLogout = () => {
    // Clear auth token
    localStorage.removeItem('restaurantOwnerToken');
    localStorage.removeItem('token');

    // Navigate to login and replace history (prevents back button)
    navigate('/', { replace: true });
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Mobile Top Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white shadow-sm z-40 flex items-center justify-between px-4">
        <div className="flex gap-2 items-center">
          <img src="/quickbite_logo.svg" alt="QuickBite Logo" className="w-8 h-8" />
          <span className="text-xl font-bold text-black">QuickBite</span>
        </div>
        <button 
          onClick={toggleSidebar}
          className="p-2 text-gray-600 hover:text-gray-900 focus:outline-none"
        >
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed md:sticky top-0 left-0 h-screen w-64 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col p-6 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        {/* Logo + Text */}
        <div className="flex gap-3 items-center mb-6 hidden md:flex">
          <img src="/quickbite_logo.svg" alt="QuickBite Logo" className="w-9 h-9" />
          <span className="text-2xl font-bold text-black">QuickBite</span>
        </div>

        <nav className="flex-1 space-y-2">
          {/* Dashboard */}
          <NavLink
            to="/dashboard"
            end
            onClick={closeSidebar}
            className={({ isActive }) =>
              `flex items-center space-x-2 px-2 py-2 rounded ${isActive ? 'text-red-600 font-bold bg-red-50' : 'text-gray-700'
              } hover:text-red-600 hover:bg-red-50`
            }
          >
            <Home size={20} />
            <span>Dashboard</span>
          </NavLink>

          {/* Orders */}
          <NavLink
            to="/dashboard/orders"
            onClick={closeSidebar}
            className={({ isActive }) =>
              `flex items-center space-x-2 px-2 py-2 rounded ${isActive ? 'text-red-600 font-bold bg-red-50' : 'text-gray-700'
              } hover:text-red-600 hover:bg-red-50`
            }
          >
            <ClipboardList size={20} />
            <span>Orders</span>
          </NavLink>

          {/* ✅ Menu Management (between Orders and Profile) */}
          <NavLink
            to="/dashboard/menu"
            onClick={closeSidebar}
            className={({ isActive }) =>
              `flex items-center space-x-2 px-2 py-2 rounded ${isActive ? 'text-red-600 font-bold bg-red-50' : 'text-gray-700'
              } hover:text-red-600 hover:bg-red-50`
            }
          >
            <UtensilsCrossed size={20} />
            <span>Menu Management</span>
          </NavLink>

          {/* ✅ Payouts (below Menu Management) */}
          <NavLink
            to="/dashboard/payouts"
            onClick={closeSidebar}
            className={({ isActive }) =>
              `flex items-center space-x-2 px-2 py-2 rounded ${isActive ? 'text-red-600 font-bold bg-red-50' : 'text-gray-700'
              } hover:text-red-600 hover:bg-red-50`
            }
          >
            <Wallet size={20} />
            <span>Payouts</span>
          </NavLink>

          {/* Profile Settings */}
          <NavLink
            to="/dashboard/profile"
            onClick={closeSidebar}
            className={({ isActive }) =>
              `flex items-center gap-2 px-2 py-2 rounded ${isActive ? 'text-red-600 font-bold bg-red-50' : 'text-gray-700'
              } hover:text-red-600 hover:bg-red-50`
            }
          >
            <User size={20} />
            <span>Profile Settings</span>
          </NavLink>
        </nav>

        {/* Logout Button at Bottom */}
        <div className="pt-4 mt-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="flex gap-2 items-center px-2 py-2 w-full font-medium text-red-600 rounded hover:bg-red-50"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="overflow-y-auto flex-1 pt-16 md:pt-0 p-4 md:p-8 w-full min-h-screen">
        <Outlet />
      </main>
    </div>
  );
}

export default RestaurantOwnerSidebarLayout;
