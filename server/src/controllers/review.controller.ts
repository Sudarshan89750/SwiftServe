import { Request, Response } from 'express';
import Review from '../models/Review.model';
import Booking from '../models/Booking.model';
import Provider from '../models/Provider.model';
import Service from '../models/Service.model';

// @desc    Get all reviews
// @route   GET /api/reviews
// @access  Public
export const getReviews = async (req: Request, res: Response) => {
  try {
    const reviews = await Review.find()
      .populate('customerId', 'name')
      .populate('providerId', 'userId')
      .populate('serviceId', 'name');
    
    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get reviews for a provider
// @route   GET /api/reviews/provider/:providerId
// @access  Public
export const getProviderReviews = async (req: Request, res: Response) => {
  try {
    const reviews = await Review.find({ providerId: req.params.providerId })
      .populate('customerId', 'name avatar')
      .populate('serviceId', 'name')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } catch (error) {
    console.error('Get provider reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get reviews for a service
// @route   GET /api/reviews/service/:serviceId
// @access  Public
export const getServiceReviews = async (req: Request, res: Response) => {
  try {
    const reviews = await Review.find({ serviceId: req.params.serviceId })
      .populate('customerId', 'name avatar')
      .populate({
        path: 'providerId',
        populate: {
          path: 'userId',
          select: 'name'
        }
      })
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } catch (error) {
    console.error('Get service reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Create review
// @route   POST /api/reviews
// @access  Private
export const createReview = async (req: Request, res: Response) => {
  try {
    const { providerId, serviceId, rating, comment } = req.body;
    
    // Check if provider and service exist
    const provider = await Provider.findById(providerId);
    const service = await Service.findById(serviceId);
    
    if (!provider || !service) {
      return res.status(404).json({
        success: false,
        message: 'Provider or service not found'
      });
    }
    
    // Check if user has a completed booking with this provider and service
    const booking = await Booking.findOne({
      customerId: req.user?.id,
      providerId,
      serviceId,
      status: 'completed'
    });
    
    if (!booking) {
      return res.status(400).json({
        success: false,
        message: 'You can only review services you have used'
      });
    }
    
    // Check if user has already reviewed this provider for this service
    const existingReview = await Review.findOne({
      customerId: req.user?.id,
      providerId,
      serviceId
    });
    
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this service'
      });
    }
    
    // Create review
    const review = await Review.create({
      customerId: req.user?.id,
      providerId,
      serviceId,
      rating,
      comment
    });
    
    // Update service rating
    const serviceReviews = await Review.find({ serviceId });
    const serviceRating = serviceReviews.reduce((acc, item) => acc + item.rating, 0) / serviceReviews.length;
    
    await Service.findByIdAndUpdate(
      serviceId,
      { rating: serviceRating }
    );
    
    res.status(201).json({
      success: true,
      data: review
    });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update review
// @route   PUT /api/reviews/:id
// @access  Private
export const updateReview = async (req: Request, res: Response) => {
  try {
    const { rating, comment } = req.body;
    
    const review = await Review.findById(req.params.id);
    
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }
    
    // Check if user is the author of the review
    if (review.customerId.toString() !== req.user?.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this review'
      });
    }
    
    // Update review
    review.rating = rating;
    review.comment = comment;
    await review.save();
    
    // Update service rating
    const serviceReviews = await Review.find({ serviceId: review.serviceId });
    const serviceRating = serviceReviews.reduce((acc, item) => acc + item.rating, 0) / serviceReviews.length;
    
    await Service.findByIdAndUpdate(
      review.serviceId,
      { rating: serviceRating }
    );
    
    res.status(200).json({
      success: true,
      data: review
    });
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private
export const deleteReview = async (req: Request, res: Response) => {
  try {
    const review = await Review.findById(req.params.id);
    
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }
    
    // Check if user is the author of the review or an admin
    if (review.customerId.toString() !== req.user?.id && req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this review'
      });
    }
    
    const serviceId = review.serviceId;
    
    await review.deleteOne();
    
    // Update service rating
    const serviceReviews = await Review.find({ serviceId });
    
    if (serviceReviews.length > 0) {
      const serviceRating = serviceReviews.reduce((acc, item) => acc + item.rating, 0) / serviceReviews.length;
      
      await Service.findByIdAndUpdate(
        serviceId,
        { rating: serviceRating }
      );
    }
    
    res.status(200).json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};