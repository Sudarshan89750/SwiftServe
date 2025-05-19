"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateBookingStatus = exports.createBooking = exports.getBooking = exports.getUserBookings = exports.getBookings = void 0;
const Booking_model_1 = __importDefault(require("../models/Booking.model"));
const Provider_model_1 = __importDefault(require("../models/Provider.model"));
const Service_model_1 = __importDefault(require("../models/Service.model"));
// @desc    Get all bookings
// @route   GET /api/bookings
// @access  Private/Admin
const getBookings = async (req, res) => {
    try {
        const bookings = await Booking_model_1.default.find()
            .populate('customerId', 'name email')
            .populate('providerId', 'userId')
            .populate('serviceId', 'name category');
        res.status(200).json({
            success: true,
            count: bookings.length,
            data: bookings
        });
    }
    catch (error) {
        console.error('Get bookings error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};
exports.getBookings = getBookings;
// @desc    Get user bookings
// @route   GET /api/bookings/user
// @access  Private
const getUserBookings = async (req, res) => {
    try {
        const userId = req.user?.id;
        const userRole = req.user?.role;
        let query = {};
        // If user is a customer, get their bookings
        if (userRole === 'customer') {
            query = { customerId: userId };
        }
        // If user is a provider, get bookings for their provider profile
        if (userRole === 'provider') {
            const provider = await Provider_model_1.default.findOne({ userId });
            if (!provider) {
                return res.status(404).json({
                    success: false,
                    message: 'Provider profile not found'
                });
            }
            query = { providerId: provider._id };
        }
        const bookings = await Booking_model_1.default.find(query)
            .populate('customerId', 'name email')
            .populate({
            path: 'providerId',
            populate: {
                path: 'userId',
                select: 'name email'
            }
        })
            .populate('serviceId', 'name category')
            .sort({ date: -1 });
        res.status(200).json({
            success: true,
            count: bookings.length,
            data: bookings
        });
    }
    catch (error) {
        console.error('Get user bookings error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};
exports.getUserBookings = getUserBookings;
// @desc    Get single booking
// @route   GET /api/bookings/:id
// @access  Private
const getBooking = async (req, res) => {
    try {
        const booking = await Booking_model_1.default.findById(req.params.id)
            .populate('customerId', 'name email phone')
            .populate({
            path: 'providerId',
            populate: {
                path: 'userId',
                select: 'name email phone'
            }
        })
            .populate('serviceId', 'name category description basePrice');
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }
        // Check if user is authorized to view this booking
        const userId = req.user?.id;
        const userRole = req.user?.role;
        if (userRole !== 'admin') {
            if (userRole === 'customer' && booking.customerId._id.toString() !== userId) {
                return res.status(403).json({
                    success: false,
                    message: 'Not authorized to view this booking'
                });
            }
            if (userRole === 'provider') {
                const provider = await Provider_model_1.default.findOne({ userId });
                if (!provider || booking.providerId._id.toString() !== provider._id.toString()) {
                    return res.status(403).json({
                        success: false,
                        message: 'Not authorized to view this booking'
                    });
                }
            }
        }
        res.status(200).json({
            success: true,
            data: booking
        });
    }
    catch (error) {
        console.error('Get booking error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};
exports.getBooking = getBooking;
// @desc    Create booking
// @route   POST /api/bookings
// @access  Private
const createBooking = async (req, res) => {
    try {
        const { providerId, serviceId, date, time, address, notes } = req.body;
        // Check if service exists
        const service = await Service_model_1.default.findById(serviceId);
        if (!service) {
            return res.status(404).json({
                success: false,
                message: 'Service not found'
            });
        }
        // Check if provider exists
        const provider = await Provider_model_1.default.findById(providerId);
        if (!provider) {
            return res.status(404).json({
                success: false,
                message: 'Provider not found'
            });
        }
        // Check if provider offers this service
        if (!provider.services.includes(service._id)) {
            return res.status(400).json({
                success: false,
                message: 'Provider does not offer this service'
            });
        }
        // Calculate price (base price + provider hourly rate)
        const price = service.basePrice + provider.hourlyRate;
        // Create booking
        const booking = await Booking_model_1.default.create({
            customerId: req.user?.id,
            providerId,
            serviceId,
            date,
            time,
            address,
            price,
            notes
        });
        res.status(201).json({
            success: true,
            data: booking
        });
    }
    catch (error) {
        console.error('Create booking error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};
exports.createBooking = createBooking;
// @desc    Update booking status
// @route   PUT /api/bookings/:id/status
// @access  Private
const updateBookingStatus = async (req, res) => {
    try {
        const { status } = req.body;
        if (!['pending', 'confirmed', 'completed', 'cancelled'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status'
            });
        }
        const booking = await Booking_model_1.default.findById(req.params.id);
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }
        // Check if user is authorized to update this booking
        const userId = req.user?.id;
        const userRole = req.user?.role;
        if (userRole !== 'admin') {
            if (userRole === 'customer' && booking.customerId.toString() !== userId) {
                return res.status(403).json({
                    success: false,
                    message: 'Not authorized to update this booking'
                });
            }
            if (userRole === 'provider') {
                const provider = await Provider_model_1.default.findOne({ userId });
                if (!provider || booking.providerId.toString() !== provider._id.toString()) {
                    return res.status(403).json({
                        success: false,
                        message: 'Not authorized to update this booking'
                    });
                }
            }
            // Customers can only cancel bookings
            if (userRole === 'customer' && status !== 'cancelled') {
                return res.status(403).json({
                    success: false,
                    message: 'Customers can only cancel bookings'
                });
            }
            // Providers can confirm, complete, or cancel bookings
            if (userRole === 'provider' && !['confirmed', 'completed', 'cancelled'].includes(status)) {
                return res.status(403).json({
                    success: false,
                    message: 'Providers can only confirm, complete, or cancel bookings'
                });
            }
        }
        // Update booking status
        booking.status = status;
        await booking.save();
        // If booking is completed, increment provider's jobsCompleted count
        if (status === 'completed') {
            await Provider_model_1.default.findByIdAndUpdate(booking.providerId, { $inc: { jobsCompleted: 1 } });
        }
        res.status(200).json({
            success: true,
            data: booking
        });
    }
    catch (error) {
        console.error('Update booking status error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};
exports.updateBookingStatus = updateBookingStatus;
