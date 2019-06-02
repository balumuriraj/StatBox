import { Document, Model, Schema } from "mongoose";
import { autoIncrement, mongoose } from "../../config/database";

export interface IMovie extends Document {
  title: string;
  description: string;
  cert: string;
  poster: string;
  genre: [string];
  runtime: number;
  releasedate: Date;
}

const movieSchema = new Schema({
  title: String,
  description: String,
  cert: String,
  poster: String,
  genre: [String],
  runtime: Number,
  releasedate: Date
});

movieSchema.plugin(autoIncrement.plugin, { model: "Movie", startAt: 1 });
movieSchema.index({ title: "text" });

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

  static find(query: any[] = [], sort?: any, limitCount?: number, skipCount?: number): Promise<IMovie[]> {
    return new Promise<IMovie[]>((resolve, reject) => {
      Movie.find(...query).sort(sort).limit(limitCount).skip(skipCount).exec((err: any, result: IMovie[]) => {
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
      Movie.aggregate(query).allowDiskUse(true).exec((err: any, result: any[]) => {
        if (err) {
          reject(err);
        }

        resolve(result);
      });
    });
  }
}

Object.seal(MovieModel);
