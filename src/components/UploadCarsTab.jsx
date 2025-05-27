import { useState } from "react";
import axios from "axios";

function UploadCarsTab() {
  const [file, setFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("");
  const [fileType, setFileType] = useState("csv");

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setUploadStatus(""); // Reset status when new file is selected
  };

  const handleFileTypeChange = (e) => {
    setFileType(e.target.value);
    setFile(null); // Reset file when changing type
    setUploadStatus("");
    
    // Reset file input
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) fileInput.value = '';
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      alert("Please select a file first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("fileType", fileType); // Send file type to backend

    try {
      const token = localStorage.getItem("token");
      setUploadStatus("Uploading...");
      
      const response = await axios.post(
        "https://cars-dot-cloud-app-455515.lm.r.appspot.com/api/cars/upload",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setUploadStatus("Upload successful!");
      setFile(null);
      alert(`Cars uploaded successfully from ${fileType.toUpperCase()} file!`);
      
      // Reset file input
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) fileInput.value = '';
      
    } catch (error) {
      console.error("Failed to upload file", error);
      setUploadStatus("Upload failed. Please try again.");
    }
  };

  const getAcceptedFileTypes = () => {
    return fileType === "csv" ? ".csv" : ".json";
  };

  const renderFormatRequirements = () => {
    if (fileType === "csv") {
      return (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="text-sm font-medium text-blue-900 mb-2">CSV Format Requirements:</h4>
          <p className="text-sm text-blue-700 mb-2">
            Your CSV file should include columns: make, model, year, color, licensePlate, vin, fuelType, transmission, mileage, price, status, location
          </p>
          <p className="text-sm text-blue-600 font-medium">Example CSV format:</p>
          <pre className="text-xs bg-white p-2 rounded border mt-1 overflow-x-auto">
{`make,model,year,color,licensePlate,vin,fuelType,transmission,mileage,price,status,location
Toyota,Camry,2020,White,ABC123,1HGBH41JXMN109186,Gasoline,Automatic,25000,25000,available,New York
Honda,Civic,2019,Blue,XYZ789,2HGBH41JXMN109187,Gasoline,Manual,30000,22000,available,Los Angeles`}
          </pre>
        </div>
      );
    } else {
      return (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h4 className="text-sm font-medium text-green-900 mb-2">JSON Format Requirements:</h4>
          <p className="text-sm text-green-700 mb-2">
            Your JSON file should be an array of car objects with the following structure:
          </p>
          <p className="text-sm text-green-600 font-medium">Example JSON format:</p>
          <pre className="text-xs bg-white p-2 rounded border mt-1 overflow-x-auto">
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
      );
    }
  };

  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
          Upload Cars from File
        </h3>
        
        {/* File Type Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select File Type
          </label>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                value="csv"
                checked={fileType === "csv"}
                onChange={handleFileTypeChange}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">CSV File</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="json"
                checked={fileType === "json"}
                onChange={handleFileTypeChange}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">JSON File</span>
            </label>
          </div>
        </div>

        {/* Format Requirements */}
        {renderFormatRequirements()}
        
        <form onSubmit={handleFileUpload} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select {fileType.toUpperCase()} File
            </label>
            <input
              type="file"
              accept={getAcceptedFileTypes()}
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {file && (
              <p className="mt-2 text-sm text-gray-600">
                Selected file: <span className="font-medium">{file.name}</span>
              </p>
            )}
          </div>
          
          <button
            type="submit"
            disabled={!file || uploadStatus === "Uploading..."}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md text-sm font-medium"
          >
            {uploadStatus === "Uploading..." ? "Uploading..." : `Upload ${fileType.toUpperCase()} File`}
          </button>
        </form>
        
        {uploadStatus && (
          <div className={`mt-4 p-3 rounded-lg ${
            uploadStatus.includes("successful") 
              ? "bg-green-50 border border-green-200 text-green-700"
              : uploadStatus.includes("failed")
              ? "bg-red-50 border border-red-200 text-red-700"
              : "bg-gray-50 border border-gray-200 text-gray-700"
          }`}>
            <p className="text-sm">{uploadStatus}</p>
          </div>
        )}

        {/* Additional Information */}
        <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Important Notes:</h4>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>• Maximum file size: 10MB</li>
            <li>• All required fields must be present in the file</li>
            <li>• Duplicate license plates or VINs will be skipped</li>
            <li>• Invalid data rows will be reported in the upload summary</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default UploadCarsTab;
