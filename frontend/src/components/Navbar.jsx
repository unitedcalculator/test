import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, Heart } from 'lucide-react';

function Navbar({ setIsAuthenticated }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    setIsAuthenticated(false);
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className=" mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-bold text-xl text-blue-600">
            <div className="bg-blue-600 text-white p-2 rounded-lg">
              <Heart size={20} />
            </div>
            Clocker
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-gray-700 hover:text-blue-600 transition">
              Dashboard
            </Link>
            <Link to="/links" className="text-gray-700 hover:text-blue-600 transition">
              Links
            </Link>
            <Link to="/logs" className="text-gray-700 hover:text-blue-600 transition">
              Logs
            </Link>
            <Link to="/settings" className="text-gray-700 hover:text-blue-600 transition">
              Settings
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-gray-700 hover:text-red-600 transition"
            >
              <LogOut size={18} /> Logout
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 space-y-2">
            <Link
              to="/"
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
            >
              Dashboard
            </Link>
            <Link
              to="/links"
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
            >
              Links
            </Link>
            <Link
              to="/logs"
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
            >
              Logs
            </Link>
            <Link
              to="/settings"
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
            >
              Settings
            </Link>
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 text-gray-700 hover:bg-red-100 rounded flex items-center gap-2"
            >
              <LogOut size={18} /> Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
