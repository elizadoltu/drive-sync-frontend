import React, { useEffect, useRef, useState } from 'react';
import API_KEY from '../utils/API_KEY'; 

const Maps = () => {
  const mapRef = useRef(null);
  const [error, setError] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [map, setMap] = useState(null);
  const [dataSource, setDataSource] = useState(null);

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
      
      const cars = await response.json();
      
      if (!cars || cars.length === 0) {
        console.warn('No car data received');
        return;
      }
      
      const points = [];
      const features = [];
      
      cars.forEach(car => {
        if (car.lat === undefined || car.lng === undefined) {
          console.warn('Car missing location data:', car);
          return;
        }

        const position = [car.lng, car.lat];
        points.push(position);
        
        const feature = new window.atlas.data.Feature(
          new window.atlas.data.Point(position),
          {
            id: car.id,
            make: car.make || 'Unknown',
            status: car.status || 'unknown',
            color: car.status === 'active' ? 'green' : 'red'
          }
        );
        
        features.push(feature);
      });
      
      source.add(features);
      
      const popup = new window.atlas.Popup();
      
      mapInstance.events.add('click', source, (e) => {
        if (e.shapes && e.shapes.length > 0) {
          const properties = e.shapes[0].getProperties();
          
          popup.setOptions({
            content: `
              <div style="padding: 8px;">
                <h3 style="margin-top: 0;">${properties.make}</h3>
                <p style="margin: 5px 0;">ID: ${properties.id}</p>
                <p style="margin: 5px 0;">Status: ${properties.status}</p>
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
          'green',
          'red'
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
    <div>
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