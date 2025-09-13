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
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const connectAndTestDB = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const mongoUri = process.env.MONGO_URI;
        if (!mongoUri) {
            throw new Error("MONGO_URI is not defined in .env");
        }
        yield mongoose_1.default.connect(mongoUri);
        console.log("MongoDB Atlas connected successfully");
        // Тест: Створити просту модель і зберегти документ (створить колекцію автоматично)
        const testSchema = new mongoose_1.default.Schema({ name: String });
        const Test = mongoose_1.default.model("Test", testSchema);
        const testDoc = new Test({ name: "Test Document" });
        yield testDoc.save();
        console.log("Test document saved successfully - database is working!");
        // Очистити тестовий документ
        yield Test.deleteOne({ name: "Test Document" });
        console.log("Test completed and cleaned up.");
    }
    catch (err) {
        console.error("MongoDB connection/test error:", err.message);
        if (err.name === "MongoServerError" && err.code === 403) {
            console.error("403 error: Check IP whitelist, user permissions, or database name.");
        }
    }
    finally {
        yield mongoose_1.default.disconnect();
        console.log("Disconnected from MongoDB.");
    }
});
connectAndTestDB();
