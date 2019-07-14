import { Document, Schema } from "mongoose";
import { mongoose } from "../../config/database";
import { CounterModel } from "../counter/model";

export interface IGenre extends Document {
  genreId: number;
  name: string;
  movieIds: [number];
}

const genreSchema = new Schema({
  genreId: Number,
  name: String,
  movieIds: [Number]
});
genreSchema.index({genreId: 1}, {unique: true});
genreSchema.pre("save", async function(next) {
  const result = await CounterModel.findOneAndUpdate({ name: "Genre", field: "genreId" });
  (this as any).genreId = result.count;
  next();
});

const Genre = mongoose.model<IGenre>("Genre", genreSchema, "Genres");

export class GenreModel {
  constructor() {}

  static async create(props?: any): Promise<IGenre> {
    const model = new Genre(props);
    return model.save();
  }

  static async updateMany(query: any, update: any): Promise<IGenre[]> {
    return Genre.updateMany(query, update).exec();
  }

  static async findByIdAndUpdate(genreId: number, update: any): Promise<IGenre> {
    const options = { upsert: true, returnNewDocument: true, new: true };
    return Genre.findOneAndUpdate({ genreId }, update, options).exec();
  }

  static async find(query: any[] = [], sort?: any, limitCount?: number, skipCount?: number): Promise<IGenre[]> {
    return Genre.find(...query).sort(sort).limit(limitCount).skip(skipCount).exec();
  }

  static async findById(genreId: number): Promise<IGenre> {
    return Genre.findOne({ genreId }).exec();
  }

  static async aggregate(query: any): Promise<any[]> {
    return Genre.aggregate(query).exec();
  }
}

Object.seal(GenreModel);
