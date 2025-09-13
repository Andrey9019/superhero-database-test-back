import mongoose from "mongoose";
import dotenv from "dotenv";
import Superhero from "./Superhero";

dotenv.config();

const connectDB = async (): Promise<void> => {
  try {
    const mongoUri: string = process.env.MONGO_URI as string;
    if (!mongoUri) {
      throw new Error("MONGO_URI is not defined");
    }
    await mongoose.connect(mongoUri);
    console.log("MongoDB Atlas connected successfully");

    // Створюємо тестового супергероя
    const testHero = new Superhero({
      nickname: "IronMan",
      real_name: "Tony Stark",
      origin_description: "Genius inventor who built a powered suit of armor.",
      superpowers: ["Flight", "Super Strength", "Energy Blasts"],
      catch_phrase: "I am Iron Man!",
      images: ["/images/ironman1.jpg"],
    });
    await testHero.save();
    console.log("Test superhero saved successfully:", testHero.nickname);

    // Очищаємо тестовий запис
    await Superhero.deleteOne({ nickname: "IronMan" });
    console.log("Test superhero deleted");
  } catch (err: any) {
    console.error("Error:", err.message);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
};

connectDB();
