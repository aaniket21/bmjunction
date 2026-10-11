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
// Note: In a real app, we would add an @authenticateAdmin middleware here.
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
// Get unverified workers
router.get('/unverified', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const workers = yield prisma.worker.findMany({
            where: { verified: false },
            select: {
                id: true,
                name: true,
                trade: true,
                experience: true,
                area: true,
                phone: true,
                createdAt: true,
            }
        });
        res.json({ workers });
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
}));
// Approve a worker
router.put('/:id/approve', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const worker = yield prisma.worker.update({
            where: { id },
            data: { verified: true },
        });
        res.json({ success: true, worker });
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
}));
exports.default = router;
