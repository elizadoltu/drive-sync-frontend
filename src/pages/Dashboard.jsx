import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Sidebar from '../components/Sidebar';

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


  if (isLoading) return (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      
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
