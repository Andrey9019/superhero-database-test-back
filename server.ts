import express, { Express, NextFunction, Request, Response } from "express";
import Superhero from "./Superhero";
import mongoose from "mongoose";
import dotenv from "dotenv";
import multer from "multer";
import cors from "cors";
import path from "path";

dotenv.config();

const app: Express = express();
const PORT: number = parseInt(process.env.PORT || "5001", 10);

// Multer
const storage = multer.diskStorage({
  destination: (
    _req: Request,
    _file: Express.Multer.File,
    cb: (error: Error | null, destination: string) => void
  ) => {
    cb(null, "uploads/");
  },
  filename: (
    _req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, filename: string) => void
  ) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (
    _req: Request,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback
  ) => {
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 },
});

// middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "*",
    methods: ["GET", "POST", "DELETE", "PUT"],
    allowedHeaders: ["Content-Type"],
  })
);
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Логування відповідей
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`Request: ${req.method} ${req.url} - Status: ${res.statusCode}`);
  next();
});

// Підключення до MongoDB Atlas
const connectDB = async (): Promise<void> => {
  try {
    const mongoUri: string = process.env.MONGO_URI as string;
    if (!mongoUri) {
      throw new Error("MONGO_URI is not defined in .env");
    }
    await mongoose.connect(mongoUri);
    console.log("MongoDB Atlas connected successfully");
  } catch (err: any) {
    console.error("MongoDB connection error:", err.message);
    process.exit(1); // Завершуємо процес, якщо не вдалося підключитися
  }
};
connectDB();

// Тестовий маршрут
app.get("/", (_req: Request, res: Response) => {
  res.send("Superhero API is running");
});

// СRUD ендпоінти для супергероїв будуть тут

// Створити
app.post(
  "/api/superheroes",
  upload.array("images", 5),
  async (req: Request, res: Response) => {
    try {
      const {
        nickname,
        real_name,
        origin_description,
        superpowers,
        catch_phrase,
      } = req.body;
      if (
        !nickname ||
        !real_name ||
        !origin_description ||
        !superpowers ||
        !catch_phrase
      ) {
        return res.status(400).json({ error: "All fields are required" });
      }
      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        return res
          .status(400)
          .json({ error: "At least one image is required" });
      }
      const imagePaths = files
        ? files.map((file) => `/uploads/${file.filename}`)
        : [];

      const superhero = new Superhero({
        nickname,
        real_name,
        origin_description,
        superpowers:
          typeof superpowers === "string"
            ? JSON.parse(superpowers)
            : superpowers,
        catch_phrase,
        images: imagePaths,
      });
      await superhero.save();
      res.status(201).json(superhero);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
);
// Отримати
app.get("/api/superheroes", async (_req: Request, res: Response) => {
  try {
    const superheroes = await Superhero.find();
    res.status(200).json(superheroes);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
// Отримати по ID
app.get("/api/superheroes/:id", async (req: Request, res: Response) => {
  try {
    const superhero = await Superhero.findById(req.params.id);
    if (!superhero) {
      return res.status(404).json({ error: "Superhero not found" });
    }
    res.status(200).json(superhero);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
// Оновити
app.put(
  "/api/superheroes/:id",
  upload.array("images", 5),
  async (req: Request, res: Response) => {
    try {
      const {
        nickname,
        real_name,
        origin_description,
        superpowers,
        catch_phrase,
      } = req.body;
      if (
        !nickname ||
        !real_name ||
        !origin_description ||
        !superpowers ||
        !catch_phrase
      ) {
        return res.status(400).json({ error: "All fields are required" });
      }
      const files = req.files as Express.Multer.File[];
      const existingImages =
        typeof Image === "string" ? JSON.parse(Image) : Image || [];
      const newImagePaths = files
        ? files.map((file) => `/uploads/${file.filename}`)
        : [];

      const updateData: any = {
        nickname,
        real_name,
        origin_description,
        superpowers:
          typeof superpowers === "string"
            ? JSON.parse(superpowers)
            : superpowers,
        catch_phrase,
        images: [...existingImages, ...newImagePaths],
      };
      const superhero = await Superhero.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true, runValidators: true }
      );
      if (!superhero) {
        return res.status(404).json({ error: "Superhero not found" });
      }

      res.status(200).json(superhero);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
);
// Видалити
app.delete("/api/superheroes/:id", async (req: Request, res: Response) => {
  try {
    const superhero = await Superhero.findByIdAndDelete(req.params.id);
    if (!superhero) {
      return res.status(404).json({ error: "Superhero not found" });
    }
    res.status(200).json({ message: "Superhero deleted" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Завантаження зображень
app.post(
  "/api/superheroes/:id/upload-image",
  upload.array("images", 5),
  async (req: Request, res: Response) => {
    try {
      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        return res.status(400).json({ error: "No images uploaded" });
      }
      const superhero = await Superhero.findById(req.params.id);
      if (!superhero) {
        return res.status(404).json({ error: "Superhero not found" });
      }
      const imagePaths = files.map((file) => `/uploads/${file.filename}`);
      superhero.images = superhero.images || [];
      superhero.images.push(...imagePaths);
      await superhero.save();
      res.status(200).json({ message: "Images uploaded", imagePaths });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
);

// Обробник помилок
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("Error:", err.message);
  res.status(500).json({ error: "Internal Server Error" });
});
// Запуск сервера
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
