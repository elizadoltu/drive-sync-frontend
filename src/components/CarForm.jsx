import React from 'react';

const CarForm = ({
  enrichedCarFormData,
  setEnrichedCarFormData,
  handleAddCar
}) => {
  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Add New Car</h2>

        <form onSubmit={handleAddCar} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Row 1 */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Plate Number*</label>
            <input
              type="text"
              value={enrichedCarFormData.license_plate}
              onChange={(e) => setEnrichedCarFormData({ ...enrichedCarFormData, license_plate: e.target.value })}
              required
              className="w-full p-2 border rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Year*</label>
            <input
              type="number"
              value={enrichedCarFormData.year}
              onChange={(e) => setEnrichedCarFormData({ ...enrichedCarFormData, year: e.target.value })}
              required
              min="1900"
              max={new Date().getFullYear()}
              className="w-full p-2 border rounded-md"
            />
          </div>

          {/* Row 2 */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Brand*</label>
            <input
              type="text"
              value={enrichedCarFormData.make}
              onChange={(e) => setEnrichedCarFormData({ ...enrichedCarFormData, make: e.target.value })}
              required
              className="w-full p-2 border rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Model*</label>
            <input
              type="text"
              value={enrichedCarFormData.model}
              onChange={(e) => setEnrichedCarFormData({ ...enrichedCarFormData, model: e.target.value })}
              required
              className="w-full p-2 border rounded-md"
            />
          </div>

          {/* Row 3 */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Average Fuel Consumption* (L/100km)</label>
            <input
              type="number"
              step="0.1"
              min="0"
              value={enrichedCarFormData.average_fuel_consumption}
              onChange={(e) => setEnrichedCarFormData({ ...enrichedCarFormData, average_fuel_consumption: e.target.value })}
              required
              className="w-full p-2 border rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Fuel Type*</label>
            <select
              value={enrichedCarFormData.fuel_type}
              onChange={(e) => setEnrichedCarFormData({ ...enrichedCarFormData, fuel_type: e.target.value })}
              required
              className="w-full p-2 border rounded-md"
            >
              <option value="">Select Fuel Type</option>
              <option value="gasoline">Gasoline</option>
              <option value="diesel">Diesel</option>
              <option value="electric">Electric</option>
              <option value="hybrid">Hybrid</option>
              <option value="lpg">LPG</option>
            </select>
          </div>

          {/* Row 4 */}
          <div>
            <label className="block text-sm font-medium text-gray-700">CO2 Emission Rate (g/km)*</label>
            <input
              type="number"
              step="0.1"
              min="0"
              value={enrichedCarFormData.co2_emission_rate}
              onChange={(e) => setEnrichedCarFormData({ ...enrichedCarFormData, co2_emission_rate: e.target.value })}
              className="w-full p-2 border rounded-md"
            />
          </div>

          {/* Group Longitude and Latitude together in a single logical "column" or 'div' to ensure they stack */}
          <div className="grid grid-cols-1 gap-4"> {/* This new div will act as a single column within the main 2-column grid */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Longitude</label>
              <input
                type="number"
                step="any"
                value={enrichedCarFormData.current_location?.lng || ''}
                onChange={(e) => setEnrichedCarFormData({
                  ...enrichedCarFormData,
                  current_location: {
                    ...enrichedCarFormData.current_location,
                    lng: parseFloat(e.target.value) || null
                  }
                })}
                className="w-full p-2 border rounded-md"
                placeholder="e.g., -118.2437"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Latitude</label>
              <input
                type="number"
                step="any"
                value={enrichedCarFormData.current_location?.lat || ''}
                onChange={(e) => setEnrichedCarFormData({
                  ...enrichedCarFormData,
                  current_location: {
                    ...enrichedCarFormData.current_location,
                    lat: parseFloat(e.target.value) || null
                  }
                })}
                className="w-full p-2 border rounded-md"
                placeholder="e.g., 34.0522"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <select
              value={enrichedCarFormData.status}
              onChange={(e) => setEnrichedCarFormData({ ...enrichedCarFormData, status: e.target.value })}
              className="w-full p-2 border rounded-md"
            >
              <option value="active">Active</option>
              <option value="maintenance">Maintenance</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Total Mileage (km)</label>
            <input
              type="number"
              step="1"
              min="0"
              value={enrichedCarFormData.total_mileage}
              onChange={(e) => setEnrichedCarFormData({ ...enrichedCarFormData, total_mileage: e.target.value })}
              className="w-full p-2 border rounded-md"
            />
          </div>

          <div className="md:col-span-2 mt-4">
            <button
              type="submit"
              className="px-4 py-2 rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Add Car
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CarForm;