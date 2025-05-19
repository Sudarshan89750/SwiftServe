"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const review_controller_1 = require("../controllers/review.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = express_1.default.Router();
router.get('/', review_controller_1.getReviews);
router.get('/provider/:providerId', review_controller_1.getProviderReviews);
router.get('/service/:serviceId', review_controller_1.getServiceReviews);
router.post('/', auth_middleware_1.protect, review_controller_1.createReview);
router.put('/:id', auth_middleware_1.protect, review_controller_1.updateReview);
router.delete('/:id', auth_middleware_1.protect, review_controller_1.deleteReview);
exports.default = router;
