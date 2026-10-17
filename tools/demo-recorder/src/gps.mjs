import { requireDemo } from './contracts.mjs';

export function demoGeolocation(attendance) {
  requireDemo(attendance?.recordGps === true, 'GPS_REQUIRED', 'Keep attendance.recordGps enabled for the punch training video.');
  const location = attendance.geolocation;
  requireDemo(location?.mode === 'simulated-demo', 'GPS_CONFIG_REQUIRED', 'Configure an explicitly labeled simulated-demo location before recording punches.');
  const { latitude, longitude, accuracy } = location;
  requireDemo(Number.isFinite(latitude) && latitude >= -90 && latitude <= 90 && Number.isFinite(longitude) && longitude >= -180 && longitude <= 180 && Number.isFinite(accuracy) && accuracy >= 0, 'GPS_CONFIG_INVALID', 'Demo latitude, longitude and accuracy must be valid numeric coordinates.');
  return { latitude, longitude, accuracy };
}

export function requireRecordedLocation(punch, event, location) {
  const lat = punch[`${event}Lat`];
  const lng = punch[`${event}Lng`];
  requireDemo(lat !== null && lat !== undefined && lat !== '' && lng !== null && lng !== undefined && lng !== '' && Number.isFinite(Number(lat)) && Number.isFinite(Number(lng)) && Math.abs(Number(lat) - location.latitude) < 0.00001 && Math.abs(Number(lng) - location.longitude) < 0.00001, 'GPS_UNCONFIRMED', 'The punch response did not confirm the configured demo GPS coordinates. Reconcile the punch before retrying.');
}
