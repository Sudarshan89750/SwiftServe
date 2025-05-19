import { User } from '../types';

export const mockUsers: User[] = [
  {
    id: "u1",
    name: "Customer Demo",
    email: "customer@example.com",
    role: "customer",
    avatar: "https://randomuser.me/api/portraits/women/17.jpg",
    phone: "555-1111",
    address: "123 Customer St, City, USA",
    joinDate: "2022-01-10"
  },
  {
    id: "u2",
    name: "Provider Demo",
    email: "provider@example.com",
    role: "provider",
    avatar: "https://randomuser.me/api/portraits/men/42.jpg",
    phone: "555-2222",
    address: "456 Provider Ave, City, USA",
    joinDate: "2022-02-15"
  },
  {
    id: "u3",
    name: "Admin Demo",
    email: "admin@example.com",
    role: "admin",
    avatar: "https://randomuser.me/api/portraits/men/89.jpg",
    phone: "555-3333",
    address: "789 Admin Blvd, City, USA",
    joinDate: "2022-01-05"
  }
];
