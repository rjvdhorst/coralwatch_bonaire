import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const linkClass = (path: string) =>
    `px-4 py-2 rounded-lg transition-colors ${
      isActive(path)
        ? 'bg-blue-500 text-white'
        : 'text-gray-700 hover:bg-blue-100'
    }`;

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Brand */}
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold text-blue-600">
              CoralWatch Bonaire
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="flex space-x-4">
            <Link to="/" className={linkClass('/')}>
              Home
            </Link>
            <Link to="/upload" className={linkClass('/upload')}>
              Upload
            </Link>
            <Link to="/dashboard" className={linkClass('/dashboard')}>
              Dashboard
            </Link>
            <Link to="/dive-sites" className={linkClass('/dive-sites')}>
              Dive Sites
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;