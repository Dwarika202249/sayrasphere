import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { useAppDispatch } from '../../app/store';
import { logout } from '../../features/auth/authSlice';
import { Moon, Sun, Menu, X, LayoutDashboard, Zap, LineChart, LogOut, Home } from 'lucide-react';

const Navbar: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Automations', path: '/automation', icon: Zap },
    { name: 'Analytics', path: '/analytics', icon: LineChart },
  ];

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          
          {/* Logo Section */}
          <div className="flex items-center">
             <div className="shrink-0 flex items-center space-x-2 cursor-pointer" onClick={() => navigate('/')}>
               <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                 <Home className="w-5 h-5 text-white" />
               </div>
               <span className="font-bold text-xl text-gray-900 dark:text-white hidden sm:block">SayraSphere</span>
             </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden sm:flex sm:items-center sm:space-x-8">
             {navLinks.map((link) => {
               const Icon = link.icon;
               return (
                 <NavLink
                   key={link.name}
                   to={link.path}
                   className={({ isActive }) => 
                     `inline-flex items-center space-x-2 px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${
                       isActive 
                         ? 'border-indigo-500 text-gray-900 dark:text-white' 
                         : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-700'
                     }`
                   }
                 >
                   <Icon className="w-4 h-4" />
                   <span>{link.name}</span>
                 </NavLink>
               );
             })}
          </div>

          {/* Right side actions (Theme + Logout) for Desktop */}
          <div className="hidden sm:flex sm:items-center sm:space-x-4">
             <button
               onClick={toggleTheme}
               className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
               title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
             >
               {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
             </button>

             <button
               onClick={handleLogout}
               className="inline-flex items-center space-x-2 px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
             >
               <LogOut className="w-4 h-4" />
               <span>Logout</span>
             </button>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden space-x-2">
            <button
               onClick={toggleTheme}
               className="p-2 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
               {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <span className="sr-only">Open main menu</span>
              {mobileMenuOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile menu panel */}
      {mobileMenuOpen && (
        <div className="sm:hidden bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
          <div className="pt-2 pb-3 space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.name}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 pl-3 pr-4 py-3 border-l-4 text-base font-medium transition-colors ${
                      isActive
                        ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-500 text-indigo-700 dark:text-indigo-400'
                        : 'border-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                    }`
                  }
                >
                  <Icon className="w-5 h-5" />
                  <span>{link.name}</span>
                </NavLink>
              );
            })}
          </div>
          <div className="pt-4 pb-4 border-t border-gray-200 dark:border-gray-800">
            <button
              onClick={handleLogout}
              className="flex w-full items-center space-x-3 pl-3 pr-4 py-3 text-base font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Log out</span>
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
