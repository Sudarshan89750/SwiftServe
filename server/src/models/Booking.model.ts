import mongoose, { Document, Schema } from 'mongoose';

export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export interface IBooking extends Document {
  customerId: mongoose.Types.ObjectId;
  providerId: mongoose.Types.ObjectId;
  serviceId: mongoose.Types.ObjectId;
  status: BookingStatus;
  date: Date;
  time: string;
  address: string;
  price: number;
  notes?: string;
}

const bookingSchema = new Schema<IBooking>(
  {
    customerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    providerId: {
      type: Schema.Types.ObjectId,
      ref: 'Provider',
      required: true
    },
    serviceId: {
      type: Schema.Types.ObjectId,
      ref: 'Service',
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'completed', 'cancelled'],
      default: 'pending'
    },
    date: {
      type: Date,
      required: [true, 'Please provide a date']
    },
    time: {
      type: String,
      required: [true, 'Please provide a time']
    },
    address: {
      type: String,
      required: [true, 'Please provide an address']
    },
    price: {
      type: Number,
      required: [true, 'Please provide a price']
    },
    notes: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model<IBooking>('Booking', bookingSchema);