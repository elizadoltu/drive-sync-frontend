import { useState, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

function AddDestinationTab() {
  const [destinationFormData, setDestinationFormData] = useState({
    carId: "",
    longitude: null,
    latitude: null,
    company_id: "",
    delivery_address: "",
    weight: null,
    delivery_date: "",
    priority: "medium"
  });
  const [cars, setCars] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingCars, setIsLoadingCars] = useState(true);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    fetchCars();
  }, []);

  const fetchCars = async () => {
    try {
      const token = localStorage.getItem("token");
      const decodedToken = jwtDecode(token);
      console.log("Decoded token:", decodedToken.company);
      const userCompany = decodedToken.company;
      
      setDestinationFormData(prev => ({
        ...prev,
        company_id: userCompany
      }));
      
      const response = await axios.get(
        "https://firestore-service-dot-cloud-app-455515.lm.r.appspot.com/api/cars",
      );
      console.log("Fetched cars:", response.data);
      if (Array.isArray(response.data)) {
        const filteredCars = response.data.filter(car => car.company_id === userCompany);
        console.log("Filtered cars for company", userCompany, ":", filteredCars);
        setCars(filteredCars);
      } else {
        console.error("Fetched data is not an array:", response.data);
        setCars([]);
      }
      setIsLoadingCars(false);
    } catch (error) {
      console.error("Failed to fetch cars", error);
      setMessage({ type: "error", text: "Failed to load cars" });
      setCars([]);
      setIsLoadingCars(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: "", text: "" });

    // Validation
    if (!destinationFormData.carId) {
      setMessage({ type: "error", text: "Please select a car" });
      setIsLoading(false);
      return;
    }

    if (!destinationFormData.delivery_address.trim()) {
      setMessage({ type: "error", text: "Please enter delivery address" });
      setIsLoading(false);
      return;
    }

    if (destinationFormData.longitude === null || destinationFormData.latitude === null) {
      setMessage({ type: "error", text: "Please enter both longitude and latitude" });
      setIsLoading(false);
      return;
    }

    if (Math.abs(destinationFormData.longitude) > 180) {
      setMessage({ type: "error", text: "Longitude must be between -180 and 180" });
      setIsLoading(false);
      return;
    }

    if (Math.abs(destinationFormData.latitude) > 90) {
      setMessage({ type: "error", text: "Latitude must be between -90 and 90" });
      setIsLoading(false);
      return;
    }

    if (destinationFormData.weight === null || destinationFormData.weight <= 0) {
      setMessage({ type: "error", text: "Please enter a valid weight" });
      setIsLoading(false);
      return;
    }

    if (!destinationFormData.delivery_date) {
      setMessage({ type: "error", text: "Please select delivery date" });
      setIsLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "https://users-dot-cloud-app-455515.lm.r.appspot.com/api/destinations", // Adjust API endpoint as needed
        destinationFormData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setMessage({ type: "success", text: "Destination added successfully!" });
      
      setDestinationFormData({
        carId: "",
        longitude: null,
        latitude: null,
        company_id: destinationFormData.company_id,
        delivery_address: "",
        weight: null,
        delivery_date: "",
        priority: "medium"
      });
    } catch (error) {
      console.error("Failed to add destination", error);
      setMessage({ 
        type: "error", 
        text: error.response?.data?.message || "Failed to add destination" 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setDestinationFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">Add Destination</h2>
        <p className="mt-1 text-sm text-gray-600">
          Set destination coordinates for a specific car
        </p>
      </div>

      <div className="p-6">
        {message.text && (
          <div className={`mb-4 p-4 rounded-md ${
            message.type === "success" 
              ? "bg-green-50 text-green-700 border border-green-200" 
              : "bg-red-50 text-red-700 border border-red-200"
          }`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Car Selection */}
          <div>
            <label htmlFor="carId" className="block text-sm font-medium text-gray-700 mb-2">
              Select Car
            </label>
            {isLoadingCars ? (
              <div className="animate-pulse bg-gray-200 h-10 rounded-md"></div>
            ) : (
              <select
                id="carId"
                value={destinationFormData.carId}
                onChange={(e) => handleInputChange("carId", e.target.value)}
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select a car...</option>
                {cars.map((car) => (
                  <option key={car._id || car.id} value={car._id || car.id}>
                    {car.make} {car.model} {car.year} - {car.licensePlate || car.license_plate || 'No License Plate'}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Delivery Address */}
          <div>
            <label htmlFor="delivery_address" className="block text-sm font-medium text-gray-700 mb-2">
              Delivery Address
            </label>
            <textarea
              id="delivery_address"
              value={destinationFormData.delivery_address}
              onChange={(e) => handleInputChange("delivery_address", e.target.value)}
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter full delivery address..."
              rows="3"
              required
            />
          </div>

          {/* Coordinates Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Longitude */}
            <div>
              <label htmlFor="longitude" className="block text-sm font-medium text-gray-700 mb-2">
                Longitude
              </label>
              <input
                type="number"
                id="longitude"
                step="any"
                value={destinationFormData.longitude || ""}
                onChange={(e) => handleInputChange("longitude", parseFloat(e.target.value) || null)}
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., -118.2437"
                required
              />
              <p className="mt-1 text-sm text-gray-500">
                Enter longitude (-180 to 180)
              </p>
            </div>

            {/* Latitude */}
            <div>
              <label htmlFor="latitude" className="block text-sm font-medium text-gray-700 mb-2">
                Latitude
              </label>
              <input
                type="number"
                id="latitude"
                step="any"
                value={destinationFormData.latitude || ""}
                onChange={(e) => handleInputChange("latitude", parseFloat(e.target.value) || null)}
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., 34.0522"
                required
              />
              <p className="mt-1 text-sm text-gray-500">
                Enter latitude (-90 to 90)
              </p>
            </div>
          </div>

          {/* Weight and Delivery Date Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Weight */}
            <div>
              <label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-2">
                Weight (kg)
              </label>
              <input
                type="number"
                id="weight"
                step="0.01"
                min="0"
                value={destinationFormData.weight || ""}
                onChange={(e) => handleInputChange("weight", parseFloat(e.target.value) || null)}
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., 25.5"
                required
              />
            </div>

            {/* Delivery Date */}
            <div>
              <label htmlFor="delivery_date" className="block text-sm font-medium text-gray-700 mb-2">
                Delivery Date
              </label>
              <input
                type="date"
                id="delivery_date"
                value={destinationFormData.delivery_date}
                onChange={(e) => handleInputChange("delivery_date", e.target.value)}
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>
          </div>

          {/* Priority */}
          <div>
            <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-2">
              Priority
            </label>
            <select
              id="priority"
              value={destinationFormData.priority}
              onChange={(e) => handleInputChange("priority", e.target.value)}
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Adding...
                </>
              ) : (
                "Add Destination"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddDestinationTab;