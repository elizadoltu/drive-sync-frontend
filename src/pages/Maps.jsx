import React, { useEffect, useRef, useState } from 'react';
import API_KEY from '../utils/API_KEY';
import Sidebar from '../components/Sidebar';

const Maps = () => {
  const mapRef = useRef(null);
  const [error, setError] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [cars, setCars] = useState([]);
  const [packages, setPackages] = useState([]);
  const [markersMap, setMarkersMap] = useState({});
  const [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState('admin'); // This should come from your auth system
  const mapInstanceRef = useRef(null);

  // Mock function to get user role - replace with your actual auth logic
  useEffect(() => {
    // This should be replaced with your actual authentication/role checking logic
    const getUserRole = () => {
      // Example: get from localStorage, context, or API call
      const role = localStorage.getItem('userRole') || 'admin';
      setUserRole(role);
    };
    getUserRole();
  }, []);

  useEffect(() => {
    window.initMap = () => {
      setMapLoaded(true);
    };

    const loadGoogleMapsScript = () => {
      if (document.getElementById('google-maps-script')) return;

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
      const map = new window.google.maps.Map(mapRef.current, {
        center: { lat: 37.7749, lng: -122.4194 },
        zoom: 4,
        mapId: 'c1234567-89ab-cdef-0123-456789abcdef',
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          }
        ]
      });

      mapInstanceRef.current = map;
      
      if (userRole === 'admin') {
        fetchCarLocations(map);
      } else if (userRole === 'driver') {
        fetchPackageLocations(map);
      }
    } catch (err) {
      console.error('Error initializing map:', err);
      setError('Failed to initialize map.');
      setLoading(false);
    }
  }, [mapLoaded, userRole]);

  const fetchCarLocations = async (map) => {
    try {
      setLoading(true);
      const res = await fetch('https://maps-dot-cloud-app-455515.lm.r.appspot.com/api/maps');
      if (!res.ok) throw new Error(`Status: ${res.status}`);
      const data = await res.json();

      setCars(data);
      const bounds = new window.google.maps.LatLngBounds();
      const markerMap = {};

      data.forEach(car => {
        if (!car.lat || !car.lng) return;

        const position = { lat: car.lat, lng: car.lng };
        bounds.extend(position);

        const marker = new window.google.maps.Marker({
          position,
          map,
          title: `${car.make || 'Unknown'} (${car.id}) - ${car.status || 'unknown'}`,
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            fillColor: car.status === 'active' ? '#10B981' : '#EF4444',
            fillOpacity: 0.9,
            strokeColor: '#ffffff',
            strokeWeight: 2,
            scale: 10
          }
        });

        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div style="padding: 8px; font-family: Arial, sans-serif;">
              <h4 style="margin: 0 0 8px 0; color: #1f2937;">${car.make || 'Unknown Make'}</h4>
              <p style="margin: 4px 0; color: #6b7280;"><strong>ID:</strong> ${car.id}</p>
              <p style="margin: 4px 0; color: #6b7280;"><strong>Model:</strong> ${car.model || 'N/A'}</p>
              <p style="margin: 4px 0; color: #6b7280;"><strong>Year:</strong> ${car.year || 'N/A'}</p>
              <p style="margin: 4px 0;">
                <strong>Status:</strong> 
                <span style="color: ${car.status === 'active' ? '#10B981' : '#EF4444'}; font-weight: bold;">
                  ${car.status || 'Unknown'}
                </span>
              </p>
              ${car.lastUpdated ? `<p style="margin: 4px 0; color: #9ca3af; font-size: 12px;">Last updated: ${new Date(car.lastUpdated).toLocaleString()}</p>` : ''}
            </div>
          `,
        });

        marker.addListener('click', () => {
          Object.values(markerMap).forEach(({ infoWindow: iw }) => iw.close());
          infoWindow.open(map, marker);
          setSelectedItem(car.id);
        });

        markerMap[car.id] = { marker, infoWindow };
      });

      setMarkersMap(markerMap);
      if (data.length) map.fitBounds(bounds);
      setLoading(false);

    } catch (err) {
      console.error('Error fetching car locations:', err);
      setError('Failed to fetch car data.');
      setLoading(false);
    }
  };

  const fetchPackageLocations = async (map) => {
    try {
      setLoading(true);
      // Replace with your actual packages API endpoint
      const res = await fetch('https://maps-dot-cloud-app-455515.lm.r.appspot.com/api/packages');
      if (!res.ok) {
        // Mock data for demonstration if API doesn't exist yet
        const mockPackages = [
          {
            id: 'PKG001',
            recipientName: 'John Doe',
            address: '123 Main St, San Francisco, CA',
            lat: 37.7849,
            lng: -122.4094,
            status: 'pending',
            priority: 'high',
            deliveryDate: '2025-05-30',
            weight: '2.5 kg',
            type: 'Electronics'
          },
          {
            id: 'PKG002',
            recipientName: 'Jane Smith',
            address: '456 Oak Ave, Oakland, CA',
            lat: 37.8044,
            lng: -122.2711,
            status: 'in-transit',
            priority: 'medium',
            deliveryDate: '2025-05-29',
            weight: '1.2 kg',
            type: 'Documents'
          },
          {
            id: 'PKG003',
            recipientName: 'Bob Johnson',
            address: '789 Pine St, Berkeley, CA',
            lat: 37.8715,
            lng: -122.2730,
            status: 'delivered',
            priority: 'low',
            deliveryDate: '2025-05-28',
            weight: '3.1 kg',
            type: 'Clothing'
          }
        ];
        setPackages(mockPackages);
        createPackageMarkers(map, mockPackages);
        return;
      }
      const data = await res.json();
      setPackages(data);
      createPackageMarkers(map, data);

    } catch (err) {
      console.error('Error fetching package locations:', err);
      setError('Failed to fetch package data.');
      setLoading(false);
    }
  };

  const createPackageMarkers = (map, packageData) => {
    const bounds = new window.google.maps.LatLngBounds();
    const markerMap = {};

    packageData.forEach(pkg => {
      if (!pkg.lat || !pkg.lng) return;

      const position = { lat: pkg.lat, lng: pkg.lng };
      bounds.extend(position);

      // Different icons based on package status
      const getPackageIcon = (status) => {
        const iconColors = {
          'pending': '#F59E0B',
          'in-transit': '#3B82F6',
          'delivered': '#10B981',
          'failed': '#EF4444'
        };
        return {
          path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
          fillColor: iconColors[status] || '#6B7280',
          fillOpacity: 0.9,
          strokeColor: '#ffffff',
          strokeWeight: 2,
          scale: 8,
          rotation: 0
        };
      };

      const marker = new window.google.maps.Marker({
        position,
        map,
        title: `Package ${pkg.id} - ${pkg.status}`,
        icon: getPackageIcon(pkg.status)
      });

      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 8px; font-family: Arial, sans-serif; min-width: 200px;">
            <h4 style="margin: 0 0 8px 0; color: #1f2937;">Package ${pkg.id}</h4>
            <p style="margin: 4px 0; color: #6b7280;"><strong>Recipient:</strong> ${pkg.recipientName}</p>
            <p style="margin: 4px 0; color: #6b7280;"><strong>Address:</strong> ${pkg.address}</p>
            <p style="margin: 4px 0; color: #6b7280;"><strong>Type:</strong> ${pkg.type || 'N/A'}</p>
            <p style="margin: 4px 0; color: #6b7280;"><strong>Weight:</strong> ${pkg.weight || 'N/A'}</p>
            <p style="margin: 4px 0;">
              <strong>Status:</strong> 
              <span style="color: ${pkg.status === 'delivered' ? '#10B981' : pkg.status === 'in-transit' ? '#3B82F6' : '#F59E0B'}; font-weight: bold; text-transform: capitalize;">
                ${pkg.status || 'Unknown'}
              </span>
            </p>
            <p style="margin: 4px 0; color: #6b7280;"><strong>Delivery Date:</strong> ${pkg.deliveryDate || 'N/A'}</p>
          </div>
        `,
      });

      marker.addListener('click', () => {
        Object.values(markerMap).forEach(({ infoWindow: iw }) => iw.close());
        infoWindow.open(map, marker);
        setSelectedItem(pkg.id);
      });

      markerMap[pkg.id] = { marker, infoWindow };
    });

    setMarkersMap(markerMap);
    if (packageData.length) map.fitBounds(bounds);
    setLoading(false);
  };

  const focusOnItem = (itemId) => {
    const entry = markersMap[itemId];
    if (!entry || !mapInstanceRef.current) return;
    
    const { marker, infoWindow } = entry;
    
    Object.values(markersMap).forEach(({ infoWindow: iw }) => iw.close());
    
    mapInstanceRef.current.panTo(marker.getPosition());
    mapInstanceRef.current.setZoom(15);
    infoWindow.open(mapInstanceRef.current, marker);
    setSelectedItem(itemId);
  };

  const getStatusBadge = (status, type = 'car') => {
    let colorClasses, bgClasses;
    
    if (type === 'car') {
      const isActive = status === 'active';
      colorClasses = isActive ? 'text-green-800' : 'text-red-800';
      bgClasses = isActive ? 'bg-green-100 border-green-200' : 'bg-red-100 border-red-200';
    } else {
      // Package status colors
      const statusColors = {
        'pending': 'text-yellow-800 bg-yellow-100 border-yellow-200',
        'in-transit': 'text-blue-800 bg-blue-100 border-blue-200',
        'delivered': 'text-green-800 bg-green-100 border-green-200',
        'failed': 'text-red-800 bg-red-100 border-red-200'
      };
      const colors = statusColors[status] || 'text-gray-800 bg-gray-100 border-gray-200';
      colorClasses = colors.split(' ')[0];
      bgClasses = colors.split(' ').slice(1).join(' ');
    }
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${colorClasses} ${bgClasses}`}>
        <span className={`w-2 h-2 rounded-full mr-2 ${
          type === 'car' 
            ? (status === 'active' ? 'bg-green-500' : 'bg-red-500')
            : status === 'delivered' ? 'bg-green-500' 
            : status === 'in-transit' ? 'bg-blue-500'
            : status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'
        }`} />
        {status || 'Unknown'}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getPriorityBadge = (priority) => {
    const priorityColors = {
      'high': 'text-red-700 bg-red-50 border-red-200',
      'medium': 'text-yellow-700 bg-yellow-50 border-yellow-200',
      'low': 'text-green-700 bg-green-50 border-green-200'
    };
    const colors = priorityColors[priority] || 'text-gray-700 bg-gray-50 border-gray-200';
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium border ${colors}`}>
        {priority || 'Normal'}
      </span>
    );
  };

  // Role switching function for demo purposes - remove in production
  const switchRole = (role) => {
    setUserRole(role);
    localStorage.setItem('userRole', role);
    setSelectedItem(null);
    setMarkersMap({});
    setCars([]);
    setPackages([]);
    setLoading(true);
  };

  return (
    <div className="h-full overflow-hidden bg-gray-50">
      <Sidebar />
      
      <div className="flex flex-1">
        {/* Map Section */}
        <div className="w-2/3 h-full relative">
          <div ref={mapRef} className="w-full h-full" />
          
          <div className="absolute top-4 left-4 z-10 bg-white rounded-lg shadow-lg p-3">
            <p className="text-xs text-gray-500 mb-2">Demo Role Switcher</p>
            <div className="flex space-x-2">
              <button
                onClick={() => switchRole('admin')}
                className={`px-3 py-1 text-xs rounded ${userRole === 'admin' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
              >
                Admin
              </button>
              <button
                onClick={() => switchRole('driver')}
                className={`px-3 py-1 text-xs rounded ${userRole === 'driver' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
              >
                Driver
              </button>
            </div>
          </div>

          {loading && (
            <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-gray-600">
                  Loading {userRole === 'admin' ? 'fleet locations' : 'package locations'}...
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Section */}
        <div className="w-1/3 h-full overflow-y-auto bg-white border-l border-gray-200">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 z-10">
            {userRole === 'admin' ? (
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Fleet Overview</h2>
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                    <span className="text-gray-600">Active: {cars.filter(car => car.status === 'active').length}</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                    <span className="text-gray-600">Inactive: {cars.filter(car => car.status !== 'active').length}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Package Deliveries</h2>
                <div className="flex items-center space-x-3 text-sm">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full mr-1"></div>
                    <span className="text-gray-600">{packages.filter(pkg => pkg.status === 'pending').length}</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mr-1"></div>
                    <span className="text-gray-600">{packages.filter(pkg => pkg.status === 'in-transit').length}</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-1"></div>
                    <span className="text-gray-600">{packages.filter(pkg => pkg.status === 'delivered').length}</span>
                  </div>
                </div>
              </div>
            )}
            <p className="text-sm text-gray-500 mt-1">
              Total {userRole === 'admin' ? 'vehicles' : 'packages'}: {userRole === 'admin' ? cars.length : packages.length}
            </p>
          </div>

          {/* Content */}
          <div className="px-6 py-4">
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}
            
            {loading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-gray-200 rounded-lg p-4">
                      <div className="h-4 bg-gray-300 rounded mb-2"></div>
                      <div className="h-3 bg-gray-300 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (userRole === 'admin' ? cars : packages).length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-4xl mb-4">
                  {userRole === 'admin' ? '🚗' : '📦'}
                </div>
                <p className="text-gray-500">
                  No {userRole === 'admin' ? 'vehicles' : 'packages'} found
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {userRole === 'admin' ? (
                  // Admin View - Cars
                  cars.map(car => (
                    <div
                      key={car.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md ${
                        selectedItem === car.id 
                          ? 'border-blue-500 bg-blue-50 shadow-md' 
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                      onClick={() => focusOnItem(car.id)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg text-gray-900 mb-1">
                            {car.make || 'Unknown Make'} {car.model ? car.model : ''}
                          </h3>
                          <p className="text-sm text-gray-500">Vehicle ID: {car.id}</p>
                        </div>
                        {getStatusBadge(car.status, 'car')}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-gray-500">Year</p>
                          <p className="font-medium text-gray-900">{car.year || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Type</p>
                          <p className="font-medium text-gray-900">{car.type || 'Vehicle'}</p>
                        </div>
                        {car.mileage && (
                          <div>
                            <p className="text-gray-500">Mileage</p>
                            <p className="font-medium text-gray-900">{car.mileage.toLocaleString()} mi</p>
                          </div>
                        )}
                        {car.fuelLevel && (
                          <div>
                            <p className="text-gray-500">Fuel Level</p>
                            <p className="font-medium text-gray-900">{car.fuelLevel}%</p>
                          </div>
                        )}
                      </div>

                      <div className="mt-3 flex items-center justify-between">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            focusOnItem(car.id);
                          }}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                        >
                          View on Map →
                        </button>
                        <div className="text-xs text-gray-400">
                          {car.lat && car.lng ? `${car.lat.toFixed(4)}, ${car.lng.toFixed(4)}` : 'No coordinates'}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  // Driver View - Packages
                  packages.map(pkg => (
                    <div
                      key={pkg.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md ${
                        selectedItem === pkg.id 
                          ? 'border-blue-500 bg-blue-50 shadow-md' 
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                      onClick={() => focusOnItem(pkg.id)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg text-gray-900 mb-1">
                            Package {pkg.id}
                          </h3>
                          <p className="text-sm text-gray-500">{pkg.recipientName}</p>
                        </div>
                        <div className="flex flex-col items-end space-y-1">
                          {getStatusBadge(pkg.status, 'package')}
                          {getPriorityBadge(pkg.priority)}
                        </div>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div>
                          <p className="text-gray-500">Delivery Address</p>
                          <p className="font-medium text-gray-900">{pkg.address}</p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <p className="text-gray-500">Type</p>
                            <p className="font-medium text-gray-900">{pkg.type || 'Package'}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Weight</p>
                            <p className="font-medium text-gray-900">{pkg.weight || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Delivery Date</p>
                            <p className="font-medium text-gray-900">{formatDate(pkg.deliveryDate)}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Priority</p>
                            <p className="font-medium text-gray-900 capitalize">{pkg.priority || 'Normal'}</p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 flex items-center justify-between">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            focusOnItem(pkg.id);
                          }}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                        >
                          View on Map →
                        </button>
                        <div className="text-xs text-gray-400">
                          {pkg.lat && pkg.lng ? `${pkg.lat.toFixed(4)}, ${pkg.lng.toFixed(4)}` : 'No coordinates'}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Maps;