import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

function Profile() {
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    fullName: '',
    cars: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const response = await axios.get(
          'https://users-dot-cloud-app-455515.lm.r.appspot.com/api/profile',
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setProfile(response.data.user);
        setFormData({
          username: response.data.user.username,
          email: response.data.user.email,
          fullName: response.data.user.fullName,
          cars: response.data.user.cars.join(', '),
        });
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to fetch profile', error);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      const payload = { ...formData, cars: formData.cars.split(',').map((car) => car.trim()) };
      const response = await axios.put(
        'https://users-dot-cloud-app-455515.lm.r.appspot.com/api/profile',
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProfile(response.data.user);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Failed to update profile', error);
    }
  };

  const handleDeleteProfile = async () => {
    if (!window.confirm('Are you sure you want to delete your profile? This action cannot be undone.')) return;
    const token = localStorage.getItem('token');
    try {
      await axios.delete(
        'https://users-dot-cloud-app-455515.lm.r.appspot.com/api/profile',
        { headers: { Authorization: `Bearer ${token}` } }
      );
      localStorage.removeItem('token');
      navigate('/login');
    } catch (error) {
      console.error('Failed to delete profile', error);
    }
  };

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50">
       <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="uppercase leading-none">
            <p className="font-bold">drive sync</p>
            <p className="opacity-50 text-sm">car management app</p>
          </div>
          
          <div className="flex space-x-4">
            
            <Link to="/user/profile" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100">
              Profile
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
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="mt-1 text-sm text-gray-500">Manage your account details below</p>
        </div>

        {/* Profile Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* View Profile */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Profile Information</h2>
              <p><strong>Username:</strong> {profile.username}</p>
              <p><strong>Email:</strong> {profile.email}</p>
              <p><strong>Full Name:</strong> {profile.fullName}</p>
              <p><strong>Cars:</strong> {profile.cars.join(', ')}</p>
            </div>
          </div>

          {/* Edit Profile */}
          <form onSubmit={handleUpdateProfile} className="bg-white overflow-hidden shadow rounded-lg px-4 py-5 sm:p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Edit Profile</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Username</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                required
                className="w-full p-2 border rounded-md"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="w-full p-2 border rounded-md"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                required
                className="w-full p-2 border rounded-md"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Cars (comma-separated)</label>
              <input
                type="text"
                name="cars"
                value={formData.cars}
                onChange={(e) => setFormData({ ...formData, cars: e.target.value })}
                required
                className="w-full p-2 border rounded-md"
              />
            </div>
            <button
              type="submit"
              className={`px-4 py-2 rounded-md text-white bg-blue-600 hover:bg-blue-700`}
            >
              Update Profile
            </button>
          </form>

          {/* Delete Profile */}
          <button
            onClick={handleDeleteProfile}
            className={`px-4 py-2 mt-5 rounded-md text-white bg-red-600 hover:bg-red-700`}
          >
            Delete Profile
          </button>
        </div>
      </main>
    </div>
  );
}

export default Profile;