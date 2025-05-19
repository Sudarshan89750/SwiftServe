import { Review } from '../types';

export const reviews: Review[] = [
  {
    id: "r1",
    serviceId: "s1",
    providerId: "p1",
    customerId: "u1",
    customerName: "Emily Johnson",
    rating: 5,
    comment: "John was extremely professional and fixed our leak quickly. Highly recommend!",
    date: "2023-05-15"
  },
  {
    id: "r2",
    serviceId: "s1",
    providerId: "p1",
    customerId: "u2",
    customerName: "Michael Brown",
    rating: 4,
    comment: "Good service and fair pricing. Would use again for plumbing needs.",
    date: "2023-04-22"
  },
  {
    id: "r3",
    serviceId: "s3",
    providerId: "p2",
    customerId: "u1",
    customerName: "Emily Johnson",
    rating: 5,
    comment: "Maria made our house spotless! Very thorough and professional.",
    date: "2023-06-01"
  },
  {
    id: "r4",
    serviceId: "s2",
    providerId: "p3",
    customerId: "u2",
    customerName: "Michael Brown",
    rating: 4,
    comment: "Robert did a great job with our electrical issues. Only taking off one star because he was a bit late.",
    date: "2023-05-10"
  },
  {
    id: "r5",
    serviceId: "s5",
    providerId: "p4",
    customerId: "u1",
    customerName: "Emily Johnson",
    rating: 5,
    comment: "Sarah transformed our yard! The lawn looks amazing now.",
    date: "2023-06-08"
  }
];
