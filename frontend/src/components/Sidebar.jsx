// Sidebar component - Currently not used but available for future expansion
import { Link } from 'react-router-dom';

function Sidebar() {
  return (
    <aside className="w-64 bg-gray-900 text-white h-screen fixed left-0 top-0 pt-20 hidden lg:block">
      <nav className="p-4 space-y-2">
        <Link to="/" className="block px-4 py-2 rounded hover:bg-gray-800">Dashboard</Link>
        <Link to="/links" className="block px-4 py-2 rounded hover:bg-gray-800">Links</Link>
        <Link to="/logs" className="block px-4 py-2 rounded hover:bg-gray-800">Logs</Link>
        <Link to="/settings" className="block px-4 py-2 rounded hover:bg-gray-800">Settings</Link>
      </nav>
    </aside>
  );
}

export default Sidebar;
