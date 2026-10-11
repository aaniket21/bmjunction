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
// Log a lead (contact click)
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { workerId, type } = req.body;
        if (!workerId || !type) {
            res.status(400).json({ error: 'workerId and type are required' });
            return;
        }
        const lead = yield prisma.lead.create({
            data: {
                workerId,
                type, // 'call' or 'whatsapp'
            }
        });
        res.json({ success: true, lead });
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
}));
exports.default = router;
