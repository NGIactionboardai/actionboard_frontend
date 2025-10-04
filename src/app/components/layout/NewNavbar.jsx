'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { userLogout, selectIsAuthenticated, selectUser, selectAuthLoading } from '../../../redux/auth/authSlices';
import { getAuthHeaders, makeApiCall } from '@/app/utils/api';
import axios from 'axios';
import { getUserOrganizations, selectUserOrganizations } from '@/redux/auth/organizationSlice';
import { HelpCircle, ChevronDown, Menu, X, Building2, Calendar, Settings, User, LogOut } from 'lucide-react';

export default function NewNavbar({ variant = "default" }) {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activePath, setActivePath] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [orgsOpen, setOrgsOpen] = useState(false);
  const calendarRef = useRef(null);
  const orgRef = useRef(null);
  const [orgs, setOrgs] = useState([]);


  const authToken = useSelector((state) => state.auth?.token);

  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectUser);
  const authLoading = useSelector(selectAuthLoading);
  const userOrganizations = useSelector(selectUserOrganizations);

  const dropdownRef = useRef(null);

  

  // All hooks are called BEFORE conditional rendering
  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (!hasMounted) return;
    setActivePath(window.location.pathname);
  }, [hasMounted]);

  useEffect(() => {
    if (!hasMounted) return;
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasMounted]);

  useEffect(() => {
    if (!hasMounted) return;
    const handleClickOutside = (event) => {
      if (mobileMenuOpen && !event.target.closest('nav')) {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [mobileMenuOpen, hasMounted]);

  useEffect(() => {
    if (!hasMounted) return;
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [hasMounted]);

  useEffect(() => {
    if (!hasMounted) return;
    const handleResize = () => {
      if (window.innerWidth >= 640 && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [mobileMenuOpen, hasMounted]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setCalendarOpen(false);
      }
      if (orgRef.current && !orgRef.current.contains(event.target)) {
        setOrgsOpen(false);
      }
    };
  
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
      console.log("Dispatched organization")
      dispatch(getUserOrganizations());
  }, [dispatch]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  const navBg =
  variant === "home"
    ? (scrolled || mobileMenuOpen)
      ? "backdrop-blur-md bg-white/95 shadow-sm"
      : "bg-transparent"
    : "backdrop-blur-md bg-white shadow-sm";

  const isActive = (path) => activePath === path;

  const handleSignOut = async () => {
    try {
      await dispatch(userLogout()).unwrap();
      setMobileMenuOpen(false);
      setDropdownOpen(false);
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
      setMobileMenuOpen(false);
      setDropdownOpen(false);
      window.location.href = '/';
    }
  };

  const getUserDisplayName = () => {
    if (!user) return 'User';
    if (user.first_name && user.last_name) return `${user.first_name} ${user.last_name}`;
    if (user.firstName && user.lastName) return `${user.firstName} ${user.lastName}`;
    if (user.name) return user.name;
    if (user.email) return user.email;
    return 'User';
  };

  const getUserInitials = () => {
    const name = getUserDisplayName();
    if (name === 'User') return 'U';
    const words = name.split(' ');
    return words.length >= 2
      ? `${words[0][0]}${words[1][0]}`.toUpperCase()
      : name.substring(0, 2).toUpperCase();
  };

  return (
    <nav
     className={`fixed top-0 left-0 w-full z-50 transition-[background-color,backdrop-filter] duration-300 ${navBg}`}
    >
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center group">
              <div className="relative">
                <img 
                  src="/nous_logo.png" 
                  alt="Nous Meeting Logo" 
                  className="h-12 w-auto transition-transform duration-300 group-hover:scale-105" 
                />
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
              </div>
              {/* <span className="font-bold text-2xl ml-3 bg-gradient-to-r from-[#0A0DC4] to-[#8B0782] bg-clip-text text-transparent">
                Nous Meeting
              </span> */}
            </Link>
          </div>
          
          {/* Desktop menu */}
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
          {!hasMounted ? (
            // Show skeleton placeholder while mounting
            <div className="flex items-center space-x-4 animate-pulse">
              <div className="w-24 h-8 bg-gray-200 rounded-lg"></div>
              <div className="w-24 h-8 bg-gray-200 rounded-lg"></div>
              <div className="w-24 h-8 bg-gray-200 rounded-lg"></div>
            </div>
          ) : (

            <div className="flex items-center space-x-2">
              {isAuthenticated ? (
                // Authenticated user menu
                <>
                  <div className="relative" ref={orgRef}>
                    <button
                      type="button"
                      onClick={() => setOrgsOpen((prev) => !prev)}
                      className="flex items-center px-4 py-2 rounded-xl text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50/50 focus:bg-blue-50 focus:text-blue-600 transition-all duration-200 group"
                    >
                      <Building2 className="w-4 h-4 mr-2 text-gray-500 group-hover:text-blue-500 transition-colors" />
                      Organizations
                      <ChevronDown className={`w-4 h-4 ml-1 text-gray-400 transition-transform duration-200 ${orgsOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {orgsOpen && (
                      <div className="absolute left-0 mt-2 w-56 rounded-xl shadow-lg bg-white/95 backdrop-blur-md ring-1 ring-gray-200/50 z-50 border border-gray-100">
                        <div className="py-2">
                          <Link
                            href="/organizations"
                            className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors mx-2 rounded-lg"
                            onClick={() => setOrgsOpen(false)}
                          >
                            <Building2 className="w-4 h-4 mr-3 text-gray-400" />
                            All organizations
                          </Link>
                          {userOrganizations.length > 0 && (
                            <div className="border-t border-gray-100 my-2"></div>
                          )}
                          {userOrganizations.map((org) => (
                            <Link
                              key={org.org_id}
                              href={`/meetings/${org.org_id}`}
                              className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors mx-2 rounded-lg"
                              onClick={() => setOrgsOpen(false)}
                            >
                              <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                              {org.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="relative" ref={calendarRef}>
                    <button
                      type="button"
                      onClick={() => setCalendarOpen((prev) => !prev)}
                      className="flex items-center px-4 py-2 rounded-xl text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50/50 focus:bg-blue-50 focus:text-blue-600 transition-all duration-200 group"
                    >
                      <Calendar className="w-4 h-4 mr-2 text-gray-500 group-hover:text-blue-500 transition-colors" />
                      Calendar
                      <ChevronDown className={`w-4 h-4 ml-1 text-gray-400 transition-transform duration-200 ${calendarOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {calendarOpen && (
                      <div className="absolute left-0 mt-2 w-56 rounded-xl shadow-lg bg-white/95 backdrop-blur-md ring-1 ring-gray-200/50 z-50 border border-gray-100">
                        <div className="py-2">
                          <Link
                            href="/calendar"
                            className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors mx-2 rounded-lg"
                            onClick={() => setCalendarOpen(false)}
                          >
                            <Calendar className="w-4 h-4 mr-3 text-gray-400" />
                            Personal
                          </Link>
                          {userOrganizations.length > 0 && (
                            <div className="border-t border-gray-100 my-2"></div>
                          )}
                          {userOrganizations.map((org) => (
                            <Link
                              key={org.org_id}
                              href={`/calendar/${org.org_id}`}
                              className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors mx-2 rounded-lg"
                              onClick={() => setCalendarOpen(false)}
                            >
                              <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                              {org.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
            
                  {/* User profile dropdown */}
                  <div className="relative" ref={dropdownRef}>
                    <button
                      type="button"
                      className="flex items-center space-x-3 px-4 py-2 text-sm rounded-xl hover:bg-gray-50 focus:bg-gray-50 transition-all duration-200 group"
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                      aria-expanded={dropdownOpen}
                      aria-haspopup="true"
                    >
                      {/* User avatar */}
                      <div className="h-9 w-9 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium shadow-md group-hover:shadow-lg transition-shadow">
                        {getUserInitials()}
                      </div>
                      <div className="flex flex-col items-start max-w-60">
                        <span className="font-medium text-gray-900 text-sm max-w-45 truncate"
                          title={getUserDisplayName()}
                        >
                          {getUserDisplayName()}
                        </span>
                        <span className="text-xs text-gray-500">
                          {user?.email || 'user@example.com'}
                        </span>
                      </div>
                      {/* Dropdown arrow */}
                      <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Dropdown menu */}
                    {dropdownOpen && (
                        <div className="origin-top-right absolute right-0 mt-2 w-72 rounded-xl shadow-lg bg-white/95 backdrop-blur-md ring-1 ring-gray-200/50 focus:outline-none border border-gray-100">
                          <div className="py-2">
                            {/* User info header */}
                            <div className="px-4 py-3 border-b border-gray-100">
                              <div className="flex items-center space-x-3 min-w-0">
                                <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium">
                                  {getUserInitials()}
                                </div>
                                <div className="min-w-0">
                                <p
                                  className="text-sm font-medium text-gray-900 max-w-36 truncate"
                                  title={getUserDisplayName()}
                                >
                                  {getUserDisplayName()}
                                </p>
                                <p
                                  className="text-xs text-gray-500 truncate"
                                  title={user?.email || 'user@example.com'}
                                >
                                  {user?.email || 'user@example.com'}
                                </p>

                                </div>
                              </div>
                            </div>

                            <div className="py-1">
                              <Link
                                href="/auth/profile"
                                className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors mx-2 rounded-lg"
                                onClick={() => setDropdownOpen(false)}
                              >
                                <User className="mr-3 h-4 w-4 text-gray-400" />
                                Profile Settings
                              </Link>
                              <Link
                                href="/help"
                                className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors mx-2 rounded-lg"
                                onClick={() => setDropdownOpen(false)}
                              >
                                <HelpCircle className="mr-3 h-4 w-4 text-gray-400" />
                                Help & Support
                              </Link>
                              <Link
                                href="/configure-meeting-tools"
                                className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors mx-2 rounded-lg"
                                onClick={() => setDropdownOpen(false)}
                              >
                                <Settings className="mr-3 h-4 w-4 text-gray-400" />
                                Meeting Platforms
                              </Link>
                              <div className="border-t border-gray-100 my-2"></div>
                              <button
                                onClick={handleSignOut}
                                disabled={authLoading}
                                className="flex items-center w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50 mx-2 rounded-lg"
                              >
                                <LogOut className="mr-3 h-4 w-4 text-red-500" />
                                {authLoading ? 'Signing Out...' : 'Sign Out'}
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                  </div>
                </>
              ) : (
                // Unauthenticated user menu
                <div className="flex items-center space-x-3">
                  <NavLink href="/auth/login" isActive={hasMounted && isActive('/auth/login')}>
                    Sign In
                  </NavLink>
                  <NavLink href="/auth/register" isActive={hasMounted && isActive('/auth/register')} isPrimary>
                    Sign Up
                  </NavLink>

                  <NavLink href="/help" isActive={hasMounted && isActive('/help')}>
                    <span className='flex items-center'>

                      <HelpCircle className="mr-2 h-4 w-4" /> Help
                    </span>
                    
                  </NavLink>
                </div>
              )}
            </div>

          )}
            
          </div>
          
          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-xl text-gray-600 hover:text-blue-600 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-expanded={mobileMenuOpen}
            >
              <span className="sr-only">{mobileMenuOpen ? 'Close main menu' : 'Open main menu'}</span>
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu, show/hide based on menu state */}
        <div 
          className={`sm:hidden absolute top-full left-0 w-full bg-white/95 backdrop-blur-md border-b border-gray-200/50 z-50 transition-all duration-300 ease-in-out ${
            mobileMenuOpen 
              ? 'translate-y-0 opacity-100 shadow-lg' 
              : '-translate-y-4 opacity-0 pointer-events-none'
          }`}
        >
          <div className="px-4 pt-4 pb-6 space-y-3">
            {isAuthenticated ? (
              <>
                {/* User Info */}
                <div className="flex items-center px-4 py-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100/50 mb-4">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium mr-3">
                    {getUserInitials()}
                  </div>
                  <div className="min-w-0">
                    <p
                      className="text-sm font-medium text-gray-900 truncate"
                      title={getUserDisplayName()}
                    >
                      Welcome, {getUserDisplayName()}
                    </p>
                    <p
                      className="text-xs text-gray-500 truncate"
                      title={user?.email || 'user@example.com'}
                    >
                      {user?.email || 'user@example.com'}
                    </p>
                  </div>
                </div>

                {/* Organizations */}
                <details className="group">
                  <summary className="cursor-pointer flex items-center px-4 py-3 text-gray-700 font-medium rounded-xl hover:bg-blue-50 transition-colors">
                    <Building2 className="w-5 h-5 mr-3 text-gray-500" />
                    Organizations
                    <ChevronDown className="w-4 h-4 ml-auto text-gray-400 group-open:rotate-180 transition-transform" />
                  </summary>
                  <div className="ml-8 mt-2 space-y-1">
                    <MobileNavLink href="/organizations" onClick={() => setMobileMenuOpen(false)}>
                      All Organizations
                    </MobileNavLink>
                    {userOrganizations.map((org) => (
                      <MobileNavLink key={org.org_id} href={`/meetings/${org.org_id}`} onClick={() => setMobileMenuOpen(false)}>
                        {org.name}
                      </MobileNavLink>
                    ))}
                  </div>
                </details>

                {/* Calendar */}
                <details className="group">
                  <summary className="cursor-pointer flex items-center px-4 py-3 text-gray-700 font-medium rounded-xl hover:bg-blue-50 transition-colors">
                    <Calendar className="w-5 h-5 mr-3 text-gray-500" />
                    Calendar
                    <ChevronDown className="w-4 h-4 ml-auto text-gray-400 group-open:rotate-180 transition-transform" />
                  </summary>
                  <div className="ml-8 mt-2 space-y-1">
                    <MobileNavLink href="/calendar" onClick={() => setMobileMenuOpen(false)}>Personal</MobileNavLink>
                    {userOrganizations.map((org) => (
                      <MobileNavLink key={org.org_id} href={`/calendar/${org.org_id}`} onClick={() => setMobileMenuOpen(false)}>
                        {org.name}
                      </MobileNavLink>
                    ))}
                  </div>
                </details>

                {/* Help */}
                <MobileNavLink href="/help" onClick={() => setMobileMenuOpen(false)} icon={<HelpCircle className="w-5 h-5" />}>
                  Help & Support
                </MobileNavLink>

                {/* Configure */}
                <MobileNavLink href="/configure-meeting-tools" onClick={() => setMobileMenuOpen(false)} icon={<Settings className="w-5 h-5" />}>
                  Meeting Platforms
                </MobileNavLink>

                {/* Profile */}
                <MobileNavLink href="/auth/profile" onClick={() => setMobileMenuOpen(false)} icon={<User className="w-5 h-5" />}>
                  Profile Settings
                </MobileNavLink>

                {/* Logout */}
                <button 
                  className="w-full flex items-center px-4 py-3 text-red-600 font-medium rounded-xl hover:bg-red-50 transition-colors disabled:opacity-50"
                  onClick={() => {
                    handleSignOut();
                    setMobileMenuOpen(false);
                  }}
                  disabled={authLoading}
                >
                  <LogOut className="w-5 h-5 mr-3 text-red-500" />
                  {authLoading ? 'Signing Out...' : 'Sign Out'}
                </button>
              </>
            ) : (
              <div className="space-y-3">
                <MobileNavLink href="/auth/login" onClick={() => setMobileMenuOpen(false)}>
                  Sign In
                </MobileNavLink>
                <MobileNavLink href="/auth/register" onClick={() => setMobileMenuOpen(false)} isPrimary>
                  Sign Up
                </MobileNavLink>
                <MobileNavLink href="/help" onClick={() => setMobileMenuOpen(false)}>
                  <span className='flex items-center'>
                    <HelpCircle className="mr-2 h-4 w-4" /> Help
                  </span>
                </MobileNavLink>
              </div>
            )}
          </div>
        </div>
    </nav>
  );
}

// Desktop navigation link component
function NavLink({ href, children, isActive, isPrimary = false }) {
  if (isPrimary) {
    return (
      <Link 
        href={href} 
        className="px-6 py-2.5 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-[#0A0DC4] to-[#8B0782] hover:from-[#080aa8] hover:to-[#6d0668] shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105"
      >
        {children}
      </Link>
    );
  }

  return (
    <Link 
      href={href} 
      className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
        isActive 
          ? 'text-blue-600 bg-blue-50 shadow-sm' 
          : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50/50'
      }`}
    >
      {children}
    </Link>
  );
}

// Mobile navigation link component
function MobileNavLink({ href, children, isActive, onClick, icon, isPrimary = false }) {
  if (isPrimary) {
    return (
      <Link 
        href={href} 
        onClick={onClick}
        className="flex items-center px-4 py-3 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-[#0A0DC4] to-[#8B0782] shadow-md transition-all duration-200"
      >
        {icon && <span className="mr-3">{icon}</span>}
        {children}
      </Link>
    );
  }

  return (
    <Link 
      href={href} 
      onClick={onClick}
      className={`flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
        isActive 
          ? 'bg-blue-50 text-blue-600 shadow-sm' 
          : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
      }`}
    >
      {icon && <span className="mr-3 text-gray-500">{icon}</span>}
      {children}
    </Link>
  );
}