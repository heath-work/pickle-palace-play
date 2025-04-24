
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, User, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, profile } = useAuth();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  return (
    <nav className="sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center site-logo">
              <span className="text text-2xl font-bold text-pickleball-blue">Pickle Ballers Club</span>
              <img src="public/images/pickle-ballers-club_smiley-logo-device.svg" alt="Pickle Ballers Club Court Logo" width="100" />
            </Link>
          </div>
          
          {/* Desktop nav */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/" className="px-3 py-2 text-white hover:text-pickleball-blue transition-colors">
              Home
            </Link>
            <Link to="/about" className="px-3 py-2 text-white hover:text-pickleball-blue transition-colors">
              About
            </Link>
            <Link to="/membership" className="px-3 py-2 text-white hover:text-pickleball-blue transition-colors">
              Membership
            </Link>
            <Link to="/booking" className="px-3 py-2 text-white hover:text-pickleball-blue transition-colors">
              Book a Court
            </Link>
            <Link to="/group-play" className="px-3 py-2 text-white hover:text-pickleball-yellow transition-colors">
              Group Play
            </Link>
            <Link to="/blog" className="px-3 py-2 text-white hover:text-pickleball-blue transition-colors">
              Blog
            </Link>
            
            {user ? (
              <Link to="/auth/profile" className="flex items-center px-3 py-2 text-gray-700 hover:text-pickleball-blue transition-colors">
                <Avatar className="h-8 w-8 mr-2">
                  <AvatarImage src={profile?.avatar_url || ''} />
                  <AvatarFallback className="bg-pickleball-blue text-white">
                    {profile?.full_name ? getInitials(profile.full_name) : user.email?.[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span>Profile</span>
              </Link>
            ) : (
              <>
                <Link to="/auth/signin">
                  <Button variant="outline" className="flex items-center">
                    <LogIn className="h-4 w-4 mr-2" />
                    Sign In
                  </Button>
                </Link>
                <Link to="/auth/signup">
                  <Button className="bg-pickleball-blue hover:bg-blue-600 text-black">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-pickleball-blue focus:outline-none"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white pb-3 px-2 pt-2">
          <div className="flex flex-col space-y-2">
            <Link
              to="/"
              className="px-3 py-2 text-gray-700 hover:text-pickleball-blue transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/about"
              className="px-3 py-2 text-gray-700 hover:text-pickleball-blue transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              About
            </Link>
            <Link
              to="/membership"
              className="px-3 py-2 text-gray-700 hover:text-pickleball-blue transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Membership
            </Link>
            <Link
              to="/booking"
              className="px-3 py-2 text-gray-700 hover:text-pickleball-blue transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Book a Court
            </Link>
            <Link
              to="/group-play"
              className="px-3 py-2 text-gray-700 hover:text-pickleball-blue transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Group Play
            </Link>
            <Link
              to="/blog"
              className="px-3 py-2 text-gray-700 hover:text-pickleball-blue transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Blog
            </Link>
            
            {user ? (
              <Link 
                to="/auth/profile"
                className="px-3 py-2 text-gray-700 hover:text-pickleball-blue transition-colors flex items-center"
                onClick={() => setIsMenuOpen(false)}
              >
                <Avatar className="h-6 w-6 mr-2">
                  <AvatarImage src={profile?.avatar_url || ''} />
                  <AvatarFallback className="bg-pickleball-blue text-white text-xs">
                    {profile?.full_name ? getInitials(profile.full_name) : user.email?.[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                Profile
              </Link>
            ) : (
              <>
                <Link
                  to="/auth/signin"
                  className="px-3 py-2 text-gray-700 hover:text-pickleball-blue transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  to="/auth/signup"
                  className="px-3 py-2 text-pickleball-blue hover:text-blue-600 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
