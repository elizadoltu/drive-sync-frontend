import { useState } from "react";
import CarForm from "./CarForm";

function AddCarTab() {
  const [carFormData, setCarFormData] = useState({
    make: "",
    model: "",
    year: "",
    color: "",
    licensePlate: "",
    vin: "",
    fuelType: "",
    transmission: "",
    mileage: "",
    price: "",
    status: "available",
    location: "",
    features: [],
    images: [],
  });

  const [enrichedCarFormData, setEnrichedCarFormData] = useState({
    make: "",
    model: "",
    year: "",
    color: "",
    licensePlate: "",
    vin: "",
    fuelType: "",
    transmission: "",
    mileage: "",
    price: "",
    status: "available",
    location: "",
    features: [],
    images: [],
  });

  const handleAddCar = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "https://cars-dot-cloud-app-455515.lm.r.appspot.com/api/cars",
        enrichedCarFormData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert("Car added successfully!");
      
      // Reset forms
      const resetData = {
        make: "",
        model: "",
        year: "",
        color: "",
        licensePlate: "",
        vin: "",
        fuelType: "",
        transmission: "",
        mileage: "",
        price: "",
        status: "available",
        location: "",
        features: [],
        images: [],
      };
      
      setCarFormData(resetData);
      setEnrichedCarFormData(resetData);
    } catch (error) {
      console.error("Failed to add car", error);
      alert("Failed to add car. Please try again.");
    }
  };

  return (
    <CarForm
      carFormData={carFormData}
      setCarFormData={setCarFormData}
      enrichedCarFormData={enrichedCarFormData}
      setEnrichedCarFormData={setEnrichedCarFormData}
      handleAddCar={handleAddCar}
    />
  );
}

export default AddCarTab;
