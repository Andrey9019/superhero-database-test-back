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
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const Superhero_1 = __importDefault(require("./Superhero"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = parseInt(process.env.PORT || "5001", 10);
// Multer
const storage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, "uploads/");
    },
    filename: (_req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, `${uniqueSuffix}${path_1.default.extname(file.originalname)}`);
    },
});
const upload = (0, multer_1.default)({
    storage,
    fileFilter: (_req, file, cb) => {
        const filetypes = /jpeg|jpg|png/;
        const extname = filetypes.test(path_1.default.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);
        if (extname && mimetype) {
            cb(null, true);
        }
        else {
            cb(null, false);
        }
    },
    limits: { fileSize: 5 * 1024 * 1024 },
});
// middleware
app.use((0, cors_1.default)({
    origin: "*",
    methods: ["GET", "POST", "DELETE", "PUT"],
    allowedHeaders: ["Content-Type"],
}));
app.use(express_1.default.json()); // Парсить JSON-тіла запитів
app.use("/uploads", express_1.default.static("uploads"));
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
app.get("/", (_req, res) => {
    res.send("Superhero API is running");
});
// СRUD ендпоінти для супергероїв будуть тут
// Створити
app.post("/api/superheroes", upload.array("images", 5), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { nickname, real_name, origin_description, superpowers, catch_phrase, } = req.body;
        const files = req.files;
        const imagePaths = files
            ? files.map((file) => `/uploads/${file.filename}`)
            : [];
        const superhero = new Superhero_1.default({
            nickname,
            real_name,
            origin_description,
            superpowers,
            catch_phrase,
            images: imagePaths,
        });
        yield superhero.save();
        res.status(201).json(superhero);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
}));
// Отримати
app.get("/api/superheroes", (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
app.put("/api/superheroes/:id", upload.array("images", 5), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { nickname, real_name, origin_description, superpowers, catch_phrase, } = req.body;
        const files = req.files;
        const imagePaths = files
            ? files.map((file) => `/uploads/${file.filename}`)
            : [];
        //   const superhero = await Superhero.findByIdAndUpdate(
        //     req.params.id,
        //     {
        //       nickname,
        //       real_name,
        //       origin_description,
        //       superpowers,
        //       catch_phrase,
        //       images
        //     },
        //     { new: true, runValidators: true }
        //   );
        //   if (!superhero) {
        //     return res.status(404).json({ error: "Superhero not found" });
        //   }
        //   res.status(200).json(superhero);
        // } catch (err: any) {
        //   res.status(400).json({ error: err.message });
        // }
        const updateData = {
            nickname,
            real_name,
            origin_description,
            superpowers,
            catch_phrase,
        };
        if (imagePaths.length > 0) {
            const superhero = yield Superhero_1.default.findById(req.params.id);
            if (!superhero) {
                return res.status(404).json({ error: "Superhero not found" });
            }
            superhero.images = superhero.images || [];
            superhero.images.push(...imagePaths);
            updateData.images = superhero.images;
        }
        const superhero = yield Superhero_1.default.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
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
// Завантаження зображень
app.post("/api/superheroes/:id/upload-image", upload.array("images", 5), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const files = req.files;
        if (!files || files.length === 0) {
            return res.status(400).json({ error: "No images uploaded" });
        }
        const superhero = yield Superhero_1.default.findById(req.params.id);
        if (!superhero) {
            return res.status(404).json({ error: "Superhero not found" });
        }
        const imagePaths = files.map((file) => `/uploads/${file.filename}`);
        superhero.images = superhero.images || [];
        superhero.images.push(...imagePaths);
        yield superhero.save();
        res.status(200).json({ message: "Images uploaded", imagePaths });
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
}));
// Обробник помилок
app.use((err, req, res, next) => {
    console.error("Error:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
});
// Запуск сервера
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
