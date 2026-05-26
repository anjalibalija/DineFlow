import { useEffect, useState, useRef } from 'react';
import { MapPin } from 'lucide-react';

const RestaurantMap = ({ latitude, longitude, name, address }) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      console.error('Google Maps API key is missing from environment variables.');
      setLoadError(true);
      return;
    }

    const scriptId = 'google-maps-script';
    const existingScript = document.getElementById(scriptId);

    if (existingScript) {
      if (window.google && window.google.maps) {
        setLoaded(true);
      } else {
        const checkInterval = setInterval(() => {
          if (window.google && window.google.maps) {
            setLoaded(true);
            clearInterval(checkInterval);
          }
        }, 100);
        return () => clearInterval(checkInterval);
      }
      return;
    }

    // Define the global callback function required by Google Maps script
    window.initGoogleMapCallback = () => {
      setLoaded(true);
    };

    const script = document.createElement('script');
    script.id = scriptId;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initGoogleMapCallback`;
    script.async = true;
    script.defer = true;
    script.onerror = () => {
      console.error('Failed to load Google Maps script.');
      setLoadError(true);
    };

    document.head.appendChild(script);
  }, []);

  useEffect(() => {
    if (!loaded || !window.google || !mapContainerRef.current) return;

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    if (isNaN(lat) || isNaN(lng)) return;

    // Initialize the map
    const mapOptions = {
      center: { lat, lng },
      zoom: 15,
      mapTypeControl: false,
      streetViewControl: false,
    };

    const map = new window.google.maps.Map(mapContainerRef.current, mapOptions);
    mapRef.current = map;

    // Add Marker
    const marker = new window.google.maps.Marker({
      position: { lat, lng },
      map: map,
      title: name,
    });

    // Add InfoWindow
    const infoWindow = new window.google.maps.InfoWindow({
      content: `<div style="color: #1a1a1a; font-family: sans-serif; padding: 4px;">
        <h4 style="margin: 0 0 4px 0; font-weight: 600;">${name}</h4>
        <p style="margin: 0; font-size: 12px; color: #666;">${address}</p>
      </div>`,
    });

    marker.addListener('click', () => {
      infoWindow.open(map, marker);
    });

    // Auto-open info window
    infoWindow.open(map, marker);

  }, [loaded, latitude, longitude, name, address]);

  if (loadError) {
    return (
      <div className="space-y-3">
        <h3 className="font-serif font-bold text-brown-900 text-xl flex items-center gap-2">
          <MapPin className="text-gold-500" size={20} /> Location & Directions
        </h3>
        <div className="w-full h-80 rounded-2xl border border-red-500/20 bg-red-50/50 flex flex-col items-center justify-center p-4 text-center">
          <p className="text-red-700 font-semibold">Map configuration error</p>
          <p className="text-xs text-red-500 mt-1">Please verify your VITE_GOOGLE_MAPS_API_KEY in frontend/.env</p>
        </div>
      </div>
    );
  }

  if (isNaN(parseFloat(latitude)) || isNaN(parseFloat(longitude))) {
    return null;
  }

  return (
    <div className="space-y-3">
      <h3 className="font-serif font-bold text-brown-900 text-xl flex items-center gap-2">
        <MapPin className="text-gold-500" size={20} /> Location & Directions
      </h3>
      <div 
        ref={mapContainerRef} 
        className="w-full h-80 rounded-2xl border border-gold-500/20 shadow-md relative z-10 overflow-hidden"
        style={{ minHeight: '300px' }}
      />
      <p className="text-xs text-brown-500 italic mt-1.5 flex items-center gap-1">
        📍 Coordinates: {latitude}, {longitude}
      </p>
    </div>
  );
};

export default RestaurantMap;
