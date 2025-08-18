'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { userLogout, selectIsAuthenticated, selectUser, selectAuthLoading } from '../../../redux/auth/authSlices';
import { getAuthHeaders, makeApiCall } from '@/app/utils/api';
import axios from 'axios';
import { getUserOrganizations, selectUserOrganizations } from '@/redux/auth/organizationSlice';
import { HelpCircle } from 'lucide-react';


export default function Navbar() {
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
    const fetchOrgs = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/organisations/my-organisations/`);
        setOrgs(res.data || []);
      } catch (err) {
        console.error('Error fetching organizations:', err);
      }
    };
  
    if (isAuthenticated) {
      fetchOrgs();
    }
  }, [isAuthenticated]);

  // useEffect(() => {
  //     dispatch(getUserOrganizations());
  // }, [dispatch]);

  // ✅ Now it's safe to check
  // if (!hasMounted) return null;

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
    <nav className={`sticky top-0 z-50 bg-gradient-to-r from-[#05065E] to-[#0A0DC4] ${scrolled ? 'shadow-md' : ''} transition-shadow duration-300`}>

      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
            <img src="/ab-main-logo.png" alt="AB Logo" className="h-12 w-12 rounded-full bg-white p-1" />
            <span className="text-white italic font-bold text-2xl ml-5">ActionBoard AI</span>
            </Link>
          </div>
          
          {/* Desktop menu */}
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
          {!hasMounted ? (
            // Show skeleton placeholder while mounting
            <div className="flex items-center space-x-4 animate-pulse">
              <div className="w-24 h-6 bg-white/30 rounded-md"></div>
              <div className="w-24 h-6 bg-white/30 rounded-md"></div>
            </div>
          ) : (

            <div className="flex items-center space-x-1 md:space-x-4">
              {isAuthenticated ? (
                // Authenticated user menu
                <>
                  <div className="relative" ref={orgRef}>
                    <button
                      type="button"
                      onClick={() => setOrgsOpen((prev) => !prev)}
                      className="px-3 py-2 rounded-md text-sm font-medium focus:bg-gray-50 hover:bg-gray-50 focus:text-gray-700 text-white hover:text-gray-700 transition-colors"
                    >
                      Organizations
                    </button>

                    {orgsOpen && (
                      <div className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                        <div className="py-1 text-sm text-gray-700">
                            <Link
                              href="/organizations"
                              className="block px-4 py-2 hover:bg-gray-100"
                              onClick={() => setOrgsOpen(false)}
                            >
                              All organizations
                            </Link>
                          {userOrganizations.map((org) => (
                            <Link
                              key={org.org_id}
                              href={`/meetings/${org.org_id}`}
                              className="block px-4 py-2 hover:bg-gray-100"
                              onClick={() => setOrgsOpen(false)}
                            >
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
                      className="px-3 py-2 rounded-md text-sm font-medium focus:bg-gray-50 hover:bg-gray-50 focus:text-gray-700 text-white hover:text-gray-700 transition-colors"
                    >
                      Calendar
                    </button>

                    {calendarOpen && (
                      <div className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                        <div className="py-1 text-sm text-gray-700">
                          <Link
                            href="/calendar"
                            className="block px-4 py-2 hover:bg-gray-100"
                            onClick={() => setCalendarOpen(false)}
                          >
                            Personal
                          </Link>
                          {userOrganizations.map((org) => (
                            <Link
                              key={org.org_id}
                              href={`/calendar/${org.org_id}`}
                              className="block px-4 py-2 hover:bg-gray-100"
                              onClick={() => setCalendarOpen(false)}
                            >
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
                      className="flex items-center space-x-2 text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:bg-gray-50 hover:bg-gray-50 focus:text-gray-700 text-white hover:text-gray-700 px-3 py-2 transition-colors"
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                      aria-expanded={dropdownOpen}
                      aria-haspopup="true"
                    >
                      {/* User avatar */}
                      <div className="h-8 w-8 rounded-full bg-red-500 flex items-center justify-center text-white text-sm font-medium">
                        {getUserInitials()}
                      </div>
                      <span className="font-medium">
                        {getUserDisplayName()}
                      </span>
                      {/* Dropdown arrow */}
                      <svg 
                        className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} 
                        xmlns="http://www.w3.org/2000/svg" 
                        viewBox="0 0 20 20" 
                        fill="currentColor"
                      >
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>

                    {/* Dropdown menu */}
                    {dropdownOpen && (
                        <div className="origin-top-right absolute right-0 mt-2 w-64 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                          <div className="py-1">
                            <Link
                              href="/auth/profile"
                              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                              onClick={() => setDropdownOpen(false)}
                            >
                              <svg className="mr-3 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                              </svg>
                              Profile
                            </Link>
                            <Link
                              href="/help"
                              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                              onClick={() => setDropdownOpen(false)}
                            >
                              {/* <svg
                                  className="mr-3 h-5 w-5 text-gray-400"
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M12 18h.01M12 14a4 4 0 10-4-4m4 4v2m0-6a4 4 0 114-4"
                                  />
                                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
                                </svg> */}

                                <HelpCircle className="mr-3 h-5 w-5 text-gray-400" />
                              Help
                            </Link>
                            <Link
                              href="/configure-meeting-tools"
                              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                              onClick={() => setDropdownOpen(false)}
                            >
                              <svg className="mr-3 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4 3a1 1 0 000 2h12a1 1 0 100-2H4zm0 4a1 1 0 000 2h12a1 1 0 100-2H4zm0 4a1 1 0 000 2h8a1 1 0 100-2H4z" clipRule="evenodd" />
                              </svg>
                              Configure Meeting Platforms
                            </Link>
                            <div className="border-t border-gray-100"></div>
                            <button
                              onClick={handleSignOut}
                              disabled={authLoading}
                              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50"
                            >
                              <svg className="mr-3 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                              </svg>
                              {authLoading ? 'Signing Out...' : 'Logout'}
                            </button>
                          </div>
                        </div>
                      )}

                  </div>
                </>
              ) : (
                // Unauthenticated user menu
                <>
                  <NavLink href="/auth/login" isActive={hasMounted && isActive('/auth/login')}>
                    Sign In
                  </NavLink>
                  <NavLink href="/auth/register" isActive={hasMounted && isActive('/auth/register')}>
                    Sign Up
                  </NavLink>
                </>
              )}
            </div>

          )}
            
          </div>
          
          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-expanded={mobileMenuOpen}
            >
              <span className="sr-only">{mobileMenuOpen ? 'Close main menu' : 'Open main menu'}</span>
              {mobileMenuOpen ? (
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu, show/hide based on menu state */}
        <div 
          className={`sm:hidden absolute top-full left-0 w-full bg-gradient-to-r from-[#05065E] to-[#0A0DC4] z-50 transition-all duration-300 ease-in-out ${
            mobileMenuOpen 
              ? 'translate-y-0 opacity-100' 
              : '-translate-y-4 opacity-0 pointer-events-none'
          }`}
        >
          <div className="px-2 pt-2 pb-3 space-y-1">
            {isAuthenticated ? (
              <>
                {/* User Info */}
                <div className="flex items-center px-3 py-2 text-sm text-white border-b border-gray-700 mb-2">
                  <div className="h-8 w-8 rounded-full bg-red-500 flex items-center justify-center text-white text-sm font-medium mr-3">
                    {getUserInitials()}
                  </div>
                  <span>Welcome, {getUserDisplayName()}</span>
                </div>

                {/* Organizations */}
                <details className="px-3">
                  <summary className="cursor-pointer text-white font-medium py-2">Organizations</summary>
                  <div className="ml-3 space-y-1">
                    <MobileNavLinkDark href="/organizations" onClick={() => setMobileMenuOpen(false)}>
                      All Organizations
                    </MobileNavLinkDark>
                    {userOrganizations.map((org) => (
                      <MobileNavLinkDark key={org.org_id} href={`/meetings/${org.org_id}`} onClick={() => setMobileMenuOpen(false)}>
                        {org.name}
                      </MobileNavLinkDark>
                    ))}
                  </div>
                </details>

                {/* Calendar */}
                <details className="px-3">
                  <summary className="cursor-pointer text-white font-medium py-2">Calendar</summary>
                  <div className="ml-3 space-y-1">
                    <MobileNavLinkDark href="/calendar" onClick={() => setMobileMenuOpen(false)}>Personal</MobileNavLinkDark>
                    {userOrganizations.map((org) => (
                      <MobileNavLinkDark key={org.org_id} href={`/calendar/${org.org_id}`} onClick={() => setMobileMenuOpen(false)}>
                        {org.name}
                      </MobileNavLinkDark>
                    ))}
                  </div>
                </details>

                {/* Configure */}
                <MobileNavLinkDark href="/configure-meeting-tools" onClick={() => setMobileMenuOpen(false)}>
                  Configure Meeting Platforms
                </MobileNavLinkDark>

                {/* Profile */}
                <MobileNavLinkDark href="/auth/profile" onClick={() => setMobileMenuOpen(false)}>
                  Profile
                </MobileNavLinkDark>

                {/* Logout */}
                <button 
                  className="w-full text-left block px-3 py-2 text-base font-medium text-white hover:bg-indigo-600 rounded-md transition-colors disabled:opacity-50"
                  onClick={() => {
                    handleSignOut();
                    setMobileMenuOpen(false);
                  }}
                  disabled={authLoading}
                >
                  {authLoading ? 'Signing Out...' : 'Logout'}
                </button>
              </>
            ) : (
              <>
                <MobileNavLinkDark href="/auth/login" onClick={() => setMobileMenuOpen(false)}>
                  Sign In
                </MobileNavLinkDark>
                <MobileNavLinkDark href="/auth/register" onClick={() => setMobileMenuOpen(false)}>
                  Sign Up
                </MobileNavLinkDark>
              </>
            )}
          </div>
        </div>


    </nav>
  );
}

// Desktop navigation link component
function NavLink({ href, children, isActive }) {
  return (
    <Link 
      href={href} 
      className={`px-3 py-2 rounded-md text-lg font-bold transition-colors ${
        isActive 
          ? 'text-white bg-indigo-700' 
          : 'text-white hover:text-gray-700 hover:bg-gray-50'
      }`}
    >
      {children}
    </Link>
  );
}

// Mobile navigation link component
function MobileNavLink({ href, children, isActive }) {
  return (
    <Link 
      href={href} 
      className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
        isActive 
          ? 'text-indigo-700 bg-indigo-50 border-l-4 border-indigo-500 pl-2' 
          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800 border-l-4 border-transparent'
      }`}
    >
      {children}
    </Link>
  );
}

function MobileNavLinkDark({ href, children, isActive, onClick }) {
  return (
    <Link 
      href={href} 
      onClick={onClick}
      className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
        isActive 
          ? 'bg-indigo-700 text-white border-l-4 border-indigo-400 pl-2' 
          : 'text-white hover:bg-indigo-600 border-l-4 border-transparent'
      }`}
    >
      {children}
    </Link>
  );
}