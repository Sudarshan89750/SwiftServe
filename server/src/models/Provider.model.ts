import mongoose, { Document, Schema } from 'mongoose';

interface TimeSlot {
  start: string;
  end: string;
}

interface Availability {
  [key: string]: TimeSlot[];
}

export interface IProvider extends Document {
  userId: mongoose.Types.ObjectId;
  services: mongoose.Types.ObjectId[];
  rating: number;
  jobsCompleted: number;
  hourlyRate: number;
  description: string;
  availability: Availability;
  coordinates: {
    type: string;
    coordinates: [number, number]; // [longitude, latitude] for GeoJSON
  };
  isAvailable: boolean;
}

const providerSchema = new Schema<IProvider>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    services: [{
      type: Schema.Types.ObjectId,
      ref: 'Service'
    }],
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    jobsCompleted: {
      type: Number,
      default: 0
    },
    hourlyRate: {
      type: Number,
      required: [true, 'Please provide an hourly rate']
    },
    description: {
      type: String,
      required: [true, 'Please provide a description']
    },
    availability: {
      type: Map,
      of: [{
        start: String,
        end: String
      }],
      default: {}
    },
    coordinates: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number],
        validate: {
          validator: function(v: number[]) {
            return v.length === 2;
          },
          message: 'Coordinates must be [longitude, latitude]'
        }
      }
    },
    isAvailable: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

// Create a 2dsphere index for geospatial queries
providerSchema.index({ coordinates: '2dsphere' });

export default mongoose.model<IProvider>('Provider', providerSchema);