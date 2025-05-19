export type UserRole = 'customer' | 'provider' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  address?: string;
  joinDate: string;
}

export interface Provider extends User {
  services: string[];
  rating: number;
  jobsCompleted: number;
  hourlyRate: number;
  description: string;
  availability: {
    [key: string]: {
      start: string;
      end: string;
    }[];
  };
  coordinates: [number, number]; // [latitude, longitude]
}

export interface Service {
  id: string;
  name: string;
  category: string;
  description: string;
  basePrice: number;
  image: string;
  rating: number;
  providersCount: number;
}

export interface Review {
  id: string;
  serviceId: string;
  providerId: string;
  customerId: string;
  customerName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Booking {
  id: string;
  customerId: string;
  providerId: string;
  serviceId: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  date: string;
  time: string;
  address: string;
  price: number;
  notes?: string;
  createdAt: string;
}
