import React, { useEffect, useRef, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import API_KEY from '../utils/API_KEY';

const Maps = () => {
  const mapRef = useRef(null);
  const [error, setError] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [map, setMap] = useState(null);
  const [dataSource, setDataSource] = useState(null);
  const [cars, setCars] = useState([]);
  const [selectedCarId, setSelectedCarId] = useState(null);
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/';
  };

  useEffect(() => {
    const loadAzureMapsScript = () => {
      if (document.getElementById('azure-maps-script')) {
        return;
      }

      const mapsCss = document.createElement('link');
      mapsCss.rel = 'stylesheet';
      mapsCss.href = 'https://atlas.microsoft.com/sdk/javascript/mapcontrol/2/atlas.min.css';
      document.head.appendChild(mapsCss);
      
      const azureMapScript = document.createElement('script');
      azureMapScript.id = 'azure-maps-script';
      azureMapScript.src = 'https://atlas.microsoft.com/sdk/javascript/mapcontrol/2/atlas.min.js';
      azureMapScript.async = true;
      azureMapScript.onload = () => {
        setMapLoaded(true);
      };
      
      document.head.appendChild(azureMapScript);
    };

    loadAzureMapsScript();
  }, []);

  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;

    try {
      const mapInstance = new window.atlas.Map(mapRef.current, {
        authOptions: {
          authType: 'subscriptionKey',
          subscriptionKey: API_KEY
        },
        center: [-122.4194, 37.7749], 
        zoom: 4,
        style: 'road'
      });

      mapInstance.events.add('ready', () => {
        const source = new window.atlas.source.DataSource();
        mapInstance.sources.add(source);
        
        mapInstance.layers.add(new window.atlas.layer.SymbolLayer(source, null, {
          iconOptions: {
            allowOverlap: true
          }
        }));
        
        setMap(mapInstance);
        setDataSource(source);
        
        fetchCarLocations(mapInstance, source);
      });
    } catch (err) {
      console.error('Error initializing map:', err);
      setError('Failed to initialize map. Please check your API key.');
    }
  }, [mapLoaded]);

  const fetchCarLocations = async (mapInstance, source) => {
    try {
      const response = await fetch('https://maps-drivesync-dbhegqdugebhhdd7.polandcentral-01.azurewebsites.net/api/maps');
  
      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }
  
      const carsData = await response.json();
      setCars(carsData);
  
      const points = [];
      const features = [];
  
      for (const car of carsData) {
        if (car.lat === undefined || car.lng === undefined) continue;
  
        const position = [car.lng, car.lat];
        points.push(position);
  
        const feature = new window.atlas.data.Feature(
          new window.atlas.data.Point(position),
          {
            id: car.id,
            make: car.make || 'Unknown',
            status: car.status || 'unknown',
            color: car.status === 'active' ? 'green' : 'red',
          }
        );
  
        features.push(feature);
      }
  
      source.add(features);
  
      const popup = new window.atlas.Popup({
        pixelOffset: [0, -10],
        closeButton: true,
        fillColor: '#181818',
        shadowColor: 'rgba(0, 0, 0, 0.2)'
      });
  
      mapInstance.events.add('click', source, (e) => {
        if (e.shapes && e.shapes.length > 0) {
          const properties = e.shapes[0].getProperties();
          setSelectedCarId(properties.id);
  
          popup.setOptions({
            content: `
              <div style="padding: 12px; color: white;">
                <h3 style="margin-top: 0; margin-bottom: 8px; font-size: 16px; text-transform: uppercase;">${properties.make}</h3>
                <p style="margin: 5px 0; font-size: 14px;">ID: ${properties.id}</p>
                <p style="margin: 5px 0; font-size: 14px;">
                  Status: <span style="color: ${properties.status === 'active' ? '#4ade80' : '#ef4444'}; font-weight: bold;">
                    ${properties.status}
                  </span>
                </p>
                <p style="margin: 5px 0; font-size: 14px;">Weather: ${properties.weather}</p>
              </div>
            `,
            position: e.position
          });
  
          popup.open(mapInstance);
        }
      });
  
      mapInstance.layers.add(new window.atlas.layer.BubbleLayer(source, null, {
        color: [
          'case',
          ['==', ['get', 'status'], 'active'],
          '#4ade80',
          '#ef4444'
        ],
        radius: 8,
        strokeWidth: 0
      }));
  
      if (points.length > 0) {
        mapInstance.setCamera({
          bounds: window.atlas.data.BoundingBox.fromData(points),
          padding: 50
        });
      }
    } catch (err) {
      console.error('Error fetching car locations:', err);
      setError('Failed to load car data. Please try again later.');
    }
  };
  
  
  return (
    <div className="h-screen w-full font-general-regular overflow-hidden bg-white">
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

      <div className="w-full flex-1 overflow-y-auto overflow-x-hidden">
        <div className="max-w-7xl mx-auto py-8 px-4 w-full">
          <div className="mb-8">
            <h1 className="text-2xl font-semibold font-general-medium uppercase mb-2">Car Locations</h1>
            <p className="text-gray-600 font-general-regular">Track and monitor your fleet in real-time</p>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3">
              <div className="bg-[#e7e7e7] rounded-xl p-6 h-full">
                <div 
                  ref={mapRef} 
                  className="w-full h-[600px] rounded-lg overflow-hidden shadow-md"
                />
                <div className="mt-2 text-sm text-gray-500 flex items-center">
                  {!mapLoaded && (
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                  {mapLoaded ? 'Map loaded successfully' : 'Loading map...'}
                </div>
              </div>
            </div>
            
            <div className="lg:col-span-1">
              <div className="bg-[#e7e7e7] rounded-xl p-6 h-full">
                <h2 className="text-lg font-semibold font-general-medium mb-4 uppercase">Car Fleet</h2>
                
                {cars.length === 0 && mapLoaded ? (
                  <div className="bg-white rounded-lg p-4 text-center">
                    <p className="text-gray-500">No cars available</p>
                  </div>
                ) : !mapLoaded ? (
                  <div className="bg-white rounded-lg p-4 text-center">
                    <svg className="animate-spin mx-auto h-8 w-8 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="mt-2 text-gray-500">Loading cars...</p>
                  </div>
                ) : (
                  <div className="space-y-2 overflow-y-auto max-h-[550px]">
                    {cars.map(car => (
                      <div 
                        key={car.id} 
                        className={`bg-white p-3 rounded-lg cursor-pointer transition-all ${
                          selectedCarId === car.id ? 'ring-2 ring-black' : 'hover:bg-gray-50'
                        }`}
                        onClick={() => setSelectedCarId(car.id)}
                      >
                        <div className="flex justify-between items-center">
                          <h3 className="font-medium">{car.make || 'Unknown'}</h3>
                          <span 
                            className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                              car.status === 'active' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {car.status || 'unknown'}
                          </span>
                        </div>
                        <p className="text-gray-500 text-sm mt-1">ID: {car.id}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 bg-[#e7e7e7] rounded-xl p-6">
            <h2 className="text-lg font-semibold font-general-medium mb-4 uppercase">Legend</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center">
                <span className="w-4 h-4 rounded-full bg-green-500 mr-2"></span>
                <span>Active Cars</span>
              </div>
              <div className="flex items-center">
                <span className="w-4 h-4 rounded-full bg-red-500 mr-2"></span>
                <span>Inactive Cars</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .nav-active {
          font-weight: 600;
        }
        /* Fix for Azure Maps controls to match your design */
        .atlas-map-creditCtrl {
          background-color: rgba(255, 255, 255, 0.8) !important;
          border-radius: 4px !important;
        }
        .atlas-map-copyrightCtrl {
          background-color: rgba(255, 255, 255, 0.8) !important;
          border-radius: 4px !important;
        }
      `}</style>
    </div>
  );
};

export default Maps;