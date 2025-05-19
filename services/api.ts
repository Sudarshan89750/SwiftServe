import axios from 'axios';
import { Service, Provider, Booking, Review } from '../types';

const API_URL = 'http://localhost:5000/api';

// Set up axios instance with token
const api = axios.create({
  baseURL: API_URL
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Services API
export const getServices = async (): Promise<Service[]> => {
  const response = await api.get('/services');
  return response.data.data;
};

export const getService = async (id: string): Promise<Service> => {
  const response = await api.get(`/services/${id}`);
  return response.data.data;
};

export const getServiceProviders = async (serviceId: string): Promise<Provider[]> => {
  const response = await api.get(`/services/${serviceId}/providers`);
  return response.data.data;
};

// Providers API
export const getProviders = async (): Promise<Provider[]> => {
  const response = await api.get('/providers');
  return response.data.data;
};

export const getProvider = async (id: string): Promise<Provider> => {
  const response = await api.get(`/providers/${id}`);
  return response.data.data;
};

export const getNearbyProviders = async (
  lat: number, 
  lng: number, 
  distance: number = 10,
  serviceId?: string
): Promise<Provider[]> => {
  let url = `/providers/nearby?lat=${lat}&lng=${lng}&distance=${distance}`;
  if (serviceId) {
    url += `&serviceId=${serviceId}`;
  }
  const response = await api.get(url);
  return response.data.data;
};

export const createProviderProfile = async (
  providerData: {
    hourlyRate: number;
    description: string;
    services?: string[];
    availability?: Record<string, { start: string; end: string }[]>;
    coordinates?: [number, number];
  }
): Promise<Provider> => {
  const response = await api.post('/providers', providerData);
  return response.data.data;
};

export const updateProviderProfile = async (
  id: string,
  providerData: {
    hourlyRate?: number;
    description?: string;
    services?: string[];
    availability?: Record<string, { start: string; end: string }[]>;
    coordinates?: [number, number];
    isAvailable?: boolean;
  }
): Promise<Provider> => {
  const response = await api.put(`/providers/${id}`, providerData);
  return response.data.data;
};

// Bookings API
export const getUserBookings = async (): Promise<Booking[]> => {
  const response = await api.get('/bookings/user');
  return response.data.data;
};

export const getBooking = async (id: string): Promise<Booking> => {
  const response = await api.get(`/bookings/${id}`);
  return response.data.data;
};

export const createBooking = async (
  bookingData: {
    providerId: string;
    serviceId: string;
    date: string;
    time: string;
    address: string;
    notes?: string;
  }
): Promise<Booking> => {
  const response = await api.post('/bookings', bookingData);
  return response.data.data;
};

export const updateBookingStatus = async (
  id: string,
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
): Promise<Booking> => {
  const response = await api.put(`/bookings/${id}/status`, { status });
  return response.data.data;
};

// Reviews API
export const getProviderReviews = async (providerId: string): Promise<Review[]> => {
  const response = await api.get(`/reviews/provider/${providerId}`);
  return response.data.data;
};

export const getServiceReviews = async (serviceId: string): Promise<Review[]> => {
  const response = await api.get(`/reviews/service/${serviceId}`);
  return response.data.data;
};

export const createReview = async (
  reviewData: {
    providerId: string;
    serviceId: string;
    rating: number;
    comment: string;
  }
): Promise<Review> => {
  const response = await api.post('/reviews', reviewData);
  return response.data.data;
};

export const updateReview = async (
  id: string,
  reviewData: {
    rating: number;
    comment: string;
  }
): Promise<Review> => {
  const response = await api.put(`/reviews/${id}`, reviewData);
  return response.data.data;
};

export const deleteReview = async (id: string): Promise<void> => {
  await api.delete(`/reviews/${id}`);
};