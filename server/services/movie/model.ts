import { Document, Model, Schema } from "mongoose";
import { autoIncrement, mongoose } from "../../config/database";

export interface IMovie extends Document {
  title: string;
  description: string;
  cert: string;
  url: string;
  poster: string;
  genre: [string];
  runtime: number;
  releasedate: Date;
  rating: number;
}

const movieSchema = new Schema({
  title: String,
  description: String,
  cert: String,
  url: String,
  poster: String,
  genre: [String],
  runtime: Number,
  releasedate: Date,
  rating: Number
});

movieSchema.plugin(autoIncrement.plugin, { model: "Movie", startAt: 1 });

const Movie = mongoose.model<IMovie>("Movie", movieSchema, "Movies");

export class MovieModel {
  constructor() {}

  static create(props?: any): Promise<number> {
    const model = new Movie(props);

    return new Promise<number>((resolve, reject) => {
      model.save((err: any, result: IMovie) => {
        if (err || !result) {
          reject(err);
        }

        resolve(result && result._id);
      });
    });
  }

  static update(id: number, update: any): Promise<IMovie> {
    return new Promise<IMovie>((resolve, reject) => {
      Movie.findByIdAndUpdate(id, update, (err: any, result: IMovie) => {
        if (err) {
          reject(err);
        }

        resolve(result);
      });
    });
  }

  static find(query: any = {}, sortField?: string, limitCount?: number, skipCount?: number): Promise<IMovie[]> {
    return new Promise<IMovie[]>((resolve, reject) => {
      Movie.find(query).sort(sortField && { sortField: -1 }).limit(limitCount).skip(skipCount).exec((err: any, result: IMovie[]) => {
        if (err) {
          reject(err);
        }

        resolve(result);
      });
    });
  }

  static findById(id: number): Promise<IMovie> {
    return new Promise<IMovie>((resolve, reject) => {
      Movie.findById(id, (err: any, result: IMovie) => {
        if (err) {
          reject(err);
        }

        resolve(result);
      });
    });
  }

  static aggregate(query: any): Promise<any[]> {
    return new Promise<any[]>((resolve, reject) => {
      Movie.aggregate(query, (err: any, result: any[]) => {
        if (err) {
          reject(err);
        }

        resolve(result);
      });
    });
  }
}

Object.seal(MovieModel);
