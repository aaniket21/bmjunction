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
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
// Get workers by category with optional search/filter
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { trade, search, area } = req.query;
        const workers = yield prisma.worker.findMany({
            where: Object.assign(Object.assign(Object.assign({ verified: true }, (trade && { trade: trade })), (area && { area: { contains: area, mode: 'insensitive' } })), (search && {
                OR: [
                    { name: { contains: search, mode: 'insensitive' } },
                    { about: { contains: search, mode: 'insensitive' } },
                ],
            })),
            select: {
                id: true,
                name: true,
                trade: true,
                experience: true,
                area: true,
                about: true,
                verified: true,
                // Don't select phone here to protect privacy, force lead tracking instead
            }
        });
        res.json({ workers });
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
}));
exports.default = router;
