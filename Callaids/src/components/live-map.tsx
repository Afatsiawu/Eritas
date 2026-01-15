'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Skeleton } from './ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { MapPin } from 'lucide-react';

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

// Map styles for light and dark modes
const mapStyles = {
  dark: [
    { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
    { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
    {
      featureType: 'administrative.locality',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#d59563' }],
    },
    {
      featureType: 'poi',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#d59563' }],
    },
    {
      featureType: 'poi.park',
      elementType: 'geometry',
      stylers: [{ color: '#263c3f' }],
    },
    {
      featureType: 'poi.park',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#6b9a76' }],
    },
    {
      featureType: 'road',
      elementType: 'geometry',
      stylers: [{ color: '#38414e' }],
    },
    {
      featureType: 'road',
      elementType: 'geometry.stroke',
      stylers: [{ color: '#212a37' }],
    },
    {
      featureType: 'road',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#9ca5b3' }],
    },
    {
      featureType: 'road.highway',
      elementType: 'geometry',
      stylers: [{ color: '#746855' }],
    },
    {
      featureType: 'road.highway',
      elementType: 'geometry.stroke',
      stylers: [{ color: '#1f2835' }],
    },
    {
      featureType: 'road.highway',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#f3d19c' }],
    },
    {
      featureType: 'transit',
      elementType: 'geometry',
      stylers: [{ color: '#2f3948' }],
    },
    {
      featureType: 'transit.station',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#d59563' }],
    },
    {
      featureType: 'water',
      elementType: 'geometry',
      stylers: [{ color: '#17263c' }],
    },
    {
      featureType: 'water',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#515c6d' }],
    },
    {
      featureType: 'water',
      elementType: 'labels.text.stroke',
      stylers: [{ color: '#17263c' }],
    },
  ],
  light: [], // Default Google Maps style
};

const loadGoogleMapsScript = (callback: () => void) => {
  if (!GOOGLE_MAPS_API_KEY) {
    console.error("Google Maps API key is missing.");
    return;
  }
  
  if (window.google && window.google.maps) {
    callback();
    return;
  }
  
  const existingScript = document.getElementById('googleMapsScript');
  if (existingScript) {
    existingScript.addEventListener('load', () => callback());
    return;
  }

  const script = document.createElement('script');
  script.id = 'googleMapsScript';
  script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
  script.async = true;
  script.defer = true;
  script.onload = () => {
    callback();
  };
  script.onerror = () => {
    console.error("Google Maps script failed to load.");
  };
  document.head.appendChild(script);
};

export default function LiveMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const [isApiLoaded, setIsApiLoaded] = useState(false);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [theme, setTheme] = useState('light');

   useEffect(() => {
    // Determine theme based on system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark');
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => setTheme(e.matches ? 'dark' : 'light');
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    if (GOOGLE_MAPS_API_KEY) {
      loadGoogleMapsScript(() => {
        setIsApiLoaded(true);
      });
    }
  }, []);

  useEffect(() => {
    if (isApiLoaded && mapRef.current && !map) {
      const mapOptions: google.maps.MapOptions = {
        center: { lat: 5.6037, lng: -0.1870 }, // Centered on Accra, Ghana
        zoom: 12,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        styles: theme === 'dark' ? mapStyles.dark : mapStyles.light,
      };
      
      const mapInstance = new window.google.maps.Map(mapRef.current, mapOptions);
      setMap(mapInstance);
    }
  }, [isApiLoaded, map, theme]);

  // Update map style when theme changes
  useEffect(() => {
    if (map) {
      map.setOptions({
        styles: theme === 'dark' ? mapStyles.dark : mapStyles.light,
      });
    }
  }, [theme, map]);
  
  if (!GOOGLE_MAPS_API_KEY) {
    return (
        <div className="w-full h-full bg-secondary rounded-lg flex flex-col items-center justify-center p-4">
            <Alert variant="destructive" className="max-w-md">
                <MapPin className="h-4 w-4" />
                <AlertTitle>Google Maps API Key is Missing</AlertTitle>
                <AlertDescription>
                    Please add your Google Maps API key to the .env file as <code className="font-mono bg-destructive/20 px-1 py-0.5 rounded">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> to display the map.
                </AlertDescription>
            </Alert>
        </div>
    );
  }

  return (
    <>
      {!isApiLoaded && <Skeleton className="w-full h-full" />}
      <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
    </>
  );
}
