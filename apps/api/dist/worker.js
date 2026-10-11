"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const middleware_1 = require("./middleware");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
// Get worker profile
router.get('/profile', middleware_1.authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const workerId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const worker = yield prisma.worker.findUnique({
            where: { id: workerId },
            select: {
                id: true,
                name: true,
                trade: true,
                experience: true,
                area: true,
                phone: true,
                about: true,
                verified: true,
                createdAt: true,
            }
        });
        if (!worker) {
            res.status(404).json({ error: 'Worker not found' });
            return;
        }
        res.json({ worker });
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
}));
// Update worker profile
router.put('/profile', middleware_1.authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const workerId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const { name, experience, area, about } = req.body;
        const worker = yield prisma.worker.update({
            where: { id: workerId },
            data: Object.assign(Object.assign(Object.assign(Object.assign({}, (name && { name })), (experience && { experience: Number(experience) })), (area && { area })), (about !== undefined && { about })),
            select: {
                id: true,
                name: true,
                trade: true,
                experience: true,
                area: true,
                phone: true,
                about: true,
                verified: true,
            }
        });
        res.json({ worker });
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
}));
exports.default = router;
