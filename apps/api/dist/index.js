"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const auth_1 = __importDefault(require("./auth"));
const worker_1 = __importDefault(require("./worker"));
const admin_1 = __importDefault(require("./admin"));
const search_1 = __importDefault(require("./search"));
const lead_1 = __importDefault(require("./lead"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 3001;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use('/auth', auth_1.default);
app.use('/worker', worker_1.default);
app.use('/admin', admin_1.default);
app.use('/search', search_1.default);
app.use('/lead', lead_1.default);
app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'API is running' });
});
app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
});
