import { useState, useEffect } from "react";
import CarForm from "./CarForm";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

function AddCarTab() {
  const navigate = useNavigate();
  const [enrichedCarFormData, setEnrichedCarFormData] = useState({
    company_id: "",
    make: "",
    model: "",
    year: "",
    license_plate: "",
    average_fuel_consumption: "",
    fuel_type: "",
    co2_emission_rate: "",
    current_location: "",
    status: "active",
    total_mileage: "",
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const decoded = jwtDecode(token);
      setEnrichedCarFormData(prev => ({
        ...prev, 
        company_id: decoded.company
      }));
    } catch (error) {
      console.error("Failed to decode token:", error);
    }
  }, []);

  const handleAddCar = async (e) => {
    e.preventDefault();

    try {
      const enrichedCarData = {
        company_id: enrichedCarFormData.company_id,
        make: enrichedCarFormData.make,
        model: enrichedCarFormData.model,
        year: enrichedCarFormData.year,
        license_plate: enrichedCarFormData.license_plate,
        average_fuel_consumption: enrichedCarFormData.average_fuel_consumption,
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

      // Reset form
      setEnrichedCarFormData({
        company_id: "",
        make: "",
        model: "",
        year: "",
        license_plate: "",
        average_fuel_consumption: "",
        fuel_type: "",
        co2_emission_rate: "",
        current_location: "",
        status: "active",
        total_mileage: "",
      });

      alert("Car added successfully!");
      setActiveTab("viewCars");
    } catch (error) {
      console.error("Failed to add car", error);
      alert(
        "Failed to add car: " + (error.response?.data?.error || error.message)
      );
    }
  };

  return (
    <CarForm
      enrichedCarFormData={enrichedCarFormData}
      setEnrichedCarFormData={setEnrichedCarFormData}
      handleAddCar={handleAddCar}
    />
  );
}

export default AddCarTab;