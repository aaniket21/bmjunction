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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';
router.post('/signup', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, trade, experience, area, phone, password } = req.body;
        if (!name || !trade || !experience || !area || !phone || !password) {
            res.status(400).json({ error: 'All fields are required' });
            return;
        }
        const existingWorker = yield prisma.worker.findUnique({ where: { phone } });
        if (existingWorker) {
            res.status(400).json({ error: 'Worker with this phone already exists' });
            return;
        }
        const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
        const worker = yield prisma.worker.create({
            data: {
                name,
                trade,
                experience: Number(experience),
                area,
                phone,
                password: hashedPassword,
            }
        });
        const token = jsonwebtoken_1.default.sign({ id: worker.id, phone: worker.phone }, JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, worker: { id: worker.id, name: worker.name, phone: worker.phone } });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
}));
router.post('/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { phone, password } = req.body;
        if (!phone || !password) {
            res.status(400).json({ error: 'Phone and password are required' });
            return;
        }
        const worker = yield prisma.worker.findUnique({ where: { phone } });
        if (!worker) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }
        const isValid = yield bcryptjs_1.default.compare(password, worker.password);
        if (!isValid) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }
        const token = jsonwebtoken_1.default.sign({ id: worker.id, phone: worker.phone }, JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, worker: { id: worker.id, name: worker.name, phone: worker.phone } });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
}));
exports.default = router;
