import React, { useEffect, useRef, useState } from 'react';
import API_KEY from '../utils/API_KEY';
import { useNavigate, Link } from 'react-router-dom';

const Maps = () => {
  const mapRef = useRef(null);
  const [error, setError] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    window.initMap = () => {
      setMapLoaded(true);
    };

    const loadGoogleMapsScript = () => {
      if (document.getElementById('google-maps-script')) {
        return;
      }

      const cleanKey = import.meta.env.VITE_MAPS_API_KEY?.trim();

      const googleMapScript = document.createElement('script');
      googleMapScript.id = 'google-maps-script';
      googleMapScript.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=marker&callback=initMap`;
      googleMapScript.async = true;
      googleMapScript.defer = true;
      
      document.head.appendChild(googleMapScript);
    };

    loadGoogleMapsScript();

    return () => {
      window.initMap = undefined;
    };
  }, []);

  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;

    try {
      const mapInstance = new window.google.maps.Map(mapRef.current, {
        center: { lat: 37.7749, lng: -122.4194 },
        zoom: 4,
       mapId: 'c1234567-89ab-cdef-0123-456789abcdef'
      });

      fetchCarLocations(mapInstance);
    } catch (err) {
      console.error('Error initializing map:', err);
      setError('Failed to initialize map. Please check your API key.');
    }
  }, [mapLoaded]);

  const fetchCarLocations = async (mapInstance) => {
    try {
      const response = await fetch('https://maps-dot-cloud-app-455515.lm.r.appspot.com/api/maps');
      
      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }
      
      const cars = await response.json();
      
      if (!cars || cars.length === 0) {
        console.warn('No car data received');
        return;
      }
      
      const bounds = new window.google.maps.LatLngBounds();
      
      cars.forEach(car => {
        if (car.lat === undefined || car.lng === undefined) {
          console.warn('Car missing location data:', car);
          return;
        }

        const position = { lat: car.lat, lng: car.lng };
        bounds.extend(position);
        
        try {
          const marker = new window.google.maps.Marker({
            position: position,
            map: mapInstance,
            title: `${car.make || 'Unknown'} (${car.id}) - ${car.status || 'unknown'}`,
            icon: {
              path: window.google.maps.SymbolPath.CIRCLE,
              fillColor: car.status === 'active' ? 'green' : 'red',
              fillOpacity: 1,
              strokeWeight: 0,
              scale: 8
            }
          });
          
          const infoWindow = new window.google.maps.InfoWindow({
            content: `
              <div style="padding: 8px;">
                <h3 style="margin-top: 0;">${car.make || 'Unknown'}</h3>
                <p style="margin: 5px 0;">ID: ${car.id}</p>
                <p style="margin: 5px 0;">Status: ${car.status || 'unknown'}</p>
              </div>
            `,
          });
          
          marker.addListener('click', () => {
            infoWindow.open(mapInstance, marker);
          });
        } catch (markerErr) {
          console.error('Error creating marker:', markerErr, car);
        }
      });
      
      if (cars.length > 0) {
        mapInstance.fitBounds(bounds);
      }
    } catch (err) {
      console.error('Error fetching car locations:', err);
      setError('Failed to load car data. Please try again later.');
    }
  };
  
  return (
    <div>
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
      <h1>Car Locations</h1>
      {error && (
        <div style={{ 
          color: 'red', 
          margin: '10px 0', 
          padding: '8px', 
          backgroundColor: '#ffeeee', 
          borderRadius: '4px' 
        }}>
          {error}
        </div>
      )}
      <div 
        ref={mapRef} 
        style={{ 
          height: '600px', 
          width: '100%', 
          borderRadius: '8px',
          boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
          margin: '16px 0'
        }} 
      />
      <div style={{ fontSize: '14px', color: '#666' }}>
        {mapLoaded ? 'Map loaded successfully' : 'Loading map...'}
      </div>
    </div>
  );
};

export default Maps;