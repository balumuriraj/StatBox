import { Document, Model, Schema } from "mongoose";
import { autoIncrement, mongoose } from "../../config/database";

export interface IMovie extends Document {
  name: string;
  url: string;
  poster: string;
  genre: [string];
  runtime: number;
  releasedate: Date;
  castIds: [number];
  crewIds: [number];
}

// To remove deprecation error
// mongoose.Promise = global.Promise;

const movieSchema = new Schema({
  name: String,
  url: String,
  poster: String,
  genre: [String],
  runtime: Number,
  releasedate: Date,
  castIds: [Number],
  crewIds: [Number]
});

movieSchema.plugin(autoIncrement.plugin, { model: "Movie", startAt: 1 });

const Movie = mongoose.model<IMovie>("Movie", movieSchema, "Movies");

export class MovieModel {
  constructor() {}

  static create(props?: any): Promise<string> {
    const model = new Movie(props);

    return new Promise<string>((resolve, reject) => {
      model.save((err: any, result: IMovie) => {
        if (err) {
          reject(err);
        }

        resolve(result._id);
      });
    });
  }

  static update(id: string, update: any): Promise<IMovie> {
    return new Promise<IMovie>((resolve, reject) => {
      Movie.findByIdAndUpdate(id, update, (err: any, result: IMovie) => {
        if (err) {
          reject(err);
        }

        resolve(result);
      });
    });
  }

  static find(query: any = {}): Promise<IMovie[]> {
    return new Promise<IMovie[]>((resolve, reject) => {
      Movie.find(query, (err: any, result: IMovie[]) => {
        if (err) {
          reject(err);
        }

        resolve(result);
      });
    });
  }

  static findById(id: string): Promise<IMovie> {
    return new Promise<IMovie>((resolve, reject) => {
      Movie.findById(id, (err: any, result: IMovie) => {
        if (err) {
          reject(err);
        }

        resolve(result);
      });
    });
  }

  static aggregate(fields, where: any): Promise<IMovie[]> {
    return new Promise<IMovie[]>((resolve, reject) => {
      const query = [
        { $addFields: fields },
        { $match: where }
      ];

      Movie.aggregate(query, (err: any, result: IMovie[]) => {
        if (err) {
          reject(err);
        }

        resolve(result);
      });
    });
  }
}

Object.seal(MovieModel);
