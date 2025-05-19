"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_controller_1 = require("../controllers/user.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = express_1.default.Router();
router.get('/', auth_middleware_1.protect, (0, auth_middleware_1.authorize)('admin'), user_controller_1.getUsers);
router.get('/:id', auth_middleware_1.protect, user_controller_1.getUser);
router.put('/:id', auth_middleware_1.protect, user_controller_1.updateUser);
router.delete('/:id', auth_middleware_1.protect, (0, auth_middleware_1.authorize)('admin'), user_controller_1.deleteUser);
exports.default = router;
