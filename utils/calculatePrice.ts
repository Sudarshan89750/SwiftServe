import { getDistance } from 'geolib';

interface Coordinates {
  latitude: number;
  longitude: number;
}

export type LocationCoordinates = [number, number]; // [latitude, longitude]

export interface PriceBreakdown {
  basePrice: number;
  distanceSurcharge: number;
  serviceFee: number;
  total: number;
  distanceInKm: number;
}

/**
 * Convert [lat, lng] array to geolib coordinates object
 */
export const toGeoCoordinates = (coordinates: LocationCoordinates): Coordinates => {
  return {
    latitude: coordinates[0],
    longitude: coordinates[1]
  };
};

/**
 * Calculate distance between two coordinate points in kilometers
 */
export const calculateDistance = (
  userCoordinates: LocationCoordinates,
  providerCoordinates: LocationCoordinates
): number => {
  const userGeoCoords = toGeoCoordinates(userCoordinates);
  const providerGeoCoords = toGeoCoordinates(providerCoordinates);
  
  // Get distance in meters
  const distanceInMeters = getDistance(userGeoCoords, providerGeoCoords);
  
  // Convert to kilometers and round to 1 decimal place
  return Math.round(distanceInMeters / 100) / 10;
};

/**
 * Calculate price breakdown based on service base price and distance
 * Using improved distance-based pricing model from provided code
 */
export const calculatePriceBreakdown = (
  basePrice: number,
  userCoordinates: LocationCoordinates,
  providerCoordinates: LocationCoordinates,
  ratePerKm: number = 2.5,
  serviceFeePercentage: number = 5
): PriceBreakdown => {
  // Calculate distance in kilometers
  const distanceInKm = calculateDistance(userCoordinates, providerCoordinates);
  
  // Progressive rate calculation:
  // - First 3km: no surcharge
  // - 3-10km: standard rate
  // - Above 10km: 1.5x standard rate
  let distanceSurcharge = 0;
  
  if (distanceInKm > 3) {
    // Apply charge for distance between 3-10km
    const midDistance = Math.min(distanceInKm, 10) - 3;
    distanceSurcharge += midDistance * ratePerKm;
    
    // Apply premium charge for distance above 10km
    if (distanceInKm > 10) {
      const longDistance = distanceInKm - 10;
      distanceSurcharge += longDistance * (ratePerKm * 1.5);
    }
  }
  
  // Round to 2 decimal places
  distanceSurcharge = Math.round(distanceSurcharge * 100) / 100;
  
  // Calculate service fee (percentage of base price)
  const serviceFee = Math.round(basePrice * (serviceFeePercentage / 100) * 100) / 100;
  
  // Calculate total price
  const total = basePrice + distanceSurcharge + serviceFee;
  
  return {
    basePrice,
    distanceSurcharge,
    serviceFee,
    total: Math.round(total * 100) / 100,
    distanceInKm
  };
};
