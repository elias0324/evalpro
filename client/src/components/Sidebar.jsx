import React, { useState, useEffect } from 'react';
import { assets } from '../assets/assets';
import { useNavigate } from 'react-router-dom';
import { Home, FileText, BookOpen, Award, Users, Bell, Settings, Menu, X, LogOut, LogIn, CheckCircle, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';

// 🔥 API URL from environment variable
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const Sidebar = () => {
  const navigate = useNavigate();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeItem, setActiveItem] = useState('/');
  const [userData, setUserData] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const menuItems = [
    { icon: Home, label: 'Accueil', path: '/' },
    { icon: FileText, label: 'Candidatures', path: '/submissions' },
    { icon: BookOpen, label: 'Publications', path: '/publications' },
    { icon: Award, label: 'Évaluations', path: '/evaluations' },
    { icon: Users, label: 'Profil', path: '/profile' },
    { icon: Bell, label: 'Notifications', path: '/notifications' },
    { icon: Settings, label: 'Paramètres', path: '/settings' },
  ];

  // Fetch user data on component mount
  useEffect(() => {
    fetchUserData();
  }, []);

  // Re-fetch user data when returning to the page
  useEffect(() => {
    const handleFocus = () => {
      fetchUserData();
    };
    
    window.addEventListener('focus', handleFocus);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/user/data`, {
        withCredentials: true
      });
      
      if (response.data.success) {
        setIsLoggedIn(true);
        setUserData(response.data.userData);
      } else {
        setIsLoggedIn(false);
        setUserData(null);
      }
    } catch (error) {
      setIsLoggedIn(false);
      setUserData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const { data } = await axios.post(`${API_URL}/api/auth/logout`, {}, {
        withCredentials: true
      });

      if (data.success) {
        toast.success('Déconnexion réussie');
        setIsLoggedIn(false);
        setUserData(null);
        localStorage.removeItem('token');
        navigate('/login');
      }
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Erreur lors de la déconnexion');
    }
  };

  const sendVerificationOtp = async () => {
    try {
      axios.defaults.withCredentials = true;
      const { data } = await axios.post(`${API_URL}/api/auth/send-verify-otp`);
      if (data.success) {
        navigate('/email-verify');
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de l\'envoi de l\'OTP');
    }
  };

  const handleNavigation = (path) => {
    setActiveItem(path);
    navigate(path);
    setIsMobileOpen(false);
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <>
      {/* Mobile Toggle Button - Only visible on mobile */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-slate-800 text-white rounded-lg shadow-lg hover:bg-slate-700 transition-colors"
      >
        {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen bg-gradient-to-b from-slate-800 to-slate-900 text-white transition-all duration-300 shadow-xl flex flex-col ${
          isMobileOpen 
            ? 'translate-x-0 w-64' 
            : '-translate-x-full md:translate-x-0'
        } ${
          isCollapsed ? 'md:w-20' : 'md:w-64'
        }`}
      >
        {/* Logo Section with integrated toggle */}
        <div className="flex items-center justify-between h-20 border-b border-slate-700 px-4">
          {/* Logo - Left side */}
          <div 
            className="flex items-center cursor-pointer"
            onClick={() => handleNavigation('/')}
          >
            <img 
              src={isCollapsed ? "/evalpro.jpg" : assets.logo}
              alt="EvalPro Logo" 
              className={`object-contain transition-all duration-300 ${
                isCollapsed ? 'h-10 w-10' : 'h-12 w-auto'
              }`}
            />
          </div>

          {/* Desktop Toggle Button - Right side, always visible on desktop */}
          <button
            onClick={toggleCollapse}
            className="hidden md:flex p-2 hover:bg-slate-700 rounded-lg transition-colors flex-shrink-0"
          >
            <Menu size={20} />
          </button>

          {/* Mobile Close Button */}
          <button 
            onClick={() => setIsMobileOpen(false)}
            className="md:hidden p-2 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.path}
              onClick={() => handleNavigation(item.path)}
              className={`flex items-center w-full px-4 py-3 rounded-lg transition-all duration-200 relative group ${
                activeItem === item.path
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-slate-300 hover:bg-slate-700 hover:text-white'
              } ${isCollapsed ? 'md:justify-center md:px-2' : 'gap-4'}`}
              title={isCollapsed ? item.label : ''}
            >
              <item.icon size={22} className="flex-shrink-0" />
              <span className={`font-medium text-sm transition-all duration-300 ${
                isCollapsed ? 'md:hidden' : ''
              }`}>
                {item.label}
              </span>
              
              {/* Tooltip for collapsed state */}
              {isCollapsed && (
                <div className="hidden md:block absolute left-full ml-2 px-2 py-1 bg-slate-700 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                  {item.label}
                </div>
              )}
            </button>
          ))}
        </nav>

        {/* User Profile Section */}
        {isLoggedIn && userData && (
          <div className={`px-4 py-4 border-t border-slate-700 bg-slate-800/50 ${isCollapsed ? 'md:px-2' : ''}`}>
            {/* User Avatar & Basic Info */}
            {!isCollapsed && (
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-lg font-bold flex-shrink-0 shadow-lg">
                  {userData.firstname?.charAt(0)?.toUpperCase()}{userData.lastname?.charAt(0)?.toUpperCase()}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">
                    {userData.firstname} {userData.lastname}
                  </p>
                  <p className="text-xs text-slate-400 truncate">
                    {userData.email}
                  </p>
                </div>
              </div>
            )}

            {/* Collapsed User Avatar */}
            {isCollapsed && (
              <div className="hidden md:flex justify-center mb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold shadow-lg">
                  {userData.firstname?.charAt(0)?.toUpperCase()}{userData.lastname?.charAt(0)?.toUpperCase()}
                </div>
              </div>
            )}

            {/* Verification Status Badge */}
            {!isCollapsed && (
              <>
                {(userData.IsAccountVerified === true || userData.IsAccountVerified === 'true' || userData.IsAccountVerified === 1 || userData.IsAccountVerified) ? (
                  <div className="flex items-center gap-2 px-3 py-2.5 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-400/40 rounded-lg shadow-sm">
                    <div className="flex items-center justify-center w-5 h-5 bg-green-500 rounded-full">
                      <CheckCircle size={14} className="text-white" />
                    </div>
                    <span className="text-sm font-bold text-green-400">Vérifié</span>
                  </div>
                ) : (
                  <button
                    onClick={sendVerificationOtp}
                    className="flex items-center gap-2 px-3 py-2 bg-yellow-500/20 border border-yellow-500/30 rounded-lg hover:bg-yellow-500/30 transition-all w-full group"
                  >
                    <AlertCircle size={16} className="text-yellow-400 flex-shrink-0" />
                    <div className="flex-1 text-left">
                      <span className="text-xs font-semibold text-yellow-400 block">Non Vérifié</span>
                      <span className="text-xs text-yellow-300/80 group-hover:text-yellow-300">Cliquez pour vérifier</span>
                    </div>
                  </button>
                )}
              </>
            )}

            {/* Collapsed Verification Icon */}
            {isCollapsed && (
              <div className="hidden md:flex justify-center">
                {(userData.IsAccountVerified === true || userData.IsAccountVerified === 'true' || userData.IsAccountVerified === 1 || userData.IsAccountVerified) ? (
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <CheckCircle size={16} className="text-white" />
                  </div>
                ) : (
                  <button
                    onClick={sendVerificationOtp}
                    className="w-8 h-8 bg-yellow-500/30 border border-yellow-500/50 rounded-full flex items-center justify-center hover:bg-yellow-500/40 transition-all"
                    title="Vérifier le compte"
                  >
                    <AlertCircle size={16} className="text-yellow-400" />
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Bottom Section - Login/Logout */}
        <div className="border-t border-slate-700">
          <div className={`p-4 ${isCollapsed ? 'md:px-2' : ''}`}>
            {isLoading ? (
              <div className="flex items-center justify-center py-3">
                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              </div>
            ) : isLoggedIn ? (
              <button 
                onClick={handleLogout}
                className={`flex items-center justify-center gap-3 w-full px-4 py-3 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-all duration-200 shadow-lg ${
                  isCollapsed ? 'md:px-2' : ''
                }`}
                title={isCollapsed ? 'Déconnexion' : ''}
              >
                <LogOut size={20} />
                <span className={`font-medium text-sm ${isCollapsed ? 'md:hidden' : ''}`}>
                  Déconnexion
                </span>
              </button>
            ) : (
              <button 
                onClick={() => handleNavigation('/login')}
                className={`flex items-center justify-center gap-3 w-full px-4 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-all duration-200 shadow-lg ${
                  isCollapsed ? 'md:px-2' : ''
                }`}
                title={isCollapsed ? 'Connexion' : ''}
              >
                <LogIn size={20} />
                <span className={`font-medium text-sm ${isCollapsed ? 'md:hidden' : ''}`}>
                  Connexion
                </span>
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;