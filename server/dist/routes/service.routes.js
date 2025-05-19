"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const service_controller_1 = require("../controllers/service.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = express_1.default.Router();
router.get('/', service_controller_1.getServices);
router.get('/:id', service_controller_1.getService);
router.post('/', auth_middleware_1.protect, (0, auth_middleware_1.authorize)('admin'), service_controller_1.createService);
router.put('/:id', auth_middleware_1.protect, (0, auth_middleware_1.authorize)('admin'), service_controller_1.updateService);
router.delete('/:id', auth_middleware_1.protect, (0, auth_middleware_1.authorize)('admin'), service_controller_1.deleteService);
router.get('/:id/providers', service_controller_1.getServiceProviders);
exports.default = router;
