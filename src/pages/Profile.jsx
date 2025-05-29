import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import Sidebar from "../components/Sidebar";
import ProfileTab from "../components/ProfileTab";
import MyCarsTab from "../components/MyCarsTab";
import AddCarTab from "../components/AddCarTab";
import UploadCarsTab from "../components/UploadCarsTab";
import AddDestinationTab from "../components/AddDestinationTab";

function Profile() {
  const [user, setUser] = useState(null);
  const [userId, setUserId] = useState(null);
  const [role, setRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("profile");
  const navigate = useNavigate();

  const fetchProfile = async (token) => {
    try {
      const response = await axios.get(
        "https://users-dot-cloud-app-455515.lm.r.appspot.com/api/profile",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setUser(response.data.user);
    } catch (error) {
      console.error("Failed to fetch profile", error);
      localStorage.removeItem("token");
      navigate("/");
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
      return;
    }

    try {
      const decoded = jwtDecode(token);
      setUserId(decoded.sub || decoded._id);
      setRole(decoded.role);

      fetchProfile(token);
      setIsLoading(false);
    } catch (error) {
      console.error("Failed to decode token", error);
      localStorage.removeItem("token");
      navigate("/login");
    }
  }, [navigate]);

  // Set default tab based on role
  useEffect(() => {
    if (role) {
      if (role === "driver") {
        setActiveTab("viewCars");
      } else if (role === "admin") {
        setActiveTab("addCar");
      } else {
        setActiveTab("profile");
      }
    }
  }, [role]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  if (isLoading || !role) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {role === "admin" ? "Admin Dashboard" : "My Account"}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {role === "admin" 
              ? "Manage cars and system administration" 
              : "Manage your profile and cars"
            }
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex -mb-px space-x-8">
            <button
              onClick={() => setActiveTab("profile")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "profile"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Profile
            </button>
            
            
            <button
              onClick={() => setActiveTab("viewCars")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "viewCars"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              My Cars
            </button>
            
            
            {role === "admin" && (
              <>
                <button
                  onClick={() => setActiveTab("addCar")}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === "addCar"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  Add Car
                </button>
                <button
                  onClick={() => setActiveTab("uploadCars")}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === "uploadCars"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  Upload Cars
                </button>
                <button
                  onClick={() => setActiveTab("addDestination")}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === "addDestination"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  Add Destination
                </button>
              </>
            )}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === "profile" && (
          <ProfileTab 
            user={user} 
            setUser={setUser}
            onLogout={handleLogout}
            navigate={navigate}
          />
        )}

        {activeTab === "viewCars" && (
          <MyCarsTab />
        )}

        {activeTab === "addCar" && role === "admin" && (
          <AddCarTab />
        )}

        {activeTab === "uploadCars" && role === "admin" && (
          <UploadCarsTab />
        )}

        {activeTab === "addDestination" && role === "admin" && (
          <AddDestinationTab />
        )}
      </main>
    </div>
  );
}

export default Profile;