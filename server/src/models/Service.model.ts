import mongoose, { Document, Schema } from 'mongoose';

export interface IService extends Document {
  name: string;
  category: string;
  description: string;
  basePrice: number;
  image: string;
  rating: number;
  providersCount: number;
}

const serviceSchema = new Schema<IService>(
  {
    name: {
      type: String,
      required: [true, 'Please provide a service name'],
      trim: true,
      maxlength: [100, 'Service name cannot be more than 100 characters']
    },
    category: {
      type: String,
      required: [true, 'Please provide a category'],
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Please provide a description']
    },
    basePrice: {
      type: Number,
      required: [true, 'Please provide a base price']
    },
    image: {
      type: String,
      required: [true, 'Please provide an image URL']
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    providersCount: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual for providers
serviceSchema.virtual('providers', {
  ref: 'Provider',
  localField: '_id',
  foreignField: 'services',
  justOne: false
});

export default mongoose.model<IService>('Service', serviceSchema);