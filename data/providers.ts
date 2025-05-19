import { Provider } from '../types';

export const providers: Provider[] = [
  {
    id: "p1",
    name: "John Smith",
    email: "john@example.com",
    role: "provider",
    phone: "555-1234",
    address: "123 Main St, Anytown, USA",
    joinDate: "2022-01-15",
    services: ["s1", "s4"],
    rating: 4.8,
    jobsCompleted: 247,
    hourlyRate: 75,
    description: "Professional plumber with over 15 years of experience in residential and commercial plumbing.",
    availability: {
      "Monday": [{ start: "09:00", end: "17:00" }],
      "Tuesday": [{ start: "09:00", end: "17:00" }],
      "Wednesday": [{ start: "09:00", end: "17:00" }],
      "Thursday": [{ start: "09:00", end: "17:00" }],
      "Friday": [{ start: "09:00", end: "17:00" }]
    },
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    coordinates: [40.7128, -74.0060]
  },
  {
    id: "p2",
    name: "Maria Garcia",
    email: "maria@example.com",
    role: "provider",
    phone: "555-5678",
    address: "456 Oak Ave, Somewhere, USA",
    joinDate: "2021-11-03",
    services: ["s3"],
    rating: 4.9,
    jobsCompleted: 183,
    hourlyRate: 65,
    description: "Detailed house cleaner with eco-friendly cleaning solutions. I treat your home as if it were my own.",
    availability: {
      "Monday": [{ start: "08:00", end: "16:00" }],
      "Wednesday": [{ start: "08:00", end: "16:00" }],
      "Friday": [{ start: "08:00", end: "16:00" }]
    },
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    coordinates: [40.7282, -73.9942]
  },
  {
    id: "p3",
    name: "Robert Johnson",
    email: "robert@example.com",
    role: "provider",
    phone: "555-9012",
    address: "789 Pine St, Elsewhere, USA",
    joinDate: "2022-02-28",
    services: ["s2"],
    rating: 4.7,
    jobsCompleted: 156,
    hourlyRate: 90,
    description: "Licensed electrician specializing in residential and light commercial electrical systems.",
    availability: {
      "Monday": [{ start: "09:00", end: "18:00" }],
      "Tuesday": [{ start: "09:00", end: "18:00" }],
      "Thursday": [{ start: "09:00", end: "18:00" }],
      "Friday": [{ start: "09:00", end: "18:00" }]
    },
    avatar: "https://randomuser.me/api/portraits/men/67.jpg",
    coordinates: [40.7312, -74.0123]
  },
  {
    id: "p4",
    name: "Sarah Lee",
    email: "sarah@example.com",
    role: "provider",
    phone: "555-3456",
    address: "101 Maple Dr, Nowhere, USA",
    joinDate: "2021-09-15",
    services: ["s5"],
    rating: 4.6,
    jobsCompleted: 201,
    hourlyRate: 60,
    description: "Professional landscaper and lawn care specialist with attention to detail and quality service.",
    availability: {
      "Tuesday": [{ start: "07:00", end: "15:00" }],
      "Wednesday": [{ start: "07:00", end: "15:00" }],
      "Thursday": [{ start: "07:00", end: "15:00" }],
      "Saturday": [{ start: "08:00", end: "12:00" }]
    },
    avatar: "https://randomuser.me/api/portraits/women/22.jpg",
    coordinates: [40.7254, -73.9818]
  },
  {
    id: "p5",
    name: "David Wong",
    email: "david@example.com",
    role: "provider",
    phone: "555-7890",
    address: "202 Cedar Ln, Anyplace, USA",
    joinDate: "2022-03-10",
    services: ["s4", "s6"],
    rating: 4.9,
    jobsCompleted: 132,
    hourlyRate: 85,
    description: "HVAC technician and certified pest control specialist with 10+ years experience.",
    availability: {
      "Monday": [{ start: "10:00", end: "18:00" }],
      "Wednesday": [{ start: "10:00", end: "18:00" }],
      "Friday": [{ start: "10:00", end: "18:00" }]
    },
    avatar: "https://randomuser.me/api/portraits/men/42.jpg",
    coordinates: [40.7391, -74.0026]
  }
];
