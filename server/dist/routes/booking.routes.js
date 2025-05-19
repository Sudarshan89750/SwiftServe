"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const booking_controller_1 = require("../controllers/booking.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = express_1.default.Router();
router.get('/', auth_middleware_1.protect, (0, auth_middleware_1.authorize)('admin'), booking_controller_1.getBookings);
router.get('/user', auth_middleware_1.protect, booking_controller_1.getUserBookings);
router.get('/:id', auth_middleware_1.protect, booking_controller_1.getBooking);
router.post('/', auth_middleware_1.protect, booking_controller_1.createBooking);
router.put('/:id/status', auth_middleware_1.protect, booking_controller_1.updateBookingStatus);
exports.default = router;
