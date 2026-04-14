import { useState, useEffect } from 'react';

// Haversine formula to calculate distance between two coordinates in meters
function getDistanceFromLatLonInMeters(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371000; // Radius of the earth in m
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in m
  return d;
}

function deg2rad(deg: number) {
  return deg * (Math.PI / 180);
}

export function useGeoLocation() {
  const [inRange, setInRange] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState<boolean>(true);

  useEffect(() => {
    const storeLat = Number(process.env.STORE_LAT);
    const storeLng = Number(process.env.STORE_LNG);
    const radius = Number(process.env.STORE_RADIUS);

    if (!storeLat || !storeLng) {
      // If no config provided, we might bypass the check or assume out of range.
      // For now, let's allow bypass if not configured.
      console.warn("Store GPS coordinates not configured. Bypassing GPS check.");
      setInRange(true);
      setChecking(false);
      return;
    }

    if (!navigator.geolocation) {
      setError("Trình duyệt của bạn không hỗ trợ định vị GPS.");
      setChecking(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;

        const distance = getDistanceFromLatLonInMeters(storeLat, storeLng, userLat, userLng);

        console.log(`Khoảng cách đến quán: ${Math.round(distance)}m (Giới hạn: ${radius}m)`);

        if (distance <= radius) {
          setInRange(true);
        } else {
          setInRange(false);
        }
        setChecking(false);
      },
      (err) => {
        console.error("GPS Error:", err);
        setError("Không thể lấy vị trí. Vui lòng cấp quyền truy cập vị trí (GPS) để đặt món.");
        setChecking(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  }, []);

  return { inRange, error, checking };
}
