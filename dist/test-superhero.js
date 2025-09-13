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
const Superhero_1 = __importDefault(require("./Superhero"));
dotenv_1.default.config();
const connectDB = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const mongoUri = process.env.MONGO_URI;
        if (!mongoUri) {
            throw new Error("MONGO_URI is not defined");
        }
        yield mongoose_1.default.connect(mongoUri);
        console.log("MongoDB Atlas connected successfully");
        // Створюємо тестового супергероя
        const testHero = new Superhero_1.default({
            nickname: "IronMan",
            real_name: "Tony Stark",
            origin_description: "Genius inventor who built a powered suit of armor.",
            superpowers: ["Flight", "Super Strength", "Energy Blasts"],
            catch_phrase: "I am Iron Man!",
            images: ["/images/ironman1.jpg"],
        });
        yield testHero.save();
        console.log("Test superhero saved successfully:", testHero.nickname);
        // Очищаємо тестовий запис
        yield Superhero_1.default.deleteOne({ nickname: "IronMan" });
        console.log("Test superhero deleted");
    }
    catch (err) {
        console.error("Error:", err.message);
    }
    finally {
        yield mongoose_1.default.disconnect();
        console.log("Disconnected from MongoDB");
    }
});
connectDB();
