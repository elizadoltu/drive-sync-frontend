import React, { useEffect, useRef, useState } from 'react';
import API_KEY from '../utils/API_KEY';
import Sidebar from '../components/Sidebar';

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

  useEffect(() => {
    window.initMap = () => setMapLoaded(true);
    const loadScript = () => {
      if (document.getElementById('google-maps-script')) return;
      const script = document.createElement('script');
      script.id = 'google-maps-script';
      script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=marker&callback=initMap&loading=async`;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    };
    loadScript();
    return () => { window.initMap = undefined; };
  }, []);

  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;
    const map = new window.google.maps.Map(mapRef.current, {
      center: { lat: 37.7749, lng: -122.4194 },
      zoom: 4,
      mapId: 'c1234567-89ab-cdef-0123-456789abcdef',
    });
    mapInstanceRef.current = map;
    if (userRole === 'admin') fetchCarLocations(map);
    else fetchPackageLocations(map);
  }, [mapLoaded, userRole]);

  const fetchCarLocations = async (map) => {
    try {
      setLoading(true);
      const res = await fetch('https://maps-dot-cloud-app-455515.lm.r.appspot.com/api/maps');
      if (!res.ok) throw new Error(`Status: ${res.status}`);
      const data = await res.json();
      setCars(data);
      placeMarkers(map, data, 'car');
    } catch (err) {
      setError('Failed to fetch car data.');
    }
    setLoading(false);
  };

  const fetchPackageLocations = async (map) => {
    try {
      setLoading(true);
      const res = await fetch('https://maps-dot-cloud-app-455515.lm.r.appspot.com/api/trips');
      if (!res.ok) {
        const mockPackages = [
          {
            id: 1,
            latitude: 37.7749,
            longitude: -122.4194,
            recipientName: 'Alice Johnson',
            status: 'in-transit',
          },
          {
            id: 2,
            latitude: 34.0522,
            longitude: -118.2437,
            recipientName: 'Bob Smith',
            status: 'pending',
          },
          {
            id: 3,
            latitude: 40.7128,
            longitude: -74.006,
            recipientName: 'Carol Davis',
            status: 'delivered',
          },
          {
            id: 4,
            latitude: 41.8781,
            longitude: -87.6298,
            recipientName: 'David Lee',
            status: 'in-transit',
          },
          {
            id: 5,
            latitude: 29.7604,
            longitude: -95.3698,
            recipientName: 'Eva Martinez',
            status: 'pending',
          },
        ];
        setPackages(mockPackages);
        placeMarkers(map, mockPackages, 'package');
        setLoading(false);
        return;
      } else {
        setPackages(res.json());
        placeMarkers(map, await res.json(), 'package');
        return;
      }
      
      const data = await res.json();
      setPackages(data);
      placeMarkers(map, data, 'package');
    } catch (err) {
      setError('Failed to fetch package data.');
    }
    setLoading(false);
  };

  const placeMarkers = (map, items, type) => {
    const bounds = new window.google.maps.LatLngBounds();
    const newMarkerMap = {};

    items.forEach(item => {
      const position = { lat: item.latitude, lng: item.longitude };
      bounds.extend(position);

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

      const marker = new window.google.maps.Marker({
        position,
        map,
        icon,
        title: type === 'car' ? `${item.make || 'Car'} (${item.id})` : `Package ${item.id}`
      });

      const infoWindow = new window.google.maps.InfoWindow({
        content: `<div><h3>${type === 'car' ? item.make : 'Package'} ${item.id}</h3><p>Status: ${item.status}</p></div>`
      });

      marker.addListener('click', () => {
        Object.values(newMarkerMap).forEach(({ infoWindow }) => infoWindow.close());
        infoWindow.open(map, marker);
        setSelectedItem(item.id);
      });

      newMarkerMap[item.id] = { marker, infoWindow };
    });

    setMarkersMap(newMarkerMap);
    if (items.length) map.fitBounds(bounds);
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
              className={`mb-3 p-4 rounded border shadow-sm cursor-pointer transition ${
                selectedItem === item.id ? 'bg-blue-50 border-blue-500' : 'bg-white hover:border-gray-300'
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
