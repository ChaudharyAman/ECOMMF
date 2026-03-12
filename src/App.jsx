import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { RouterProvider } from 'react-router-dom';
import { loadUser } from './features/auth/authSlice';

const App = ({ router }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      dispatch(loadUser());
    }

    // Track visitor and optionally request location
    const trackVisitor = async () => {
      try {
        // We only want to track once per session to avoid spamming location requests
        if (sessionStorage.getItem('visitorTracked')) return;

        let locationData = 'Unknown';
        
        // Function to actually send the tracking request
        const sendTracking = async (loc) => {
           try {
              const response = await fetch(`${import.meta.env.VITE_API_URL}/visitors/track`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ location: loc })
              });
              if (response.ok) {
                sessionStorage.setItem('visitorTracked', 'true');
              }
           } catch (e) {
              console.error('Failed to track visitor', e);
           }
        };

        // Ask for location
        if ('geolocation' in navigator) {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              // Successfully got coordinates. Try to reverse geocode for a nice string (optional, or just send coords)
              const { latitude, longitude } = position.coords;
              try {
                // Using a free reverse geocoding API to get City, Country
                const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                const geoData = await geoRes.json();
                
                if (geoData && geoData.address) {
                   const city = geoData.address.city || geoData.address.town || geoData.address.village || '';
                   const country = geoData.address.country || '';
                   locationData = [city, country].filter(Boolean).join(', ') || `Lat: ${latitude.toFixed(2)}, Lng: ${longitude.toFixed(2)}`;
                } else {
                   locationData = `Lat: ${latitude.toFixed(2)}, Lng: ${longitude.toFixed(2)}`;
                }
              } catch (geoError) {
                locationData = `Lat: ${latitude.toFixed(2)}, Lng: ${longitude.toFixed(2)}`;
              }
              await sendTracking(locationData);
            },
            (error) => {
              // User denied location or error occurred
              console.log('Location access denied or failed. Tracking without location.');
              sendTracking('Unknown (Denied/Failed)');
            },
            { timeout: 5000 } // Don't wait forever for location
          );
        } else {
          // Geolocation not supported
          sendTracking('Unknown (Not Supported)');
        }
      } catch (err) {
        console.error('Tracking process error:', err);
      }
    };

    trackVisitor();
  }, [dispatch]);

  return <RouterProvider router={router} />;
};

export default App;
