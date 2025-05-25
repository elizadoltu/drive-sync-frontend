import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

function Dashboard() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/');
        return;
      }

      const headers = { Authorization: `Bearer ${token}` };
      
      try {
        const userResponse = await axios.get(
          'https://users-dot-cloud-app-455515.lm.r.appspot.com/api/profile', 
          { headers }
        );
        setUser(userResponse.data.user);
        
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to fetch data', error);
        navigate('/');
      }
    };
    
    fetchData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  if (isLoading) return (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
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
      
      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome, {user.fullName}</h1>
          <p className="mt-1 text-sm text-gray-500">Here's a summary of your latest activity</p>
        </div>
        
          
          
      </main>
    </div>
  );
}

export default Dashboard;
