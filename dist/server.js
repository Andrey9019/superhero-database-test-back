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
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const Superhero_1 = __importDefault(require("./Superhero"));
dotenv_1.default.config(); // Завантажуємо змінні з .env
const app = (0, express_1.default)();
const PORT = parseInt(process.env.PORT || "5001", 10);
// Middleware
app.use((0, cors_1.default)({
    origin: "*",
    methods: ["GET", "POST", "DELETE", "UPDATE", "PUT", "PATCH"],
    allowedHeaders: ["Content-Type"],
}));
app.use(express_1.default.json()); // Парсить JSON-тіла запитів
// Логування відповідей
app.use((req, res, next) => {
    const originalSend = res.send;
    res.send = function (body) {
        console.log(`Response: ${body}`);
        console.log(`Request: ${req.method} ${req.path} - Status: ${res.statusCode}`);
        console.log(`Response body: ${body}`);
        return originalSend.call(this, body);
    };
    next();
});
// Підключення до MongoDB Atlas
const connectDB = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const mongoUri = process.env.MONGO_URI;
        if (!mongoUri) {
            throw new Error("MONGO_URI is not defined in .env");
        }
        yield mongoose_1.default.connect(mongoUri);
        console.log("MongoDB Atlas connected successfully");
    }
    catch (err) {
        console.error("MongoDB connection error:", err.message);
        process.exit(1); // Завершуємо процес, якщо не вдалося підключитися
    }
});
connectDB();
// Тестовий маршрут
app.get("/", (req, res) => {
    res.send("Superhero API is running");
});
// СRUD ендпоінти для супергероїв будуть тут
// Створити
app.post("/api/superheroes", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { nickname, real_name, origin_description, superpowers, catch_phrase, images, } = req.body;
        const superhero = new Superhero_1.default({
            nickname,
            real_name,
            origin_description,
            superpowers,
            catch_phrase,
            images,
        });
        yield superhero.save();
        res.status(201).json(superhero);
        console.log("Superhero created successfully:", superhero.nickname);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
        console.error("Error creating superhero:", error.message);
    }
}));
// Отримати
app.get("/api/superheroes", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const superheroes = yield Superhero_1.default.find();
        res.status(200).json(superheroes);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
}));
// Отримати по ID
app.get("/api/superheroes/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const superhero = yield Superhero_1.default.findById(req.params.id);
        if (!superhero) {
            return res.status(404).json({ error: "Superhero not found" });
        }
        res.status(200).json(superhero);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
}));
// Оновити
app.put("/api/superheroes/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { nickname, real_name, origin_description, superpowers, catch_phrase, images, } = req.body;
        const superhero = yield Superhero_1.default.findByIdAndUpdate(req.params.id, {
            nickname,
            real_name,
            origin_description,
            superpowers,
            catch_phrase,
            images,
        }, { new: true, runValidators: true });
        if (!superhero) {
            return res.status(404).json({ error: "Superhero not found" });
        }
        res.status(200).json(superhero);
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
}));
// Видалити
app.delete("/api/superheroes/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const superhero = yield Superhero_1.default.findByIdAndDelete(req.params.id);
        if (!superhero) {
            return res.status(404).json({ error: "Superhero not found" });
        }
        res.status(200).json({ message: "Superhero deleted" });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
}));
// Обробник помилок
app.use((err, req, res, next) => {
    console.error("Error:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
});
// Запуск сервера
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
