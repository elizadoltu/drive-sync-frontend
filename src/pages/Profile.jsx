import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import CarForm from "../components/CarForm";
import Sidebar from "../components/Sidebar";

function Profile() {
  const [profile, setProfile] = useState(null);
  const [profileFormData, setProfileFormData] = useState({
    username: "",
    email: "",
    fullName: "",
  });
  const [carFormData, setCarFormData] = useState({
    plateNumber: "",
    year: "",
    lastRevision: "",
    brand: "",
    model: "",
    gpsId: "",
    averageFuelConsumption: "",
    averageDistanceMade: "",
  });
  const [enrichedCarFormData, setEnrichedCarFormData] = useState({
    make: " ",
    model: " ",
    year: " ",
    fuel_type: " ",
    license_plate: " ",
    co2_emission_rate: " ",
    current_location: " ",
    status: " ",
    total_mileage: " ",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [userCars, setUserCars] = useState([]);
  const [jsonInput, setJsonInput] = useState("");
  const [activeTab, setActiveTab] = useState("profile");
  const [userId, setUserId] = useState(null);
  const [speedWarning, setSpeedWarning] = useState(null);
  const [speedLoading, setSpeedLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const decoded = jwtDecode(token);
      setUserId(decoded.sub);
      console.log(decoded);

      fetchProfile(token);
      fetchSpeedWarning();
    } catch (error) {
      console.error("Failed to decode token", error);
      localStorage.removeItem("token");
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    if (userId && !isLoading) {
      fetchUserCars();
    }
  }, [userId, isLoading]);

  const fetchProfile = async (token) => {
    try {
      const response = await axios.get(
        "https://users-dot-cloud-app-455515.lm.r.appspot.com/api/profile",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProfile(response.data.user);
      setProfileFormData({
        username: response.data.user.username,
        email: response.data.user.email,
        fullName: response.data.user.fullName,
      });
      setIsLoading(false);
    } catch (error) {
      console.error("Failed to fetch profile", error);
    }
  };

  const fetchSpeedWarning = async () => {
    setSpeedLoading(true);
    try {
      const response = await axios.get(
        "https://sendnotif.azurewebsites.net/api/SpeedWarning"
      );
      setSpeedWarning(response.data);
      setSpeedLoading(false);
    } catch (error) {
      console.error("Failed to fetch speed warning", error);
      setSpeedLoading(false);
    }
  };

  const fetchUserCars = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get(
        "https://cars-dot-cloud-app-455515.lm.r.appspot.com/cars",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const filteredCars = response.data.filter(
        (car) => car.ownerId === userId
      );
      setUserCars(filteredCars);
    } catch (error) {
      console.error("Failed to fetch cars", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    try {
      const response = await axios.put(
        "https://users-dot-cloud-app-455515.lm.r.appspot.com/api/profile",
        profileFormData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProfile(response.data.user);
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Failed to update profile", error);
    }
  };

  const handleDeleteProfile = async () => {
    if (
      !window.confirm(
        "Are you sure you want to delete your profile? This action cannot be undone."
      )
    )
      return;
    const token = localStorage.getItem("token");
    try {
      await axios.delete(
        "https://users-dot-cloud-app-455515.lm.r.appspot.com/api/profile",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      localStorage.removeItem("token");
      navigate("/login");
    } catch (error) {
      console.error("Failed to delete profile", error);
    }
  };

  const handleAddCar = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      // Prepare data for the first API call
      const carData = {
        ...carFormData,
        ownerId: userId,
        year: carFormData.year,
        lastRevision: carFormData.lastRevision
          ? new Date(carFormData.lastRevision).toISOString()
          : null,
        averageFuelConsumption: carFormData.averageFuelConsumption,
        averageDistanceMade: carFormData.averageDistanceMade,
      };

      await axios.post(
        "https://cars-dot-cloud-app-455515.lm.r.appspot.com/cars",
        carData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const enrichedCarData = {
        make: carFormData.brand,
        model: carFormData.model,
        year: carFormData.year,
        license_plate: carFormData.plateNumber,
        fuel_type: enrichedCarFormData.fuel_type,
        co2_emission_rate: enrichedCarFormData.co2_emission_rate,
        current_location: enrichedCarFormData.current_location || null,
        status: enrichedCarFormData.status || "active",
        total_mileage: enrichedCarFormData.total_mileage || 0,
      };

      await axios.post(
        "https://firestore-service-dot-cloud-app-455515.lm.r.appspot.com/api/cars",
        enrichedCarData
      );

      setCarFormData({
        plateNumber: "",
        year: "",
        lastRevision: "",
        brand: "",
        model: "",
        gpsId: "",
        averageFuelConsumption: "",
        averageDistanceMade: "",
      });

      setEnrichedCarFormData({
        make: "",
        model: "",
        year: "",
        fuel_type: "",
        license_plate: "",
        co2_emission_rate: "",
        current_location: "",
        status: "",
        total_mileage: "",
      });

      alert("Car added successfully to both systems!");
      fetchUserCars();
      setActiveTab("viewCars");
    } catch (error) {
      console.error("Failed to add car", error);
      alert(
        "Failed to add car: " + (error.response?.data?.error || error.message)
      );
    }
  };

  const handleUploadCars = async () => {
    const token = localStorage.getItem("token");
    try {
      let carsData;
      try {
        carsData = JSON.parse(jsonInput);
      } catch (e) {
        alert("Invalid JSON format. Please check your input.");
        return;
      }

      if (!Array.isArray(carsData)) {
        carsData = [carsData];
      }

      const validCars = carsData.map((car) => ({
        ...car,
        ownerId: userId,
      }));

      const results = await Promise.all(
        validCars.map((car) =>
          axios.post(
            "https://cars-dot-cloud-app-455515.lm.r.appspot.com/cars",
            car,
            { headers: { Authorization: `Bearer ${token}` } }
          )
        )
      );

      alert(`Successfully uploaded ${results.length} cars`);
      setJsonInput("");
      fetchUserCars();
      setActiveTab("viewCars");
    } catch (error) {
      console.error("Failed to upload cars", error);
      alert(
        "Failed to upload cars: " +
          (error.response?.data?.error || error.message)
      );
    }
  };

  const handleDeleteCar = async (carId) => {
    if (!window.confirm("Are you sure you want to delete this car?")) return;
    const token = localStorage.getItem("token");
    try {
      await axios.delete(
        `https://cars-dot-cloud-app-455515.lm.r.appspot.com/cars/${carId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Car deleted successfully!");
      fetchUserCars();
    } catch (error) {
      console.error("Failed to delete car", error);
      alert(
        "Failed to delete car: " +
          (error.response?.data?.error || error.message)
      );
    }
  };

  const refreshSpeedWarning = () => {
    fetchSpeedWarning();
  };

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Account</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your profile and cars
          </p>
        </div>

        {/* Speed Warning Alert */}
        <div className="mb-6">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    Current Speed Status
                  </h3>
                  {speedLoading ? (
                    <p className="text-sm text-gray-500">Loading speed data...</p>
                  ) : speedWarning ? (
                    <div className="mt-2">
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Status:</span>{" "}
                        <span className={`${speedWarning.message === "Speed is acceptable" ? "text-green-600" : "text-red-600"} font-medium`}>
                          {speedWarning.message}
                        </span>
                      </p>
                      {speedWarning.speed && (
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">Current Speed:</span>{" "}
                          {speedWarning.speed} km/h
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No speed data available</p>
                  )}
                </div>
                <button
                  onClick={refreshSpeedWarning}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                >
                  <svg
                    className="-ml-1 mr-2 h-5 w-5 text-gray-500"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Refresh
                </button>
              </div>
            </div>
          </div>
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
          </nav>
        </div>

        {/* Profile Section */}
        {activeTab === "profile" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* View Profile */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  Profile Information
                </h2>
                <p>
                  <strong>Username:</strong> {profile.username}
                </p>
                <p>
                  <strong>Email:</strong> {profile.email}
                </p>
                <p>
                  <strong>Full Name:</strong> {profile.fullName}
                </p>
              </div>
            </div>

            {/* Edit Profile */}
            <form
              onSubmit={handleUpdateProfile}
              className="bg-white overflow-hidden shadow rounded-lg px-4 py-5 sm:p-6"
            >
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Edit Profile
              </h2>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Username
                </label>
                <input
                  type="text"
                  name="username"
                  value={profileFormData.username}
                  onChange={(e) =>
                    setProfileFormData({
                      ...profileFormData,
                      username: e.target.value,
                    })
                  }
                  required
                  className="w-full p-2 border rounded-md"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={profileFormData.email}
                  onChange={(e) =>
                    setProfileFormData({
                      ...profileFormData,
                      email: e.target.value,
                    })
                  }
                  required
                  className="w-full p-2 border rounded-md"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={profileFormData.fullName}
                  onChange={(e) =>
                    setProfileFormData({
                      ...profileFormData,
                      fullName: e.target.value,
                    })
                  }
                  required
                  className="w-full p-2 border rounded-md"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Update Profile
              </button>
            </form>

            {/* Delete Profile */}
            <div className="md:col-span-2">
              <button
                onClick={handleDeleteProfile}
                className="px-4 py-2 mt-2 rounded-md text-white bg-red-600 hover:bg-red-700"
              >
                Delete Profile
              </button>
            </div>
          </div>
        )}

        {/* View Cars Section */}
        {activeTab === "viewCars" && (
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                My Cars
              </h2>

              {userCars.length === 0 ? (
                <p className="text-gray-500">You haven't added any cars yet.</p>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {userCars.map((car) => (
                    <div
                      key={car._id}
                      className="border rounded-lg p-4 relative"
                    >
                      <button
                        onClick={() => handleDeleteCar(car._id)}
                        className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                      >
                        ✕
                      </button>
                      <h3 className="font-bold text-lg">
                        {car.brand} {car.model}
                      </h3>
                      <p>
                        <strong>Plate:</strong> {car.plateNumber}
                      </p>
                      <p>
                        <strong>Year:</strong> {car.year}
                      </p>
                      <p>
                        <strong>Last Revision:</strong>{" "}
                        {car.lastRevision
                          ? new Date(car.lastRevision).toLocaleDateString()
                          : "N/A"}
                      </p>
                      <p>
                        <strong>GPS ID:</strong> {car.gpsId || "N/A"}
                      </p>
                      <p>
                        <strong>Avg. Fuel Consumption:</strong>{" "}
                        {car.averageFuelConsumption} L/100km
                      </p>
                      <p>
                        <strong>Avg. Distance:</strong>{" "}
                        {car.averageDistanceMade} km/year
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "addCar" && (
          <CarForm
            carFormData={carFormData}
            setCarFormData={setCarFormData}
            enrichedCarFormData={enrichedCarFormData}
            setEnrichedCarFormData={setEnrichedCarFormData}
            handleAddCar={handleAddCar}
          />
        )}

        {/* Upload Cars Section */}
        {activeTab === "uploadCars" && (
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Upload Multiple Cars
              </h2>

              <div className="mb-4">
                <p className="text-gray-600 mb-2">
                  Paste JSON data for multiple cars. Each car should follow this
                  structure:
                </p>
                <pre className="bg-gray-100 p-4 rounded-md text-sm overflow-auto">
                  {`[
  {
    "plateNumber": "ABC123",
    "year": 2020,
    "lastRevision": "2023-01-15T00:00:00.000Z",
    "brand": "Toyota",
    "model": "Corolla",
    "gpsId": "GPS001",
    "averageFuelConsumption": 6.5,
    "averageDistanceMade": 15000
  },
  {
    "plateNumber": "XYZ789",
    "year": 2019,
    "brand": "Honda",
    "model": "Civic",
    "averageFuelConsumption": 7.2,
    "averageDistanceMade": 12000
  }
]`}
                </pre>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  JSON Data
                </label>
                <textarea
                  value={jsonInput}
                  onChange={(e) => setJsonInput(e.target.value)}
                  className="w-full p-2 border rounded-md h-64 font-mono"
                  placeholder="Paste your JSON here..."
                />
              </div>

              <button
                onClick={handleUploadCars}
                className="px-4 py-2 rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Upload Cars
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default Profile;