import mongoose, { Document, Schema } from 'mongoose';

export interface IReview extends Document {
  serviceId: mongoose.Types.ObjectId;
  providerId: mongoose.Types.ObjectId;
  customerId: mongoose.Types.ObjectId;
  rating: number;
  comment: string;
}

const reviewSchema = new Schema<IReview>(
  {
    serviceId: {
      type: Schema.Types.ObjectId,
      ref: 'Service',
      required: true
    },
    providerId: {
      type: Schema.Types.ObjectId,
      ref: 'Provider',
      required: true
    },
    customerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    rating: {
      type: Number,
      required: [true, 'Please provide a rating'],
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      required: [true, 'Please provide a comment'],
      trim: true
    }
  },
  {
    timestamps: true
  }
);

// Prevent duplicate reviews
reviewSchema.index(
  { customerId: 1, providerId: 1, serviceId: 1 },
  { unique: true }
);

// Static method to calculate average rating
reviewSchema.statics.calculateAverageRating = async function(providerId: mongoose.Types.ObjectId) {
  const stats = await this.aggregate([
    { $match: { providerId } },
    {
      $group: {
        _id: '$providerId',
        averageRating: { $avg: '$rating' },
        numReviews: { $sum: 1 }
      }
    }
  ]);

  if (stats.length > 0) {
    await mongoose.model('Provider').findByIdAndUpdate(providerId, {
      rating: stats[0].averageRating
    });
  } else {
    await mongoose.model('Provider').findByIdAndUpdate(providerId, {
      rating: 0
    });
  }
};

// Call calculateAverageRating after save
reviewSchema.post('save', function() {
  // @ts-ignore
  this.constructor.calculateAverageRating(this.providerId);
});

// Call calculateAverageRating before remove
reviewSchema.pre('deleteOne', { document: true, query: false }, function(next: any) {
  // @ts-ignore
  this.constructor.calculateAverageRating(this.providerId);
  next();
});

export default mongoose.model<IReview>('Review', reviewSchema);