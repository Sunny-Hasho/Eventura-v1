import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuth } from "@/context/AuthContext";
import NotificationDropdown from "./NotificationDropdown";

const Navbar = () => {
  const { authState, logout } = useAuth();
  const { isAuthenticated, user } = authState;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const navLinkClass = (path: string) => `
    text-sm font-medium transition-colors duration-200
    ${location.pathname === path ? 'text-primary font-semibold' : 'text-gray-600 hover:text-primary'}
  `;

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/80 backdrop-blur-md border-b border-gray-100' : 'bg-white border-b border-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <div className="flex items-center gap-12">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="flex items-center gap-2 group">
                {/* Logo Placeholder - consider SVGs for crispness */}
                <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg group-hover:scale-105 transition-transform">
                  E
                </div>
                <span className="text-xl font-bold tracking-tight text-primary">eventura</span>
              </Link>
            </div>
            
            <div className="hidden md:flex space-x-8">
               {/* Simplified Links */}
              <Link to="/" className={navLinkClass('/')}>Find Talent</Link>
              <Link to="/join" className={navLinkClass('/join')}>Find Work</Link>
              <Link to="/why-eventura" className={navLinkClass('/why-eventura')}>Why Eventura</Link>
            </div>
          </div>


          <div className="hidden md:flex items-center gap-6">
             {/* Search or extra links could go here */}

             {/* Right Side Actions */}
             <div className="flex items-center gap-4">
              <NotificationDropdown />
              
              {isAuthenticated ? (
                <div className="flex items-center pl-4 border-l border-gray-200 gap-3">
                  <span className="text-sm font-medium text-gray-700 hidden lg:block">
                    {user?.firstName}
                  </span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="relative h-10 w-10 rounded-full bg-secondary flex items-center justify-center text-primary font-medium hover:ring-2 hover:ring-primary/20 transition-all focus:outline-none">
                        {user?.firstName?.charAt(0) || 'U'}
                        {user?.lastName?.charAt(0) || ''}
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 mt-2">
                       <div className="px-2 py-1.5 text-xs text-gray-500 font-medium pb-2 border-b border-gray-100 mb-1">
                          My Account
                       </div>
                      <DropdownMenuItem asChild>
                        <Link to={user?.role === "ADMIN" ? "/admin" : "/dashboard"} className="cursor-pointer">Dashboard</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/profile" className="cursor-pointer">Profile</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={logout} className="text-red-600 focus:text-red-600 cursor-pointer">
                        Log out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-primary transition-colors">
                    Log In
                  </Link>
                  <Button asChild size="sm" className="px-6 font-semibold shadow-none hover:shadow-md transition-all">
                    <Link to="/register">Join</Link>
                  </Button>
                </div>
              )}
             </div>
          </div>

          <div className="flex items-center md:hidden">
            <button
              type="button"
              className="p-2 -mr-2 text-gray-400 hover:text-gray-500"
              onClick={toggleMobileMenu}
            >
              <span className="sr-only">Open menu</span>
              {mobileMenuOpen ? (
                 <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                 </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-100 absolute w-full pb-4 shadow-lg animate-in slide-in-from-top-5">
          <div className="pt-2 pb-3 space-y-1 px-4">
             <Link to="/" className="block px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:bg-gray-50">Find Talent</Link>
             <Link to="/join" className="block px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:bg-gray-50">Find Work</Link>
             {isAuthenticated && (
                <Link to="/dashboard" className="block px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:bg-gray-50">Dashboard</Link>
             )}
          </div>
          <div className="pt-4 pb-3 border-t border-gray-100 px-4">
            {isAuthenticated ? (
               <div className="space-y-3">
                   <div className="flex items-center px-3">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                          {user?.firstName?.charAt(0)}
                      </div>
                      <div className="ml-3">
                        <div className="text-base font-medium text-gray-800">{user?.firstName} {user?.lastName}</div>
                        <div className="text-sm font-medium text-gray-500">{user?.email}</div>
                      </div>
                   </div>
                   <Button onClick={logout} variant="ghost" className="w-full justify-start text-red-600">
                      Log out
                   </Button>
               </div>
            ) : (
               <div className="space-y-3 px-3">
                  <Link to="/login" className="block text-center w-full py-2 text-gray-600 font-medium">Log In</Link>
                  <Button asChild className="w-full">
                    <Link to="/register">Join Eventura</Link>
                  </Button>
               </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
