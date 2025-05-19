"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNearbyProviders = exports.deleteProvider = exports.updateProvider = exports.createProvider = exports.getProvider = exports.getProviders = void 0;
const Provider_model_1 = __importDefault(require("../models/Provider.model"));
const User_model_1 = __importDefault(require("../models/User.model"));
const Service_model_1 = __importDefault(require("../models/Service.model"));
const mongoose_1 = __importDefault(require("mongoose"));
// @desc    Get all providers
// @route   GET /api/providers
// @access  Public
const getProviders = async (req, res) => {
    try {
        const providers = await Provider_model_1.default.find()
            .populate('userId', 'name email avatar phone')
            .populate('services', 'name category');
        res.status(200).json({
            success: true,
            count: providers.length,
            data: providers
        });
    }
    catch (error) {
        console.error('Get providers error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};
exports.getProviders = getProviders;
// @desc    Get single provider
// @route   GET /api/providers/:id
// @access  Public
const getProvider = async (req, res) => {
    try {
        const provider = await Provider_model_1.default.findById(req.params.id)
            .populate('userId', 'name email avatar phone')
            .populate('services', 'name category description basePrice image');
        if (!provider) {
            return res.status(404).json({
                success: false,
                message: 'Provider not found'
            });
        }
        res.status(200).json({
            success: true,
            data: provider
        });
    }
    catch (error) {
        console.error('Get provider error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};
exports.getProvider = getProvider;
// @desc    Create provider profile
// @route   POST /api/providers
// @access  Private
const createProvider = async (req, res) => {
    try {
        // Check if user is already a provider
        const existingProvider = await Provider_model_1.default.findOne({ userId: req.user?.id });
        if (existingProvider) {
            return res.status(400).json({
                success: false,
                message: 'Provider profile already exists'
            });
        }
        // Update user role to provider
        await User_model_1.default.findByIdAndUpdate(req.user?.id, { role: 'provider' });
        const { hourlyRate, description, services, availability, coordinates } = req.body;
        // Format coordinates as GeoJSON Point
        let geoJsonCoordinates;
        if (coordinates && Array.isArray(coordinates) && coordinates.length === 2) {
            geoJsonCoordinates = {
                type: 'Point',
                coordinates: [coordinates[1], coordinates[0]] // Convert [lat, lng] to GeoJSON [lng, lat]
            };
        }
        else {
            geoJsonCoordinates = {
                type: 'Point',
                coordinates: [0, 0] // Default coordinates
            };
        }
        const provider = await Provider_model_1.default.create({
            userId: req.user?.id,
            hourlyRate,
            description,
            services: services || [],
            availability: availability || {},
            coordinates: geoJsonCoordinates
        });
        // Update services providersCount
        if (services && services.length > 0) {
            await Service_model_1.default.updateMany({ _id: { $in: services } }, { $inc: { providersCount: 1 } });
        }
        res.status(201).json({
            success: true,
            data: provider
        });
    }
    catch (error) {
        console.error('Create provider error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};
exports.createProvider = createProvider;
// @desc    Update provider profile
// @route   PUT /api/providers/:id
// @access  Private
const updateProvider = async (req, res) => {
    try {
        let provider = await Provider_model_1.default.findById(req.params.id);
        if (!provider) {
            return res.status(404).json({
                success: false,
                message: 'Provider not found'
            });
        }
        // Check if user is the provider or an admin
        if (provider.userId.toString() !== req.user?.id &&
            req.user?.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this provider'
            });
        }
        const { hourlyRate, description, services, availability, coordinates, isAvailable } = req.body;
        // Handle services update
        if (services && Array.isArray(services)) {
            // Get current services
            const currentServices = provider.services.map(s => s.toString());
            // Find services to add and remove
            const servicesToAdd = services.filter(s => !currentServices.includes(s.toString()));
            const servicesToRemove = currentServices.filter(s => !services.includes(s));
            // Update services providersCount
            if (servicesToAdd.length > 0) {
                await Service_model_1.default.updateMany({ _id: { $in: servicesToAdd } }, { $inc: { providersCount: 1 } });
            }
            if (servicesToRemove.length > 0) {
                await Service_model_1.default.updateMany({ _id: { $in: servicesToRemove } }, { $inc: { providersCount: -1 } });
            }
        }
        // Format coordinates as GeoJSON Point if provided
        let updateData = {
            hourlyRate,
            description,
            services,
            availability,
            isAvailable
        };
        if (coordinates && Array.isArray(coordinates) && coordinates.length === 2) {
            updateData.coordinates = {
                type: 'Point',
                coordinates: [coordinates[1], coordinates[0]] // Convert [lat, lng] to GeoJSON [lng, lat]
            };
        }
        // Update provider
        provider = await Provider_model_1.default.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
        res.status(200).json({
            success: true,
            data: provider
        });
    }
    catch (error) {
        console.error('Update provider error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};
exports.updateProvider = updateProvider;
// @desc    Delete provider profile
// @route   DELETE /api/providers/:id
// @access  Private
const deleteProvider = async (req, res) => {
    try {
        const provider = await Provider_model_1.default.findById(req.params.id);
        if (!provider) {
            return res.status(404).json({
                success: false,
                message: 'Provider not found'
            });
        }
        // Check if user is the provider or an admin
        if (provider.userId.toString() !== req.user?.id &&
            req.user?.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this provider'
            });
        }
        // Update services providersCount
        if (provider.services.length > 0) {
            await Service_model_1.default.updateMany({ _id: { $in: provider.services } }, { $inc: { providersCount: -1 } });
        }
        // Update user role back to customer
        await User_model_1.default.findByIdAndUpdate(provider.userId, { role: 'customer' });
        await provider.deleteOne();
        res.status(200).json({
            success: true,
            message: 'Provider profile deleted successfully'
        });
    }
    catch (error) {
        console.error('Delete provider error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};
exports.deleteProvider = deleteProvider;
// @desc    Get nearby providers
// @route   GET /api/providers/nearby
// @access  Public
const getNearbyProviders = async (req, res) => {
    try {
        const { lat, lng, distance = 10, serviceId } = req.query;
        if (!lat || !lng) {
            return res.status(400).json({
                success: false,
                message: 'Please provide latitude and longitude'
            });
        }
        // Convert to numbers
        const latitude = parseFloat(lat);
        const longitude = parseFloat(lng);
        const maxDistance = parseFloat(distance);
        // Build query
        let query = {
            isAvailable: true,
            coordinates: {
                $nearSphere: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [longitude, latitude] // GeoJSON uses [longitude, latitude]
                    },
                    $maxDistance: maxDistance * 1000 // Convert km to meters
                }
            }
        };
        // Add service filter if provided
        if (serviceId) {
            query.services = new mongoose_1.default.Types.ObjectId(serviceId);
        }
        const providers = await Provider_model_1.default.find(query)
            .populate('userId', 'name email avatar phone')
            .populate('services', 'name category');
        res.status(200).json({
            success: true,
            count: providers.length,
            data: providers
        });
    }
    catch (error) {
        console.error('Get nearby providers error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};
exports.getNearbyProviders = getNearbyProviders;
