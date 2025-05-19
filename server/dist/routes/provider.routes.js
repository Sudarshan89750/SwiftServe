"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const provider_controller_1 = require("../controllers/provider.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = express_1.default.Router();
router.get('/', provider_controller_1.getProviders);
router.get('/nearby', provider_controller_1.getNearbyProviders);
router.get('/:id', provider_controller_1.getProvider);
router.post('/', auth_middleware_1.protect, provider_controller_1.createProvider);
router.put('/:id', auth_middleware_1.protect, provider_controller_1.updateProvider);
router.delete('/:id', auth_middleware_1.protect, provider_controller_1.deleteProvider);
exports.default = router;
