"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const reviewSchema = new mongoose_1.Schema({
    serviceId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Service',
        required: true
    },
    providerId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Provider',
        required: true
    },
    customerId: {
        type: mongoose_1.Schema.Types.ObjectId,
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
}, {
    timestamps: true
});
// Prevent duplicate reviews
reviewSchema.index({ customerId: 1, providerId: 1, serviceId: 1 }, { unique: true });
// Static method to calculate average rating
reviewSchema.statics.calculateAverageRating = async function (providerId) {
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
        await mongoose_1.default.model('Provider').findByIdAndUpdate(providerId, {
            rating: stats[0].averageRating
        });
    }
    else {
        await mongoose_1.default.model('Provider').findByIdAndUpdate(providerId, {
            rating: 0
        });
    }
};
// Call calculateAverageRating after save
reviewSchema.post('save', function () {
    // @ts-ignore
    this.constructor.calculateAverageRating(this.providerId);
});
// Call calculateAverageRating before remove
reviewSchema.pre('deleteOne', { document: true, query: false }, function (next) {
    // @ts-ignore
    this.constructor.calculateAverageRating(this.providerId);
    next();
});
exports.default = mongoose_1.default.model('Review', reviewSchema);
