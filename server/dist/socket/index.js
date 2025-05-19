"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSocketHandlers = void 0;
const socket_handler_1 = require("./socket.handler");
const setupSocketHandlers = (io) => {
    return (0, socket_handler_1.setupSocketHandlers)(io);
};
exports.setupSocketHandlers = setupSocketHandlers;
