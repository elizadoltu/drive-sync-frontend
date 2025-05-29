import React, { useEffect, useRef, useState } from 'react';
import API_KEY from '../utils/API_KEY';
import Sidebar from '../components/Sidebar';
import { jwtDecode } from 'jwt-decode';

const Maps = () => {
  const mapRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [error, setError] = useState(null);
  const [cars, setCars] = useState([]);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState('admin');
  const [selectedItem, setSelectedItem] = useState(null);
  const [markersMap, setMarkersMap] = useState({});
  const mapInstanceRef = useRef(null);
  const directionsRendererRef = useRef(null);
  const directionsService = useRef(null);

  useEffect(() => {
    window.initMap = () => setMapLoaded(true);
    const loadScript = () => {
      if (document.getElementById('google-maps-script')) return;
      const script = document.createElement('script');
      script.id = 'google-maps-script';
      script.src = 'https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=marker&callback=initMap&loading=async';
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    };
    loadScript();
    return () => { window.initMap = undefined; };
  }, []);

  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;

    let map = mapInstanceRef.current;
    if (!map) {
      map = new window.google.maps.Map(mapRef.current, {
        center: { lat: 37.7749, lng: -122.4194 },
        zoom: 4,
        mapId: 'c1234567-89ab-cdef-0123-456789abcdef',
      });
      mapInstanceRef.current = map;
    }

    Object.values(markersMap).forEach(({ marker }) => {
      if (marker && typeof marker.setMap === 'function') {
        marker.setMap(null);
      }
    });
    setMarkersMap({});
    setCars([]);
    setPackages([]);
    setSelectedItem(null);
    setError(null);
    setLoading(true);

    const fitMapToItems = (itemsToFit) => {
      if (itemsToFit.length > 0 && mapInstanceRef.current) {
        const bounds = new window.google.maps.LatLngBounds();
        let validItems = 0;
        itemsToFit.forEach(item => {
          if (typeof item.latitude === 'number' && typeof item.longitude === 'number') {
            bounds.extend({ lat: item.latitude, lng: item.longitude });
            validItems++;
          }
        });
        if (validItems > 0) {
          mapInstanceRef.current.fitBounds(bounds);
          if (mapInstanceRef.current.getZoom() > 16) { // Don't zoom in too much
            mapInstanceRef.current.setZoom(16);
          }
          if (validItems === 1 && mapInstanceRef.current.getZoom() < 14) { // If only one item, set a reasonable zoom
            mapInstanceRef.current.setZoom(14);
          }
        }
      }
    };

    if (userRole === 'admin') {
      fetchCarLocations(map)
        .then(() => fitMapToItems(cars)) // cars state will be updated by fetchCarLocations
        .catch(err => {
          console.error("Error fetching admin car locations:", err);
          setError("Failed to load car data.");
        })
        .finally(() => setLoading(false));
    } else if (userRole === 'driver') {
      Promise.all([
        fetchCarLocations(map), // Fetches and places driver's car marker
        fetchPackageLocations(map) // Fetches and places driver's package markers
      ]).then(() => {
        Promise.all([
          fetchCarLocations(map),
          fetchPackageLocations(map)
        ]).then(([driverCars, driverPackages]) => {
          const allDriverItems = [
            ...driverCars.map(car => ({ latitude: car.latitude, longitude: car.longitude })),
            ...driverPackages.map(pkg => ({ latitude: pkg.latitude, longitude: pkg.longitude })),
          ];
          fitMapToItems(allDriverItems);
          if (driverCars.length > 0 && driverPackages.length > 0) {
          drawRoute(driverCars[0], driverPackages[0]);
        }
        });

      }).catch(err => {
        console.error("Error fetching driver data (car and/or packages):", err);
        setError("Failed to load your car or package data.");
      }).finally(() => {
        setLoading(false);
      });
    }
  }, [mapLoaded, userRole]);

  const fetchCarLocations = async (map) => {
    let userCarLicensePlate = null;

    if (userRole === 'driver') {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          const decodedToken = jwtDecode(token);
          userCarLicensePlate = decodedToken.carId;
          console.log("Driver's car license plate from token:", userCarLicensePlate);
        } else {
          console.warn("No token found for driver role.");
          setError("Login token not found. Unable to identify your car.");
          setCars([]);
          return;
        }
      } catch (e) {
        console.error("Failed to decode token or get carId for driver:", e);
        setError("Invalid login token. Unable to identify your car.");
        setCars([]);
        return;
      }
      if (!userCarLicensePlate) {
        console.warn("No carId (license plate) found in token for driver.");
        setError("Your car's license plate is not specified in your profile.");
        setCars([]);
        return;
      }
    }

    try {
      const res = await fetch('https://maps-dot-cloud-app-455515.lm.r.appspot.com/api/maps');
      if (!res.ok) {
        console.error(`Failed to fetch car locations: Status ${res.status}`);
        throw new Error(`Failed to fetch car locations. Status: ${res.status}`);
      }
      const data = await res.json();

      if (!Array.isArray(data)) {
        console.error('Fetched car data is not an array:', data);
        setError('Received invalid car data format.');
        setCars([]);
        return;
      }

      const transformedData = data
        .filter(item => item && typeof item.license_plate === 'string' && item.license_plate.trim() !== '')
        .map(car => ({
          ...car,
          id: car.license_plate,
          original_db_id: car.id
        }));

      console.log(`Transformed car data: ${transformedData} valid items found.`);

      if (transformedData.length !== data.length && data.length > 0) {
        console.warn("Some car items were filtered out due to missing/invalid license_plate or transformed.");
      }

      let carsToDisplay = [];
      if (userRole === 'admin') {
        carsToDisplay = transformedData;
      } else if (userRole === 'driver' && userCarLicensePlate) {
        console.log(`Filtering cars for driver's license plate: ${userCarLicensePlate}`);
        for (const car of transformedData) {
          console.log(`Checking car: ${car.license_plate}`);
          if (car.license_plate === userCarLicensePlate) {
            console.log(`Found driver's car: ${car.license_plate}`);
          }
        }
        carsToDisplay = transformedData.filter(car => car.license_plate === userCarLicensePlate);
        console.log('DA: ', carsToDisplay);
        if (carsToDisplay.length === 0) {
          console.warn(`Driver's car with license plate ${userCarLicensePlate} not found in fetched data.`);
          setError(`Your car (${userCarLicensePlate}) was not found.`);
        }
      }
      for (const car of carsToDisplay) {
        console.log(`Car to display: ${car.license_plate} at (${car.latitude}, ${car.longitude})`);
      }

      setCars(carsToDisplay);
      if (carsToDisplay.length > 0) {
        placeMarkers(map, carsToDisplay, 'car');
      }
      return carsToDisplay;

    } catch (err) {
      console.error('Error in fetchCarLocations:', err);
      setError(err.message || 'Failed to fetch car data.');
      setCars([]);
    }
  };

  const fetchPackageLocations = async (map) => {
    let userCarLicensePlate = null;
    try {
      const token = localStorage.getItem("token");
      if (token) {
        const decodedToken = jwtDecode(token);
        userCarLicensePlate = decodedToken.carId;
        console.log("User's car license plate from token:", userCarLicensePlate);
      }
    } catch (e) {
      console.error("Failed to decode token or get carId:", e);
    }

    try {
      setLoading(true);
      const res = await fetch('https://trip-service-dot-cloud-app-455515.lm.r.appspot.com/api/trips');
      console.log('Response :', res);

      let processedPackages = [];

      if (!res.ok) {
        console.warn(`Failed to fetch package locations: Status ${res.status}. Using mock data.`);
        const mockPackages = [
          {
            id: 1,
            latitude: 37.7749,
            longitude: -122.4194,
            recipientName: 'Alice Johnson',
            status: 'in-transit',
            license_plate: 'CAR123',
          },
          {
            id: 2,
            latitude: 34.0522,
            longitude: -118.2437,
            recipientName: 'Bob Smith',
            status: 'pending',
            license_plate: 'CAR456',
          },
          {
            id: 3,
            latitude: 40.7128,
            longitude: -74.006,
            recipientName: 'Carol Davis',
            status: 'delivered',
            license_plate: 'CAR123',
          },
          {
            id: 4,
            latitude: 41.8781,
            longitude: -87.6298,
            recipientName: 'David Lee',
            status: 'in-transit',
            license_plate: 'XYZ789',
          },
          {
            id: 5,
            latitude: 29.7604,
            longitude: -95.3698,
            recipientName: 'Eva Martinez',
            status: 'pending',
            license_plate: 'CAR456',
          },
        ];
        processedPackages = mockPackages;
      } else {
        const data = await res.json();
        if (Array.isArray(data)) {
          processedPackages = data;
        } else {
          console.error('Fetched package data is not an array:', data);
          setError('Received invalid package data format.');
          processedPackages = [];
        }
      }

      let finalPackages = processedPackages;
      if (userCarLicensePlate && userRole !== 'admin') {
        finalPackages = processedPackages.filter(
          (pkg) => pkg.license_plate === userCarLicensePlate
        );
        console.log(`Filtered packages for car ${userCarLicensePlate}:`, finalPackages);
      } else if (userRole !== 'admin' && !userCarLicensePlate) {
        console.warn("No carId found in token for driver, showing all packages or none based on policy.");
      }

      setPackages(finalPackages);
      placeMarkers(map, finalPackages, 'package');
      return finalPackages;

    } catch (err) {
      console.error('Error processing package locations:', err);
      setError(err.message || 'Failed to process package data.');
      setPackages([]); // Ensure packages is an array on error
    }
    setLoading(false);
  };

  const placeMarkers = (map, items, type) => {
    setMarkersMap(prevMarkersMap => {
      const updatedMarkersMap = { ...prevMarkersMap };

      items.forEach(item => {
        if (!item || typeof item.id === 'undefined' || item.id === null) {
          console.warn(`Item of type ${type} is missing a valid id. Skipping.`);
          return;
        }
        if (typeof item.latitude !== 'number' || typeof item.longitude !== 'number') {
          console.warn(`Item ${item.id} (type: ${type}) is missing valid coordinates. Skipping.`);
          return;
        }

        const position = { lat: item.latitude, lng: item.longitude };

        const icon = type === 'car'
          ? {
            path: window.google.maps.SymbolPath.CIRCLE,
            fillColor: item.status === 'active' ? 'green' : 'red',
            fillOpacity: 1,
            strokeWeight: 0,
            scale: 8
          }
          : {
            path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
            fillColor: item.status === 'delivered' ? '#10B981' : item.status === 'in-transit' ? '#3B82F6' : '#F59E0B',
            fillOpacity: 0.9,
            strokeColor: '#fff',
            strokeWeight: 2,
            scale: 8
          };

        // Remove old marker for this ID if it exists, to prevent duplicates on re-fetch/re-render
        if (updatedMarkersMap[item.id] && updatedMarkersMap[item.id].marker) {
          updatedMarkersMap[item.id].marker.setMap(null);
        }

        const marker = new window.google.maps.Marker({
          position,
          map,
          icon,
          title: type === 'car' ? `${item.make || 'Car'} (${item.id})` : `Package ${item.id}`
        });

        const infoWindow = new window.google.maps.InfoWindow({
          content: `<div><h3>${type === 'car' ? (item.make || 'Car') : 'Package'} ${item.id}</h3><p>Status: ${item.status}</p>${type === 'package' && item.recipientName ? `<p>Recipient: ${item.recipientName}</p>` : ''}</div>`
        });

        marker.addListener('click', () => {
          // Close all other open infoWindows before opening a new one
          Object.values(updatedMarkersMap).forEach(entry => {
            if (entry.infoWindow && entry.marker !== marker) { // Check if infoWindow exists
              entry.infoWindow.close();
            }
          });
          infoWindow.open(map, marker);
          setSelectedItem(item.id);
        });

        updatedMarkersMap[item.id] = { marker, infoWindow, type };
      });
      return updatedMarkersMap;
    });
  };

  const drawRoute = (origin, destination) => {
    if (!origin || !destination || !mapInstanceRef.current) return;

    if (!directionsService.current) {
      directionsService.current = new window.google.maps.DirectionsService();
    }

    if (!directionsRendererRef.current) {
      directionsRendererRef.current = new window.google.maps.DirectionsRenderer({
        map: mapInstanceRef.current,
        suppressMarkers: true,
        polylineOptions: {
          strokeColor: '#1D4ED8',
          strokeOpacity: 0.7,
          strokeWeight: 5,
        },
      });
    }

    directionsService.current.route(
      {
        origin: { lat: origin.latitude, lng: origin.longitude },
        destination: { lat: destination.latitude, lng: destination.longitude },
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === 'OK') {
          directionsRendererRef.current.setDirections(result);
        } else {
          console.error('Directions request failed due to ', status);
        }
      }
    );
  };


  const focusOnItem = (id) => {
    const entry = markersMap[id];
    if (!entry || !mapInstanceRef.current) return;
    Object.values(markersMap).forEach(({ infoWindow }) => infoWindow.close());
    mapInstanceRef.current.panTo(entry.marker.getPosition());
    mapInstanceRef.current.setZoom(15);
    entry.infoWindow.open(mapInstanceRef.current, entry.marker);
    setSelectedItem(id);
  };

  const switchRole = (role) => {
    setUserRole(role);
    setSelectedItem(null);
    setMarkersMap({});
    setCars([]);
    setPackages([]);
    setError(null);
    setLoading(true);
  };

  return (
    <div className="h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      <div className="flex h-full">
        <div className="w-2/3 h-full relative">
          <div ref={mapRef} className="w-full h-full rounded-xl shadow" />
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80">
              <p className="text-gray-600 text-sm">Loading map data...</p>
            </div>
          )}
          <div className="absolute top-4 left-4 bg-white p-2 rounded shadow">
            <p className="text-xs text-gray-400">Role</p>
            <div className="flex gap-2">
              <button
                onClick={() => switchRole('admin')}
                className={`px-2 py-1 rounded text-xs ${userRole === 'admin' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'}`}
              >Admin</button>
              <button
                onClick={() => switchRole('driver')}
                className={`px-2 py-1 rounded text-xs ${userRole === 'driver' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'}`}
              >Driver</button>
            </div>
          </div>
        </div>

        <div className="w-1/3 h-full overflow-y-auto p-4 bg-white border-l border-gray-200">
          <h2 className="text-xl font-bold mb-3">
            {userRole === 'admin' ? 'Car Overview' : 'Packages'}
          </h2>
          {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
          {(userRole === 'admin' ? cars : packages).map(item => (
            <div
              key={item.id}
              onClick={() => focusOnItem(item.id)}
              className={`mb-3 p-4 rounded border shadow-sm cursor-pointer transition ${selectedItem === item.id ? 'bg-blue-50 border-blue-500' : 'bg-white hover:border-gray-300'
                }`}
            >
              <h3 className="text-lg font-semibold">
                {userRole === 'admin' ? `${item.make || 'Unknown'} ${item.model || ''}` : `Package ${item.id}`}
              </h3>
              <p className="text-sm text-gray-500">
                {userRole === 'admin' ? `ID: ${item.id}` : `${item.recipientName}`}
              </p>
              <p className="text-sm text-gray-600">Status: {item.status}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Maps;
