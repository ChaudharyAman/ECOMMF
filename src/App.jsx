import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { RouterProvider } from 'react-router-dom';
import { loadUser } from './features/auth/authSlice';
import api from './utils/api';

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
        // We only want to track once per session to avoid spamming
        if (sessionStorage.getItem('visitorTracked')) return;

        // Ensure persistent visitor ID
        let visitorId = localStorage.getItem('visitorId');
        if (!visitorId) {
          visitorId = 'v_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
          localStorage.setItem('visitorId', visitorId);
        }

        // 1. Immediately track the visitor hit to ensure they are captured
        try {
          const response = await api.post('/visitors/track', { 
            location: 'Unknown',
            visitorId 
          });
          if (response.status === 200) {
            sessionStorage.setItem('visitorTracked', 'true');
          }
        } catch (e) {
          console.error('Failed initial tracking', e);
        }

        // 2. Ask for location in the background
        if ('geolocation' in navigator) {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              const { latitude, longitude } = position.coords;
              let locationData = '';
              try {
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
              
              // 3. Send a specifically flagged update to augment the row with location data
              try {
                await api.post('/visitors/track', { 
                  location: locationData, 
                  isLocationUpdate: true,
                  visitorId 
                });
              } catch (e) {
                console.error('Failed to update tracking location', e);
              }
            },
            (error) => {
              // Location access denied or failed - no action needed since we already logged the visit above
              console.log('Location access denied or failed. Visit already tracked without location.');
            },
            { timeout: 10000 } // Don't wait forever for location, but gave more time
          );
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
