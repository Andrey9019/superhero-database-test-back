import mongoose, { Schema, Document } from "mongoose";

interface ISuperhero extends Document {
  nickname: string;
  real_name: string;
  origin_description: string;
  superpowers: string[];
  catch_phrase: string;
  images: string[];
}

const superheroSchema: Schema = new Schema<ISuperhero>(
  {
    nickname: { type: String, required: true },
    real_name: { type: String, required: true },
    origin_description: { type: String, required: true },
    superpowers: { type: [String], required: true },
    catch_phrase: { type: String, required: true },
    images: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

const Superhero = mongoose.model<ISuperhero>("Superhero", superheroSchema);
export default Superhero;
