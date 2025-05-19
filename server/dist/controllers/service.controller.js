"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getServiceProviders = exports.deleteService = exports.updateService = exports.createService = exports.getService = exports.getServices = void 0;
const Service_model_1 = __importDefault(require("../models/Service.model"));
const Provider_model_1 = __importDefault(require("../models/Provider.model"));
// @desc    Get all services
// @route   GET /api/services
// @access  Public
const getServices = async (req, res) => {
    try {
        const services = await Service_model_1.default.find();
        res.status(200).json({
            success: true,
            count: services.length,
            data: services
        });
    }
    catch (error) {
        console.error('Get services error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};
exports.getServices = getServices;
// @desc    Get single service
// @route   GET /api/services/:id
// @access  Public
const getService = async (req, res) => {
    try {
        const service = await Service_model_1.default.findById(req.params.id);
        if (!service) {
            return res.status(404).json({
                success: false,
                message: 'Service not found'
            });
        }
        res.status(200).json({
            success: true,
            data: service
        });
    }
    catch (error) {
        console.error('Get service error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};
exports.getService = getService;
// @desc    Create service
// @route   POST /api/services
// @access  Private/Admin
const createService = async (req, res) => {
    try {
        const { name, category, description, basePrice, image } = req.body;
        const service = await Service_model_1.default.create({
            name,
            category,
            description,
            basePrice,
            image
        });
        res.status(201).json({
            success: true,
            data: service
        });
    }
    catch (error) {
        console.error('Create service error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};
exports.createService = createService;
// @desc    Update service
// @route   PUT /api/services/:id
// @access  Private/Admin
const updateService = async (req, res) => {
    try {
        const { name, category, description, basePrice, image } = req.body;
        let service = await Service_model_1.default.findById(req.params.id);
        if (!service) {
            return res.status(404).json({
                success: false,
                message: 'Service not found'
            });
        }
        service = await Service_model_1.default.findByIdAndUpdate(req.params.id, { name, category, description, basePrice, image }, { new: true, runValidators: true });
        res.status(200).json({
            success: true,
            data: service
        });
    }
    catch (error) {
        console.error('Update service error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};
exports.updateService = updateService;
// @desc    Delete service
// @route   DELETE /api/services/:id
// @access  Private/Admin
const deleteService = async (req, res) => {
    try {
        const service = await Service_model_1.default.findById(req.params.id);
        if (!service) {
            return res.status(404).json({
                success: false,
                message: 'Service not found'
            });
        }
        // Remove service from providers
        await Provider_model_1.default.updateMany({ services: service._id }, { $pull: { services: service._id } });
        await service.deleteOne();
        res.status(200).json({
            success: true,
            message: 'Service deleted successfully'
        });
    }
    catch (error) {
        console.error('Delete service error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};
exports.deleteService = deleteService;
// @desc    Get providers for a service
// @route   GET /api/services/:id/providers
// @access  Public
const getServiceProviders = async (req, res) => {
    try {
        const service = await Service_model_1.default.findById(req.params.id);
        if (!service) {
            return res.status(404).json({
                success: false,
                message: 'Service not found'
            });
        }
        const providers = await Provider_model_1.default.find({ services: service._id })
            .populate('userId', 'name email avatar phone');
        res.status(200).json({
            success: true,
            count: providers.length,
            data: providers
        });
    }
    catch (error) {
        console.error('Get service providers error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};
exports.getServiceProviders = getServiceProviders;
