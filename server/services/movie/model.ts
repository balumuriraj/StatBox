import { Document } from "mongoose";
import { mongoose } from "../../config/database";
import { CounterModel } from "../counter/model";

export interface IMovie extends Document {
  movieId: number;
  algoliaId: string;
  title: string;
  description: string;
  cert: string;
  poster: string;
  genre: [string];
  runtime: number;
  releaseDate: Date;
  hash: string;
}

const movieSchema = new mongoose.Schema({
  movieId: Number,
  algoliaId: String,
  title: String,
  description: String,
  cert: String,
  poster: String,
  genre: [String],
  runtime: Number,
  releaseDate: Date,
  hash: String
});
movieSchema.index({movieId: 1}, {unique: true});
movieSchema.index({ title: "text" });
movieSchema.pre("save", async function(next) {
  const result = await CounterModel.findOneAndUpdate({ name: "Movie", field: "movieId" });
  (this as any).movieId = result.count;
  next();
});

const Movie = mongoose.model<IMovie>("Movie", movieSchema, "Movies");

export class MovieModel {
  constructor() {}

  static async create(props?: any): Promise<IMovie> {
    const model = new Movie(props);
    return model.save();
  }

  static async update(movieId: number, update: any): Promise<IMovie> {
    const options = { upsert: true, returnNewDocument: true, new: true };
    return Movie.findOneAndUpdate({ movieId }, update, options).exec();
  }

  static async bulkUpdate(queries: any[], updates: any[]): Promise<any> {
    const bulk = Movie.collection.initializeUnorderedBulkOp();
    const length = queries.length;

    for (let i = 0; i < length; i++) {
      bulk.find(queries[i]).update(updates[i]);
    }

    return bulk.execute();
  }

  static async find(query: any[] = [], sort?: any, limitCount?: number, skipCount?: number): Promise<IMovie[]> {
    return Movie.find(...query).sort(sort).limit(limitCount).skip(skipCount).exec();
  }

  static async findById(movieId: number): Promise<IMovie> {
    return Movie.findOne({ movieId }).exec();
  }

  static async aggregate(query: any): Promise<any[]> {
    return Movie.aggregate(query).allowDiskUse(true).exec();
  }

  static async count(query?: any): Promise<number> {
    return Movie.countDocuments(query || {}).exec();
  }

  static async deleteMany(query: any): Promise<any> {
    return Movie.deleteMany(query).exec();
  }

  static async deleteOne(movieId: number): Promise<any> {
    return Movie.deleteOne({ movieId }).exec();
  }
}

Object.seal(MovieModel);
