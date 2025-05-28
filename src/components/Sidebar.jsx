import { useNavigate, Link } from 'react-router-dom';

const Sidebar = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/');
    };
    
    return (
        <header className="bg-white shadow-sm top-0 left-0 right-0 z-20">
              <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
                <div className="uppercase leading-none">
                  <p className="font-bold">drive sync</p>
                  <p className="opacity-50 text-sm">car management app</p>
                </div>
                
                <div className="flex space-x-4">
                  <Link 
                    to="/user/profile" 
                    className={`px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 relative ${
                      location.pathname === '/user/profile' ? 'nav-active' : ''
                    }`}
                  >
                    Profile
                    {location.pathname === '/user/profile' && (
                      <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#050505]"></span>
                    )}
                  </Link>
                  <Link 
                    to="/dashboard" 
                    className={`px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 relative ${
                      location.pathname === '/dashboard' ? 'nav-active' : ''
                    }`}
                  >
                    Dashboard
                    {location.pathname === '/dashboard' && (
                      <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#050505]"></span>
                    )}
                  </Link>
                  <Link 
                    to="/chatbot" 
                    className={`px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 relative ${
                      location.pathname === '/chatbot' ? 'nav-active' : ''
                    }`}
                  >
                    Chatbot
                    {location.pathname === '/chatbot' && (
                      <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#050505]"></span>
                    )}
                  </Link>
                  <Link 
                    to="/maps" 
                    className={`px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 relative ${
                      location.pathname === '/maps' ? 'nav-active' : ''
                    }`}
                  >
                    Maps
                    {location.pathname === '/maps' && (
                      <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#050505]"></span>
                    )}
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="px-3 py-2 rounded-md text-sm font-medium text-white bg-[#181818] hover:bg-[#333333]"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </header>
    );
}

export default Sidebar;